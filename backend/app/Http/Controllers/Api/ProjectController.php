<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;

class ProjectController extends Controller
{
    /**
     * Retorna todos os projetos.
     *
     * @return \App\Models\Project
     */
    public function index()
    {
        return response()->json(Project::all());
    }

    /**
     * Retorna o projeto de acordo com o id.
     *
     * @param int $projectId
     * @return \App\Models\Project
     */
    public function show($projectId)
    {
        $project = Project::where('id', $projectId)
            ->with(['images', 'technologies'])
            ->firstOrFail();

        return response()->json($project);
    }
}
