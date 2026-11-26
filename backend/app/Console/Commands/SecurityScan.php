<?php

namespace App\Console\Commands;

use FilesystemIterator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use Throwable;

/**
 * Detects the signs of the 2026-11 incident coming back:
 *   - PHP files anywhere under public/ (except index.php) or storage/app;
 *   - executables, ELF binaries or scripts in /tmp, /dev/shm, ~www-data;
 *   - processes outside the image's known set (php-fpm, nginx, s6...);
 *   - sustained high CPU (cgroup v2), i.e. a miner.
 *
 * Exit code 1 on file/process findings, so a Docker HEALTHCHECK or a
 * Coolify scheduled task turns red. High CPU alone only alerts (exit 0),
 * unless --strict: a traffic spike should not take the API offline.
 */
class SecurityScan extends Command
{
    protected $signature = 'security:scan
        {--strict : Also exit 1 on high CPU}
        {--no-cpu : Skip the CPU check}
        {--no-alert : Do not send the webhook}';

    protected $description = 'Look for webshells, dropped binaries, unknown processes and abnormal CPU usage';

    /** @var array<string, mixed> */
    private array $state = [];

    public function handle(): int
    {
        $this->state = $this->loadState();

        $findings = [
            ...$this->findPhpFiles(),
            ...$this->findExecutables(),
            ...$this->findUnknownProcesses(),
        ];

        $cpuFindings = $this->option('no-cpu') ? [] : $this->checkCpu();

        $this->saveState();

        $all = [...$findings, ...$cpuFindings];

        if ($all === []) {
            $this->info('security:scan clean');

            return self::SUCCESS;
        }

        foreach ($all as $finding) {
            $this->error($finding);
        }

        $this->report($all);

        return ($findings !== [] || ($cpuFindings !== [] && $this->option('strict')))
            ? self::FAILURE
            : self::SUCCESS;
    }

    /**
     * @return list<string>
     */
    private function findPhpFiles(): array
    {
        $pattern = config('security.scan.php_pattern');
        $allowed = array_map(fn (string $p) => $this->realpathOr($p), config('security.scan.allowed_php', []));
        $findings = [];

        foreach (config('security.scan.php_paths', []) as $root) {
            foreach ($this->walk($root) as $file) {
                if (! preg_match($pattern, $file->getFilename())) {
                    continue;
                }

                $path = $this->realpathOr($file->getPathname());

                if (! in_array($path, $allowed, true)) {
                    $findings[] = "php_file: {$file->getPathname()} (".$file->getSize().' bytes, mtime '.date('c', $file->getMTime()).')';
                }
            }
        }

        return $findings;
    }

    /**
     * @return list<string>
     */
    private function findExecutables(): array
    {
        $findings = [];

        foreach (config('security.scan.exec_paths', []) as $root) {
            foreach ($this->walk($root) as $file) {
                $reason = match (true) {
                    $file->isExecutable() => 'executable bit',
                    $this->startsWith($file, "\x7fELF") => 'ELF binary',
                    $this->startsWith($file, '#!') => 'script',
                    default => null,
                };

                if ($reason !== null) {
                    $findings[] = "dropped_file: {$file->getPathname()} ({$reason})";
                }
            }
        }

        return $findings;
    }

    /**
     * @return list<string>
     */
    private function findUnknownProcesses(): array
    {
        $proc = rtrim(config('security.scan.proc_path'), '/');
        $allowlist = config('security.scan.process_allowlist', []);
        $findings = [];

        foreach (glob($proc.'/[0-9]*', GLOB_ONLYDIR) ?: [] as $dir) {
            $comm = trim((string) @file_get_contents($dir.'/comm'));
            $cmdline = (string) @file_get_contents($dir.'/cmdline');

            if ($comm === '' && $cmdline === '') {
                continue; // exited, or kernel thread
            }

            $argv0 = basename(strtok($cmdline, "\0") ?: '');
            $exe = @readlink($dir.'/exe') ?: '';

            $names = array_filter([$comm, $argv0]);
            $unknown = array_filter($names, fn (string $name) => ! $this->matchesAny($name, $allowlist));

            if ($unknown !== [] || str_ends_with($exe, ' (deleted)')) {
                $findings[] = sprintf(
                    'process: pid %s comm=%s cmd=%s exe=%s',
                    basename($dir),
                    $comm,
                    substr(str_replace("\0", ' ', $cmdline), 0, 200),
                    $exe ?: '?',
                );
            }
        }

        return $findings;
    }

    /**
     * @return list<string>
     */
    private function checkCpu(): array
    {
        $stat = @file_get_contents(config('security.scan.cpu_stat_path'));

        if ($stat === false || ! preg_match('/^usage_usec\s+(\d+)/m', $stat, $m)) {
            return [];
        }

        $now = microtime(true);
        $usage = (int) $m[1];
        $previous = $this->state['cpu'] ?? null;

        if (is_array($previous) && ($now - $previous['time']) < config('security.scan.cpu_min_interval_seconds')) {
            return []; // too soon to measure; keep the older sample
        }

        $this->state['cpu'] = ['time' => $now, 'usage' => $usage, 'breaches' => $previous['breaches'] ?? 0];

        if (! is_array($previous) || $usage < $previous['usage']) {
            return []; // first sample, or the container restarted
        }

        $percent = ($usage - $previous['usage']) / (($now - $previous['time']) * 1_000_000) * 100;
        $breaches = $percent > config('security.scan.cpu_threshold_percent') ? ($previous['breaches'] ?? 0) + 1 : 0;
        $this->state['cpu']['breaches'] = $breaches;

        if ($breaches >= config('security.scan.cpu_consecutive')) {
            return [sprintf('cpu: %.0f%% of one CPU for %d consecutive checks', $percent, $breaches)];
        }

        return [];
    }

    /**
     * @param  list<string>  $findings
     */
    private function report(array $findings): void
    {
        $host = gethostname() ?: 'unknown';
        $message = "[security:scan] {$host} ".config('app.name').': '.count($findings)." finding(s)\n- ".implode("\n- ", array_slice($findings, 0, 30));

        // LOG_CHANNEL=stderr. The Dockerfile HEALTHCHECK redirects the
        // command's stderr into the container's (/proc/1/fd/2), so this line
        // reaches Coolify's log viewer; Docker does not log healthcheck output.
        Log::critical('security_scan', ['host' => $host, 'findings' => $findings]);

        $webhook = config('security.alert_webhook');
        if (! $webhook || $this->option('no-alert')) {
            return;
        }

        $fingerprint = sha1(implode("\n", $findings));
        $last = $this->state['alerts'][$fingerprint] ?? 0;

        if (time() - $last < config('security.alert_cooldown_seconds')) {
            return;
        }

        try {
            Http::timeout(5)->post($webhook, ['text' => $message, 'content' => substr($message, 0, 1900)]);
            $this->state['alerts'] = [$fingerprint => time()] + array_filter(
                $this->state['alerts'] ?? [],
                fn (int $t) => time() - $t < 86400,
            );
            $this->saveState();
        } catch (Throwable $e) {
            Log::error('security_scan_webhook_failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * @return iterable<SplFileInfo>
     */
    private function walk(string $root): iterable
    {
        if (! is_dir($root)) {
            return [];
        }

        try {
            // Symlinks are not followed: public/storage points into storage/app, scanned on its own.
            return new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
                RecursiveIteratorIterator::LEAVES_ONLY,
                RecursiveIteratorIterator::CATCH_GET_CHILD,
            );
        } catch (Throwable) {
            return [];
        }
    }

    private function startsWith(SplFileInfo $file, string $magic): bool
    {
        if (! $file->isFile() || ! $file->isReadable()) {
            return false;
        }

        $handle = @fopen($file->getPathname(), 'rb');
        if ($handle === false) {
            return false;
        }

        $head = (string) fread($handle, strlen($magic));
        fclose($handle);

        return $head === $magic;
    }

    /**
     * @param  list<string>  $patterns
     */
    private function matchesAny(string $name, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $name)) {
                return true;
            }
        }

        return false;
    }

    private function realpathOr(string $path): string
    {
        return realpath($path) ?: $path;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadState(): array
    {
        $raw = @file_get_contents(config('security.scan.state_file'));

        return is_string($raw) ? (json_decode($raw, true) ?: []) : [];
    }

    private function saveState(): void
    {
        @file_put_contents(config('security.scan.state_file'), json_encode($this->state), LOCK_EX);
    }
}
