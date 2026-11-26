<?php

/*
| The 2026-11 incident: prove that webshells and active content cannot be
| stored through the admin image uploads, at either layer:
|   1. Livewire's temporary upload (config/livewire.php rules), and
|   2. the Filament field (App\Filament\Forms\Components\SecureImageUpload),
| and that what IS stored is a re-encoded image under a server-made name.
*/

use App\Filament\Resources\ProjectResource\Pages\CreateProject;
use App\Filament\Resources\ProjectResource\Pages\EditProject;
use App\Filament\Resources\ProjectResource\RelationManagers\ImagesRelationManager;
use App\Models\Project;
use App\Models\Technology;
use App\Models\User;
use App\Rules\ConsistentImageName;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Livewire\Features\SupportFileUploads\FileUploadConfiguration;
use Livewire\Livewire;

uses(RefreshDatabase::class);

const WEBSHELL = "GIF89a<?php system(\$_GET['c']); ?>";
const SVG_XSS = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(document.cookie)</script></svg>';

beforeEach(function () {
    config(['filesystems.default' => 'public']);
    Storage::fake('public');

    $this->admin = User::factory()->create(['email' => config('app.admin_email')]);
    $this->actingAs($this->admin);

    $this->technology = Technology::forceCreate(['name' => 'Laravel']);
});

function pngBytes(int $width = 4, int $height = 4): string
{
    $image = imagecreatetruecolor($width, $height);
    ob_start();
    imagepng($image);

    return (string) ob_get_clean();
}

/** A real file on disk, so finfo sees the actual bytes (no testing fakes). */
function realUpload(string $name, string $contents): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'upl');
    file_put_contents($path, $contents);

    return new UploadedFile($path, $name, null, null, true);
}

dataset('malicious uploads', [
    'shell.php' => ['shell.php', WEBSHELL],
    'x.php5' => ['x.php5', WEBSHELL],
    'x.phtml' => ['x.phtml', WEBSHELL],
    'x.php.jpg' => ['x.php.jpg', WEBSHELL],
    'evil.svg' => ['evil.svg', SVG_XSS],
    'GIF/PHP polyglot named foto.png' => ['foto.png', WEBSHELL],
    'real PNG named a.php' => ['a.php', pngBytes()],
    'real PNG named a.php.png' => ['a.php.png', pngBytes()],
    'real PNG named a.phtml.png' => ['a.phtml.png', pngBytes()],
]);

it('is refused by the Livewire temporary upload rules', function (string $name, string $contents) {
    $validator = Validator::make(
        ['files' => [realUpload($name, $contents)]],
        ['files.*' => FileUploadConfiguration::rules()],
    );

    expect($validator->fails())->toBeTrue();
})->with('malicious uploads');

it('is refused by the image field rules', function (string $name, string $contents) {
    $validator = Validator::make(
        ['image' => realUpload($name, $contents)],
        ['image' => [
            'file',
            'mimetypes:image/jpeg,image/png,image/webp',
            'mimes:jpg,jpeg,png,webp',
            'extensions:jpg,jpeg,png,webp',
            new ConsistentImageName,
        ]],
    );

    expect($validator->fails())->toBeTrue();
})->with('malicious uploads');

it('is never stored through the project form', function (string $name, string $contents) {
    $component = Livewire::test(CreateProject::class)->fillForm([
        'title' => 'Projeto',
        'slug' => 'projeto',
        'description' => 'x',
        'image' => UploadedFile::fake()->createWithContent($name, $contents),
        'technologies' => [$this->technology->id],
        'status' => 'em andamento',
    ]);

    $refusedOnUpload = $component->errors()->has('data.image');

    if (! $refusedOnUpload) {
        $component->call('create')->assertHasFormErrors(['image']);
    }

    expect(Storage::disk('public')->allFiles())->toBe([])
        ->and(Project::whereNotNull('image')->exists())->toBeFalse();
})->with('malicious uploads');

it('is never stored through the project gallery', function (string $name, string $contents) {
    $project = Project::forceCreate(['title' => 'P', 'slug' => 'p', 'description' => 'x']);

    $component = Livewire::test(ImagesRelationManager::class, [
        'ownerRecord' => $project,
        'pageClass' => EditProject::class,
    ])
        ->mountTableAction('create')
        ->setTableActionData(['image_path' => UploadedFile::fake()->createWithContent($name, $contents)]);

    if (! $component->errors()->has('mountedTableActionsData.0.image_path')) {
        $component->callMountedTableAction()->assertHasTableActionErrors(['image_path']);
    }

    expect(Storage::disk('public')->allFiles())->toBe([])
        ->and($project->images()->exists())->toBeFalse();
})->with('malicious uploads');

it('stores a real image re-encoded, under a server-generated name, and logs it', function () {
    Log::spy();

    Livewire::test(CreateProject::class)
        ->fillForm([
            'title' => 'Projeto',
            'slug' => 'projeto',
            'description' => 'x',
            'image' => UploadedFile::fake()->createWithContent('Minha Foto.PNG', pngBytes(40, 30)),
            'technologies' => [$this->technology->id],
            'status' => 'em andamento',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $files = Storage::disk('public')->allFiles();

    expect($files)->toHaveCount(1)
        ->and($files[0])->toMatch('#^projects/[0-9a-f]{8}-[0-9a-f-]{27}\.png$#')
        ->and(Project::first()->image)->toBe($files[0])
        ->and(getimagesizefromstring(Storage::disk('public')->get($files[0])))->toMatchArray([0 => 40, 1 => 30, 'mime' => 'image/png']);

    Log::shouldHaveReceived('notice')->withArgs(fn ($message, $context = []) => $message === 'file_upload'
        && $context['original_name'] === 'Minha Foto.PNG'
        && $context['user_id'] === $this->admin->id
        && $context['stored_path'] === $files[0]
        && array_key_exists('ip', $context));
});

it('strips a payload appended to a valid image', function () {
    Livewire::test(CreateProject::class)
        ->fillForm([
            'title' => 'Projeto',
            'slug' => 'projeto',
            'description' => 'x',
            'image' => UploadedFile::fake()->createWithContent('foto.png', pngBytes()."<?php system(\$_GET['c']); ?>"),
            'technologies' => [$this->technology->id],
            'status' => 'em andamento',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $stored = Storage::disk('public')->get(Storage::disk('public')->allFiles()[0]);

    expect($stored)->not->toContain('<?php')
        ->and(getimagesizefromstring($stored)['mime'])->toBe('image/png');
});
