<?php

namespace App\Listeners;

use App\Support\RequestContext;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Log;

/**
 * Logs panel sign-ins to stderr (Coolify log viewer) so an unexpected
 * session or a brute-force attempt is visible.
 */
class LogAuthEvents
{
    public function onLogin(Login $event): void
    {
        Log::notice('auth_login', [...RequestContext::toArray(), 'user_id' => $event->user->getAuthIdentifier(), 'email' => $event->user->email ?? null]);
    }

    public function onFailed(Failed $event): void
    {
        Log::warning('auth_failed', [...RequestContext::toArray(), 'attempted_email' => $event->credentials['email'] ?? null]);
    }

    public function onLockout(Lockout $event): void
    {
        Log::warning('auth_lockout', [...RequestContext::toArray(), 'attempted_email' => $event->request->input('email') ?? $event->request->input('data.email')]);
    }

    public function onLogout(Logout $event): void
    {
        Log::notice('auth_logout', [...RequestContext::toArray(), 'user_id' => $event->user?->getAuthIdentifier()]);
    }

    /**
     * @return array<class-string, string>
     */
    public function subscribe(): array
    {
        return [
            Login::class => 'onLogin',
            Failed::class => 'onFailed',
            Lockout::class => 'onLockout',
            Logout::class => 'onLogout',
        ];
    }
}
