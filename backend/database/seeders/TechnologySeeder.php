<?php

namespace Database\Seeders;

use App\Models\Technology;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TechnologySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $technologies = [
            'Laravel',
            'PHP',
            'Vue.js',
            'React',
            'Next.js',
            'Tailwind CSS',
            'Bootstrap',
            'MySQL',
            'PostgreSQL',
            'Docker',
            'Node.js',
            'Express.js',
            'JavaScript',
            'TypeScript',
            'HTML',
            'CSS',
            'Sass',
            'Git',
            'Figma',
            'Inertia.js',
        ];

        foreach ($technologies as $name) {
            Technology::firstOrCreate(['name' => $name]);
        }
    }
}
