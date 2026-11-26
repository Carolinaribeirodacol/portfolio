<?php

/*
| CI guard: the only PHP file that may ever exist under public/ is the front
| controller. The 2026-11 webshells lived in public/css and public/js.
*/

use Symfony\Component\Finder\Finder;

it('has no PHP file in public/ other than index.php', function () {
    $files = collect(
        Finder::create()->files()->in(public_path())->ignoreDotFiles(false)
            ->notPath('storage') // symlink to storage/app/public, may not exist
            ->name(config('security.scan.php_pattern'))
    )
        ->map(fn ($file) => $file->getRelativePathname())
        ->values()
        ->all();

    expect($files)->toBe(['index.php']);
});

it('ships an nginx config that only executes public/index.php', function () {
    $conf = file_get_contents(base_path('docker/nginx/http.conf.template'));

    expect($conf)
        ->toContain('location = /index.php {')
        ->toContain('location ~* \.(php\d*|phtml|pht|phar|phps)(/|$) {')
        ->not->toMatch('/location ~ \\\\\.php\$\s*\{/'); // upstream's "run any .php"

    // The catch-all 404 must come before nothing that could pass PHP to FPM.
    expect(substr_count($conf, 'fastcgi_pass'))->toBe(2); // /healthcheck (FPM ping) + /index.php
});

it('disables shell functions in PHP-FPM', function () {
    $conf = file_get_contents(base_path('docker/php/zz-hardening.conf'));

    preg_match('/^php_admin_value\[disable_functions\]\s*=\s*(.+)$/m', $conf, $m);
    $disabled = array_map('trim', explode(',', $m[1] ?? ''));

    expect($disabled)->toContain('exec', 'shell_exec', 'system', 'passthru', 'proc_open', 'popen');
});
