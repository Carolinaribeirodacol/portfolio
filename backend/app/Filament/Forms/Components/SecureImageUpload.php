<?php

namespace App\Filament\Forms\Components;

use App\Rules\ConsistentImageName;
use App\Support\ImageSanitizer;
use App\Support\RequestContext;
use Filament\Forms\Components\FileUpload;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * Image upload field hardened after the 2026-11 incident.
 *
 * - Allowlist only: JPEG, PNG and WebP, checked against the file *content*
 *   (mimetypes/mimes via finfo) AND the client extension (extensions). SVG
 *   and anything else is rejected.
 * - The client extension must agree with the detected type, and names that
 *   carry a PHP-ish extension anywhere (x.php.jpg) are rejected outright.
 * - Files are re-encoded with GD before being stored, so payloads appended
 *   to or embedded in a valid image (polyglots) never reach the disk.
 * - The stored name is server-generated: <uuid>.<ext from detected type>.
 * - Every stored upload is logged with user, IP and original name.
 */
class SecureImageUpload
{
    public const MAX_KILOBYTES = 10240;

    public static function make(string $name): FileUpload
    {
        return FileUpload::make($name)
            ->acceptedFileTypes(ImageSanitizer::ALLOWED_MIME_TYPES)
            ->rules([
                'mimes:'.implode(',', ImageSanitizer::ALLOWED_EXTENSIONS),
                'extensions:'.implode(',', ImageSanitizer::ALLOWED_EXTENSIONS),
                'dimensions:max_width='.ImageSanitizer::MAX_SIDE.',max_height='.ImageSanitizer::MAX_SIDE,
                new ConsistentImageName,
            ])
            ->maxSize(self::MAX_KILOBYTES)
            // Same disk the models build URLs from (Storage::url on the default
            // disk). Without this Filament falls back to FILAMENT_FILESYSTEM_DISK,
            // default "public" (storage/app/public), not the S3 bucket.
            ->disk(static fn (): string => config('filesystems.default'))
            ->visibility('public')
            ->directory('projects')
            ->saveUploadedFileUsing(static function (FileUpload $component, TemporaryUploadedFile $file): ?string {
                try {
                    $sanitized = ImageSanitizer::sanitize((string) $file->get());
                } catch (InvalidArgumentException) {
                    throw ValidationException::withMessages([
                        $component->getStatePath() => 'A imagem enviada é inválida.',
                    ]);
                }

                $path = trim($component->getDirectory().'/'.Str::uuid().'.'.$sanitized['extension'], '/');

                $component->getDisk()->put($path, $sanitized['contents'], ['visibility' => 'public']);

                Log::notice('file_upload', [
                    ...RequestContext::toArray(),
                    'field' => $component->getName(),
                    'original_name' => $file->getClientOriginalName(),
                    'client_mime' => $file->getClientMimeType(),
                    'detected_mime' => $sanitized['mime'],
                    'size' => $file->getSize(),
                    'disk' => $component->getDiskName(),
                    'stored_path' => $path,
                ]);

                return $path;
            });
    }
}
