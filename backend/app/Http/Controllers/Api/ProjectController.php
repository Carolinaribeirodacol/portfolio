<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;

class ProjectController extends Controller
{
    public function index()
    {
        // return Project::with('technology')->get();
        return response()->json(Project::all());
    }
}
