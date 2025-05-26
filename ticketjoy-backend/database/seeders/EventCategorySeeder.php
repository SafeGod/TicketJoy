<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EventCategory;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Conferencias', 'color' => 'blue', 'description' => 'Charlas, seminarios y ponencias'],
            ['name' => 'Música', 'color' => 'purple', 'description' => 'Conciertos y eventos musicales'],
            ['name' => 'Talleres', 'color' => 'orange', 'description' => 'Workshops y actividades prácticas'],
            ['name' => 'Deportes', 'color' => 'green', 'description' => 'Eventos deportivos y competencias'],
            ['name' => 'Cultura', 'color' => 'red', 'description' => 'Eventos culturales y artísticos'],
        ];
        
        foreach ($categories as $category) {
            EventCategory::create($category);
        }
    }
}