<?php

namespace Database\Seeders;

use App\Models\Technology;
use Illuminate\Database\Seeder;

class TechnologySeeder extends Seeder
{
    public function run(): void
    {
        $technologies = [
            ['name' => 'C#', 'icon' => 'csharp'],
            ['name' => 'Aseprite', 'icon' => 'aseprite'],
            ['name' => 'Fillament', 'icon' => 'fillament'],
            ['name' => 'Livewire', 'icon' => 'livewire'],
            ['name' => 'Alpine.js', 'icon' => 'alpine'],
            ['name' => 'Vercel', 'icon' => 'vercel'],
            ['name' => 'DigitalOcean', 'icon' => 'digitalocean'],
            ['name' => 'AWS', 'icon' => 'aws'],
            ['name' => 'Laravel', 'icon' => 'laravel'],
            ['name' => 'PHP', 'icon' => 'php'],
            ['name' => 'Vue.js', 'icon' => 'vue'],
            ['name' => 'Vuetify', 'icon' => 'vuetify'],
            ['name' => 'Next', 'icon' => 'nextjs'],
            ['name' => 'Next.js', 'icon' => 'nextjs'],
            ['name' => 'Quasar', 'icon' => 'quasar'],
            ['name' => 'Shadcn', 'icon' => 'shadcn'],
            ['name' => 'React', 'icon' => 'react'],
            ['name' => 'Tailwind CSS', 'icon' => 'tailwind'],
            ['name' => 'Mantine', 'icon' => 'mantine'],
            ['name' => 'Bootstrap', 'icon' => 'bootstrap'],
            ['name' => 'HTML', 'icon' => 'html'],
            ['name' => 'CSS', 'icon' => 'css'],
            ['name' => 'Sass', 'icon' => 'sass'],
            ['name' => 'MySQL', 'icon' => 'mysql'],
            ['name' => 'PostgreSQL', 'icon' => 'postgresql'],
            ['name' => 'Docker', 'icon' => 'docker'],
            ['name' => 'Node.js', 'icon' => 'node'],
            ['name' => 'Express.js', 'icon' => 'express'],
            ['name' => 'JavaScript', 'icon' => 'javascript'],
            ['name' => 'TypeScript', 'icon' => 'typescript'],
            ['name' => 'Git', 'icon' => 'git'],
            ['name' => 'Figma', 'icon' => 'figma'],
            ['name' => 'Inertia.js', 'icon' => 'inertia'],
            ['name' => 'Sanctum', 'icon' => 'sanctum'],
            ['name' => 'Pinia', 'icon' => 'pinia'],
            ['name' => 'Nuxt', 'icon' => 'nuxt'],
        ];

        foreach ($technologies as $tech) {
            Technology::updateOrCreate(
                ['name' => $tech['name']],
                ['icon' => $tech['icon']]
            );
        }
    }
}
