<?php

use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

Route::controller(ProjectController::class)->group(function () {
    Route::get('/projects', 'index');
    Route::get('/projects/{id}', 'show');
});
