<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'address',
        'capacity',
        'price',
        'image',
        'status',
        'organizer_id',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function categories()
    {
        return $this->belongsToMany(EventCategory::class, 'event_event_category');
    }

    public function isAvailable()
    {
        return $this->status === 'published' && 
               $this->start_date > now() && 
               $this->availableTickets() > 0;
    }

    public function availableTickets()
    {
        try {
            // Intentar contar tickets, pero manejar el caso donde la tabla no existe
            $ticketCount = $this->tickets()->whereNotIn('status', ['cancelled'])->count();
            return $this->capacity - $ticketCount;
        } catch (\Exception $e) {
            // Si la tabla tickets no existe o hay un error, devolver la capacidad completa
            Log::info('Could not count tickets for event ' . $this->id . ': ' . $e->getMessage());
            return $this->capacity;
        }
    }
}