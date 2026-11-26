<?php

use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.admin_email' => 'admin@example.com']);
    $this->panel = Filament::getPanel('admin');
});

it('lets in only the exact admin email, verified', function (string $email, bool $verified, bool $expected) {
    $user = User::factory()->make(['email' => $email, 'email_verified_at' => $verified ? now() : null]);

    expect($user->canAccessPanel($this->panel))->toBe($expected);
})->with([
    'admin, verified' => ['admin@example.com', true, true],
    'admin, different case' => ['Admin@Example.com', true, true],
    'admin, unverified' => ['admin@example.com', false, false],
    'prefix trick (str_ends_with)' => ['xadmin@example.com', true, false],
    'subdomain trick' => ['evil.admin@example.com', true, false],
    'someone else' => ['test@example.com', true, false],
]);

it('denies everyone when ADMIN_EMAIL is empty', function () {
    config(['app.admin_email' => '']);

    $user = User::factory()->make(['email' => '', 'email_verified_at' => now()]);

    expect($user->canAccessPanel($this->panel))->toBeFalse();
});

it('serves the panel to the admin and not to another verified user', function () {
    $this->actingAs(User::factory()->create(['email' => 'xadmin@example.com']))
        ->get('/admin')
        ->assertForbidden();

    $this->actingAs(User::factory()->create(['email' => 'admin@example.com']))
        ->get('/admin')
        ->assertOk();
});

it('no longer exposes /api/user', function () {
    $this->getJson('/api/user')->assertNotFound();
});
