<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    $this->root = sys_get_temp_dir().'/security-scan-'.uniqid();

    foreach (['public/css/filament', 'storage/app/public', 'tmp', 'proc', 'cgroup'] as $dir) {
        File::ensureDirectoryExists("{$this->root}/{$dir}");
    }

    file_put_contents("{$this->root}/public/index.php", '<?php // front controller');
    file_put_contents("{$this->root}/public/css/filament/app.css", 'body{}');
    file_put_contents("{$this->root}/storage/app/public/foto.png", 'png');

    $this->fakeProcess = function (int $pid, string $comm, string $cmdline) {
        File::ensureDirectoryExists("{$this->root}/proc/{$pid}");
        file_put_contents("{$this->root}/proc/{$pid}/comm", $comm."\n");
        file_put_contents("{$this->root}/proc/{$pid}/cmdline", str_replace(' ', "\0", $cmdline)."\0");
    };

    ($this->fakeProcess)(1, 's6-svscan', '/package/admin/s6/command/s6-svscan -d4 -- /run/service');
    ($this->fakeProcess)(20, 'php-fpm', 'php-fpm: pool www');
    ($this->fakeProcess)(30, 'nginx', 'nginx: worker process');

    config([
        'security.alert_webhook' => null,
        'security.scan.php_paths' => ["{$this->root}/public", "{$this->root}/storage/app"],
        'security.scan.allowed_php' => ["{$this->root}/public/index.php"],
        'security.scan.exec_paths' => ["{$this->root}/tmp"],
        'security.scan.proc_path' => "{$this->root}/proc",
        'security.scan.cpu_stat_path' => "{$this->root}/cgroup/cpu.stat",
        'security.scan.state_file' => "{$this->root}/state.json",
    ]);
});

afterEach(function () {
    File::deleteDirectory($this->root);
});

it('passes on a clean container', function () {
    $this->artisan('security:scan')->assertSuccessful();
});

it('flags webshells under public/ and storage/', function (string $relative) {
    Log::spy();
    File::ensureDirectoryExists(dirname("{$this->root}/{$relative}"));
    file_put_contents("{$this->root}/{$relative}", '<?php system($_GET["c"]);');

    $this->artisan('security:scan')->assertFailed();

    Log::shouldHaveReceived('critical')->withArgs(fn ($m, $ctx) => $m === 'security_scan'
        && str_contains(implode("\n", $ctx['findings']), $relative));
})->with([
    'public/css/u.php',
    'public/css/filament/forms/theme-mz1.php',
    'public/js/v3.php5',
    'public/js/v3.phtml',
    'public/index.php.bak.php',
    'storage/app/public/projects/01J.php',
    'storage/app/public/x.php.jpg',
    'storage/app/private/livewire-tmp/abc-meta-.php',
]);

it('flags binaries and scripts dropped in /tmp', function (string $name, string $contents, bool $executable) {
    $path = "{$this->root}/tmp/.fontconfig/.data/{$name}";
    File::ensureDirectoryExists(dirname($path));
    file_put_contents($path, $contents);
    chmod($path, $executable ? 0755 : 0644);

    $this->artisan('security:scan')->assertFailed();
})->with([
    'ELF miner' => ['.lib', "\x7fELF\x02\x01\x01", false],
    'shell relauncher' => ['r.sh', "#!/bin/sh\n./.lib", false],
    'perl loader' => ['.session-init', "#!/usr/bin/perl\n", false],
    'executable bit' => ['.rc-local', 'anything', true],
]);

it('flags the miner disguised as rsyslogd', function () {
    ($this->fakeProcess)(666, 'rsyslogd', '/usr/sbin/rsyslogd -n');

    $this->artisan('security:scan')
        ->expectsOutputToContain('pid 666')
        ->assertFailed();
});

it('flags a known name with an unknown argv[0]', function () {
    ($this->fakeProcess)(667, 'php', '/var/www/.cache/.lib --donate-level 1');

    $this->artisan('security:scan')->assertFailed();
});

it('alerts on sustained high CPU without failing the healthcheck', function () {
    config(['security.scan.cpu_consecutive' => 2, 'security.scan.cpu_min_interval_seconds' => 0]);
    $stat = "{$this->root}/cgroup/cpu.stat";
    $state = "{$this->root}/state.json";

    // Pretend each run is 60s after the previous one, at 100% of one CPU.
    $sample = function (int $usageSeconds) use ($stat, $state) {
        file_put_contents($stat, 'usage_usec '.($usageSeconds * 1_000_000)."\n");
        $data = json_decode(@file_get_contents($state) ?: '{}', true);
        if (isset($data['cpu'])) {
            $data['cpu']['time'] = microtime(true) - 60;
            file_put_contents($state, json_encode($data));
        }
    };

    $sample(1000);
    $this->artisan('security:scan')->assertSuccessful(); // first sample

    $sample(1060);
    $this->artisan('security:scan')->assertSuccessful(); // 1st breach

    $sample(1120);
    $this->artisan('security:scan')
        ->expectsOutputToContain('cpu:')
        ->assertSuccessful(); // 2nd breach: alert, still healthy

    $sample(1180);
    $this->artisan('security:scan', ['--strict' => true])->assertFailed();
});

it('posts findings to the webhook once per cooldown', function () {
    Http::fake();
    config(['security.alert_webhook' => 'https://hooks.example.test/x']);
    file_put_contents("{$this->root}/public/css/u.php", '<?php');

    $this->artisan('security:scan')->assertFailed();
    $this->artisan('security:scan')->assertFailed();

    Http::assertSentCount(1);
    Http::assertSent(fn ($request) => str_contains($request['text'], 'u.php'));
});
