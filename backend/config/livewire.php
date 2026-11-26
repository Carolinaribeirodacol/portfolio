<?php

/*
| Only the keys we change are here; Livewire merges the rest of its defaults.
| Livewire merges top-level keys only, so `temporary_file_upload` must be
| complete.
|
| Hardened after the 2026-11 incident: Livewire's temporary upload endpoint
| (/livewire/upload-file) used to accept ANY file type, keep the client
| extension, store it on the default disk (the public S3 bucket) and, through
| Filament's login page, be reachable without authentication
| (CVE-2026-48500).
*/

use App\Support\ImageSanitizer;

return [

    'temporary_file_upload' => [
        // Private local disk (storage/app/private/livewire-tmp): never the public bucket.
        'disk' => env('LIVEWIRE_TMP_DISK', 'local'),
        'rules' => [
            'required',
            'file',
            'max:10240',
            'mimes:'.implode(',', ImageSanitizer::ALLOWED_EXTENSIONS),
            'extensions:'.implode(',', ImageSanitizer::ALLOWED_EXTENSIONS),
            // App\Rules\ConsistentImageName, registered in AppServiceProvider.
            // A string, not an object: this file must survive config:cache.
            'consistent_image_name',
        ],
        'directory' => null,
        // Only an authenticated session may upload at all.
        'middleware' => ['throttle:20,1', 'auth'],
        'preview_mimes' => ['png', 'jpg', 'jpeg', 'webp'],
        'max_upload_time' => 5,
        'cleanup' => true,
    ],

];
