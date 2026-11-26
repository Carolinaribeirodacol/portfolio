<?php

/*
| CVE-2026-48500: Filament auth pages let guests use Livewire's temporary
| upload endpoint. config/livewire.php now requires an authenticated session.
*/

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

uses(RefreshDatabase::class);

function signedUploadUrl(): string
{
    return URL::temporarySignedRoute('livewire.upload-file', now()->addMinutes(5), absolute: false);
}

function pngFile(string $name = 'a.png'): UploadedFile
{
    return UploadedFile::fake()->image($name, 10, 10);
}

beforeEach(function () {
    Storage::fake('tmp-for-tests');
});

it('rejects guests even with a valid signature', function () {
    $response = $this->post(signedUploadUrl(), ['files' => [pngFile()]]);

    expect($response->status())->toBeIn([302, 401, 403])
        ->and(Storage::disk('tmp-for-tests')->allFiles())->toBe([]);
});

it('rejects a guest posting a php file', function () {
    $this->post(signedUploadUrl(), [
        'files' => [UploadedFile::fake()->createWithContent('shell.php', "GIF89a<?php system(\$_GET['c']);")],
    ]);

    expect(Storage::disk('tmp-for-tests')->allFiles())->toBe([]);
});

it('rejects a php file from the admin too', function () {
    $this->actingAs(User::factory()->create(['email' => config('app.admin_email')]));

    $this->postJson(signedUploadUrl(), [
        'files' => [UploadedFile::fake()->createWithContent('shell.php', "GIF89a<?php system(\$_GET['c']);")],
    ])->assertUnprocessable();

    expect(Storage::disk('tmp-for-tests')->allFiles())->toBe([]);
});

it('accepts an image from an authenticated user', function () {
    $this->actingAs(User::factory()->create(['email' => config('app.admin_email')]));

    $this->postJson(signedUploadUrl(), ['files' => [pngFile()]])->assertOk();

    expect(Storage::disk('tmp-for-tests')->allFiles())->toHaveCount(1);
});

it('keeps temporary uploads off the public bucket', function () {
    expect(config('livewire.temporary_file_upload.disk'))->toBe('local')
        ->and(config('filesystems.disks.local.root'))->toBe(storage_path('app/private'));
});
