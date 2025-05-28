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
        $query = Event::with(['organizer', 'categories']);
        
        // Si el usuario no está autenticado o no es admin, solo mostrar eventos publicados
        $user = $request->user();
        if (!$user || !$user->hasRole('admin')) {
            $query->where('status', 'published');
        }
        
        // Filtros
        $query->when($request->has('category'), function ($q) use ($request) {
            return $q->whereHas('categories', function ($query) use ($request) {
                $query->where('id', $request->category);
            });
        })
        ->when($request->has('search'), function ($q) use ($request) {
            $search = $request->search;
            return $q->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
            });
        })
        ->orderBy('start_date', 'asc');
        
        $events = $query->paginate(10);
            
        // Agregar número de boletos disponibles a cada evento
        foreach ($events->items() as $event) {
            $event->available_tickets = $event->availableTickets();
        }
            
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
            'start_date' => 'required|date|after:now',
            'end_date' => 'required|date|after:start_date',
            'location' => 'required|string|max:255',
            'address' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'categories' => 'required|array|min:1',
            'categories.*' => 'exists:event_categories,id',
            'image' => 'nullable|string',
            'status' => 'nullable|in:draft,published,cancelled,completed'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Verificar si el usuario tiene permiso para crear eventos
        if (!$request->user()->hasPermission('event.create') && !$request->user()->hasRole('admin')) {
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
        
        // Si es admin, permitir cambiar el estado, sino crear como draft
        if ($request->user()->hasRole('admin')) {
            $event->status = $request->status ?? 'draft';
        } else {
            $event->status = 'draft';
        }
        
        $event->organizer_id = $request->user()->id;
        $event->save();
        
        // Asignar categorías
        if ($request->has('categories')) {
            $event->categories()->attach($request->categories);
        }
        
        // Cargar relaciones y calcular boletos disponibles
        $event->load(['organizer', 'categories']);
        $event->available_tickets = $event->availableTickets();
        
        return response()->json($event, 201);
    }

    /**
     * Display the specified event.
     */
    public function show(Request $request, $id)
    {
        $event = Event::with(['organizer', 'categories'])->find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }
        
        // Si el evento no está publicado, solo el organizador y admin pueden verlo
        $user = $request->user();
        if ($event->status !== 'published') {
            if (!$user || ($event->organizer_id !== $user->id && !$user->hasRole('admin'))) {
                return response()->json(['message' => 'Evento no encontrado'], 404);
            }
        }
        
        $event->available_tickets = $event->availableTickets();
        
        return response()->json($event);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, $id)
    {
        $event = Event::find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }
        
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
        
        $event->load(['organizer', 'categories']);
        $event->available_tickets = $event->availableTickets();
        
        return response()->json($event);
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Request $request, $id)
    {
        $event = Event::find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }
        
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
    public function publish(Request $request, $id)
    {
        $event = Event::find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }
        
        // Verificar si el usuario es el organizador o tiene permisos
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasPermission('event.publish')) {
            return response()->json(['message' => 'No autorizado para publicar este evento'], 403);
        }
        
        $event->status = 'published';
        $event->save();
        
        $event->load(['organizer', 'categories']);
        $event->available_tickets = $event->availableTickets();
        
        return response()->json($event);
    }
    
    /**
     * Cancel an event
     */
    public function cancel(Request $request, $id)
    {
        $event = Event::find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }
        
        // Verificar si el usuario es el organizador o tiene permisos
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasPermission('event.edit')) {
            return response()->json(['message' => 'No autorizado para cancelar este evento'], 403);
        }
        
        $event->status = 'cancelled';
        $event->save();
        
        $event->load(['organizer', 'categories']);
        $event->available_tickets = $event->availableTickets();
        
        return response()->json($event);
    }
}