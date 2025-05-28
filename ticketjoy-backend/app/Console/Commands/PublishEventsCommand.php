<?php

namespace App\Console\Commands;

use App\Models\Event;
use Illuminate\Console\Command;

class PublishEventsCommand extends Command
{
    protected $signature = 'events:publish {--all : Publicar todos los eventos en draft} {--id= : ID específico del evento a publicar}';
    protected $description = 'Publica eventos que están en estado draft';

    public function handle()
    {
        if ($this->option('all')) {
            $events = Event::where('status', 'draft')->get();
            
            if ($events->isEmpty()) {
                $this->info('No hay eventos en estado draft para publicar.');
                return 0;
            }
            
            foreach ($events as $event) {
                $event->status = 'published';
                $event->save();
            }
            
            $this->info("Se han publicado {$events->count()} evento(s).");
            
            // Mostrar lista de eventos publicados
            $this->table(
                ['ID', 'Título', 'Fecha', 'Estado'],
                $events->map(function ($event) {
                    return [
                        $event->id,
                        $event->title,
                        $event->start_date->format('Y-m-d H:i'),
                        'published'
                    ];
                })
            );
            
        } elseif ($this->option('id')) {
            $eventId = $this->option('id');
            $event = Event::find($eventId);
            
            if (!$event) {
                $this->error("No se encontró un evento con ID: {$eventId}");
                return 1;
            }
            
            if ($event->status === 'published') {
                $this->warn("El evento '{$event->title}' ya está publicado.");
                return 0;
            }
            
            $event->status = 'published';
            $event->save();
            
            $this->info("El evento '{$event->title}' ha sido publicado exitosamente.");
            
        } else {
            // Mostrar lista de eventos en draft
            $events = Event::where('status', 'draft')->get();
            
            if ($events->isEmpty()) {
                $this->info('No hay eventos en estado draft.');
                return 0;
            }
            
            $this->info('Eventos en estado draft:');
            $this->table(
                ['ID', 'Título', 'Fecha', 'Estado'],
                $events->map(function ($event) {
                    return [
                        $event->id,
                        $event->title,
                        $event->start_date->format('Y-m-d H:i'),
                        $event->status
                    ];
                })
            );
            
            $this->info('Para publicar todos los eventos: php artisan events:publish --all');
            $this->info('Para publicar un evento específico: php artisan events:publish --id=1');
        }
        
        return 0;
    }
}