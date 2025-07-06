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
            'C#',
            'Aseprite',
            'Fillament',
            'Livewire',
            'Alpine.js',
            'Vercel',
            'DigitalOcean',
            'AWS',
            'Laravel',
            'PHP',
            'Vue.js',
            'Vuetify',
            'Next',
            'Quasar',
            'Shadcn',
            'React',
            'Next.js',
            'Tailwind CSS',
            'Mantine',
            'Bootstrap',
            'HTML',
            'CSS',
            'Sass',
            'MySQL',
            'PostgreSQL',
            'Docker',
            'Node.js',
            'Express.js',
            'JavaScript',
            'TypeScript',
            'Git',
            'Figma',
            'Inertia.js',
        ];

        foreach ($technologies as $name) {
            Technology::firstOrCreate(['name' => $name]);
        }
    }
}
