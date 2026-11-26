<?php

namespace App\Support;

use Illuminate\Support\Facades\Auth;

/**
 * Who/where context for security logs. Behind Cloudflare -> Traefik the
 * socket IP is the proxy's, so the raw forwarding headers are logged too
 * (they are client-controlled except CF-Connecting-IP, which Cloudflare sets).
 */
class RequestContext
{
    /**
     * @return array<string, mixed>
     */
    public static function toArray(): array
    {
        $request = request();

        return [
            'user_id' => Auth::id(),
            'email' => Auth::user()?->email,
            'ip' => $request->ip(),
            'cf_connecting_ip' => $request->header('CF-Connecting-IP'),
            'x_forwarded_for' => $request->header('X-Forwarded-For'),
            'user_agent' => $request->userAgent(),
        ];
    }
}
