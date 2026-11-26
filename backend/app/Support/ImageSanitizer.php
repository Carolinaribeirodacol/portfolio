<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Decodes and re-encodes an image with GD so that only pixel data survives:
 * metadata, trailing bytes and anything smuggled inside chunks (e.g. a
 * "GIF89a<?php ..." polyglot) are discarded.
 */
class ImageSanitizer
{
    public const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    public const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    /** Longest side, in pixels. */
    public const MAX_SIDE = 6000;

    /** Decompression-bomb guard: width * height. */
    public const MAX_PIXELS = 25_000_000;

    /** Matches .php, .php5, .phtml, .phar, .pht, .phps, .inc anywhere in a name. */
    public const DANGEROUS_NAME_PATTERN = '/\.(php\d*|phtml|pht|phar|phps|inc)(\.|$)/i';

    private const MIME_TO_EXTENSION = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public static function extensionForMime(string $mime): ?string
    {
        return self::MIME_TO_EXTENSION[strtolower($mime)] ?? null;
    }

    /**
     * Allowed extension for the image type in the file header, or null.
     */
    public static function detectExtension(string $contents): ?string
    {
        $info = $contents === '' ? false : @getimagesizefromstring($contents);

        return $info === false ? null : self::extensionForMime($info['mime'] ?? '');
    }

    public static function normalizeExtension(string $extension): string
    {
        $extension = strtolower($extension);

        return $extension === 'jpeg' ? 'jpg' : $extension;
    }

    /**
     * @return array{contents: string, extension: string, mime: string}
     */
    public static function sanitize(string $contents): array
    {
        $info = @getimagesizefromstring($contents);

        if ($info === false) {
            throw new InvalidArgumentException('Not an image.');
        }

        [$width, $height] = $info;
        $mime = $info['mime'] ?? '';
        $extension = self::extensionForMime($mime);

        if ($extension === null) {
            throw new InvalidArgumentException("Image type {$mime} is not allowed.");
        }

        if ($width < 1 || $height < 1 || $width > self::MAX_SIDE || $height > self::MAX_SIDE || $width * $height > self::MAX_PIXELS) {
            throw new InvalidArgumentException('Image dimensions are not allowed.');
        }

        $image = @imagecreatefromstring($contents);

        if ($image === false) {
            throw new InvalidArgumentException('Image could not be decoded.');
        }

        if ($extension !== 'jpg') {
            imagealphablending($image, false);
            imagesavealpha($image, true);
        }

        ob_start();

        try {
            $ok = match ($extension) {
                'jpg' => imagejpeg($image, null, 88),
                'png' => imagepng($image, null, 6),
                'webp' => imagewebp($image, null, 88),
            };
        } finally {
            $output = (string) ob_get_clean();
            unset($image);
        }

        if (! $ok || $output === '') {
            throw new InvalidArgumentException('Image could not be re-encoded.');
        }

        return ['contents' => $output, 'extension' => $extension, 'mime' => $mime];
    }
}
