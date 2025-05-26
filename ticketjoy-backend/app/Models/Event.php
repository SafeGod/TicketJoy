<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'address',  // Nuevo campo
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
               $this->tickets()->count() < $this->capacity;
    }

    public function availableTickets()
    {
        return $this->capacity - $this->tickets()->whereNotIn('status', ['cancelled'])->count();
    }
}