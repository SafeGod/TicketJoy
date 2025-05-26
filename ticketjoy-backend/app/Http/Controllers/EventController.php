<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * Display a listing of the events.
     */
    public function index(Request $request)
    {
        $events = Event::with(['organizer', 'categories'])
            ->when($request->has('category'), function ($query) use ($request) {
                return $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('id', $request->category);
                });
            })
            ->when($request->has('search'), function ($query) use ($request) {
                $search = $request->search;
                return $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->orderBy('start_date', 'asc')
            ->paginate(10);
            
        // Agregar número de boletos disponibles
        $events->getCollection()->transform(function ($event) {
            $event->available_tickets = $event->availableTickets();
            return $event;
        });
            
        return response()->json($events);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:5|max:255',
            'description' => 'required|string|min:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'location' => 'required|string|max:255',
            'address' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'categories' => 'required|array',
            'categories.*' => 'exists:event_categories,id',
            'image' => 'nullable|string',
            'status' => 'nullable|in:draft,published,cancelled,completed'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Verificar si el usuario tiene permiso para crear eventos
        if (!$request->user()->hasPermission('event.create')) {
            return response()->json(['message' => 'No autorizado para crear eventos'], 403);
        }
        
        // Crear el evento
        $event = new Event();
        $event->title = $request->title;
        $event->description = $request->description;
        $event->start_date = $request->start_date;
        $event->end_date = $request->end_date;
        $event->location = $request->location;
        $event->address = $request->address;
        $event->capacity = $request->capacity;
        $event->price = $request->price;
        $event->image = $request->image ?? null;
        $event->status = $request->status ?? 'draft';
        $event->organizer_id = $request->user()->id;
        $event->save();
        
        // Asignar categorías
        if ($request->has('categories')) {
            $event->categories()->attach($request->categories);
        }
        
        return response()->json($event->load(['organizer', 'categories']), 201);
    }

    /**
     * Display the specified event.
     */
    public function show(int $id)
    {
        $event = Event::with(['organizer', 'categories'])->findOrFail($id);
        $event->available_tickets = $event->availableTickets();
        
        return response()->json($event);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, int $id)
    {
        $event = Event::findOrFail($id);
        
        // Verificar si el usuario es el organizador o tiene permisos
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasPermission('event.edit')) {
            return response()->json(['message' => 'No autorizado para editar este evento'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|min:5|max:255',
            'description' => 'sometimes|required|string|min:20',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'location' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string',
            'capacity' => 'sometimes|required|integer|min:1',
            'price' => 'sometimes|required|numeric|min:0',
            'categories' => 'sometimes|required|array',
            'categories.*' => 'exists:event_categories,id',
            'image' => 'nullable|string',
            'status' => 'sometimes|in:draft,published,cancelled,completed'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Actualizar el evento
        $event->fill($request->only([
            'title', 'description', 'start_date', 'end_date', 'location', 
            'address', 'capacity', 'price', 'image', 'status'
        ]));
        $event->save();
        
        // Actualizar categorías si se proporcionan
        if ($request->has('categories')) {
            $event->categories()->sync($request->categories);
        }
        
        return response()->json($event->load(['organizer', 'categories']));
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Request $request, int $id)
    {
        $event = Event::findOrFail($id);
        
        // Verificar si el usuario es el organizador o tiene permisos
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasPermission('event.delete')) {
            return response()->json(['message' => 'No autorizado para eliminar este evento'], 403);
        }
        
        $event->delete();
        
        return response()->json(['message' => 'Evento eliminado correctamente']);
    }
    
    /**
     * Publish an event
     */
    public function publish(Request $request, int $id)
    {
        $event = Event::findOrFail($id);
        
        // Verificar si el usuario es el organizador o tiene permisos
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasPermission('event.publish')) {
            return response()->json(['message' => 'No autorizado para publicar este evento'], 403);
        }
        
        $event->status = 'published';
        $event->save();
        
        return response()->json($event->load(['organizer', 'categories']));
    }
    
    /**
     * Cancel an event
     */
    public function cancel(Request $request, int $id)
    {
        $event = Event::findOrFail($id);
        
        // Verificar si el usuario es el organizador o tiene permisos
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasPermission('event.edit')) {
            return response()->json(['message' => 'No autorizado para cancelar este evento'], 403);
        }
        
        $event->status = 'cancelled';
        $event->save();
        
        return response()->json($event->load(['organizer', 'categories']));
    }
}