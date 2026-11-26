<?php

/*
| Settings for `php artisan security:scan` (app/Console/Commands/SecurityScan.php),
| added after the 2026-11 incident (webshells in public/css, XMRig under
| /var/www/.cache disguised as /usr/sbin/rsyslogd).
*/

return [

    // POSTed as JSON ({"text": ..., "content": ...}: Slack and Discord both accept it).
    'alert_webhook' => env('SECURITY_ALERT_WEBHOOK'),

    // Re-send the same alert at most this often.
    'alert_cooldown_seconds' => (int) env('SECURITY_ALERT_COOLDOWN', 3600),

    'scan' => [
        // Directories where no PHP file may exist, except the ones in allowed_php.
        'php_paths' => [
            public_path(),
            storage_path('app'),
        ],

        'allowed_php' => [
            public_path('index.php'),
        ],

        // Anything with a PHP-ish extension (shell.php, x.php5, x.phtml, a.phar, b.php.jpg...).
        'php_pattern' => '/\.(php\d*|phtml|pht|phar|phps|inc)(\.|$)/i',

        // Directories where no executable, ELF binary or script may exist.
        'exec_paths' => [
            '/tmp',
            '/dev/shm',
            '/var/www/.cache',
            '/var/www/.local',
            '/var/www/.config',
        ],

        // Process names (comm, and argv[0] basename) allowed in the container.
        // The miner showed up as "/usr/sbin/rsyslogd", which this image does not ship.
        'process_allowlist' => [
            '/^s6-/',
            '/^php-fpm/',
            '/^php$/',
            '/^nginx/',
            '/^(sh|bash|ash|dash)$/',
            '/^curl$/',
            '/^sleep$/',
        ],

        'proc_path' => env('SECURITY_PROC_PATH', '/proc'),

        // cgroup v2 CPU accounting for this container.
        'cpu_stat_path' => env('SECURITY_CPU_STAT_PATH', '/sys/fs/cgroup/cpu.stat'),

        // Percent of ONE CPU, averaged since the previous run.
        'cpu_threshold_percent' => (float) env('SECURITY_CPU_THRESHOLD', 80),

        // Consecutive runs above the threshold before alerting.
        'cpu_consecutive' => (int) env('SECURITY_CPU_CONSECUTIVE', 3),

        // Ignore CPU samples closer together than this.
        'cpu_min_interval_seconds' => 30,

        // Scan state (CPU samples, alert dedupe). File-based so the scan
        // still works when the database is down.
        'state_file' => storage_path('framework/security-scan.json'),
    ],

];
