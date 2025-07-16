<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
        $query = Project::with(['images', 'technologies']);

        if ($status) {
            $query->where('status', $status);
        }

        $cacheKey = $status ? "projects_status_{$status}" : "projects_all";

        $projects = Cache::remember($cacheKey, 60, function () use ($query) {
            return $query->get();
        });


        return response()->json($projects);
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
