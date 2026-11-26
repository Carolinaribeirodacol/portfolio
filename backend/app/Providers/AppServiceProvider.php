<?php

namespace App\Providers;

use App\Listeners\LogAuthEvents;
use App\Rules\ConsistentImageName;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::subscribe(LogAuthEvents::class);

        // String alias so the rule can live in config/livewire.php, which
        // must stay serializable for `artisan config:cache`.
        Validator::extend('consistent_image_name', function (string $attribute, mixed $value): bool {
            $passes = true;
            (new ConsistentImageName)->validate($attribute, $value, function () use (&$passes) {
                $passes = false;
            });

            return $passes;
        }, 'O nome ou a extensão do arquivo não correspondem a uma imagem permitida.');
    }
}
