<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Retorna todos os projetos.
     *
     * @param Request $request
     * @return \App\Models\Project
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Project::query();

        if ($status) {
            $query->where('status', $status);
        }

        return response()->json($query->get());
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
