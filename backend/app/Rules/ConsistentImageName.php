<?php

namespace App\Rules;

use App\Support\ImageSanitizer;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * Rejects a PHP-ish extension anywhere in the name (x.php.jpg, a.phtml.png)
 * and a client extension that does not match the type detected from the
 * content (a GIF/PHP polyglot named foto.jpg).
 */
class ConsistentImageName implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            return;
        }

        if (preg_match(ImageSanitizer::DANGEROUS_NAME_PATTERN, $value->getClientOriginalName())) {
            $fail('O nome do arquivo contém uma extensão não permitida.');

            return;
        }

        // Detect from the bytes ourselves rather than trusting getMimeType():
        // the image header is what GD will decode later.
        $detected = ImageSanitizer::detectExtension($this->contents($value));
        $client = ImageSanitizer::normalizeExtension($value->getClientOriginalExtension());

        if ($detected === null || $client !== $detected) {
            $fail('A extensão do arquivo não corresponde ao conteúdo.');
        }
    }

    private function contents(UploadedFile $file): string
    {
        if ($file instanceof TemporaryUploadedFile) {
            return (string) $file->get();
        }

        return (string) @file_get_contents($file->getRealPath() ?: $file->getPathname());
    }
}
