<?php

/*
| The image's AUTORUN runs `artisan optimize` (config:cache) at boot. An object
| in config (e.g. a validation rule instance in config/livewire.php) makes it
| fail and the container boots without its config cache.
*/

it('keeps the whole config serializable for config:cache', function () {
    $objects = [];

    $config = Illuminate\Support\Facades\Config::all();

    array_walk_recursive($config, function ($value, $key) use (&$objects) {
        if (is_object($value)) {
            $objects[] = $key.' => '.get_class($value);
        }
    });

    expect($objects)->toBe([]);
});

it('applies the consistent_image_name rule to Livewire temporary uploads', function () {
    expect(config('livewire.temporary_file_upload.rules'))->toContain('consistent_image_name');
});
