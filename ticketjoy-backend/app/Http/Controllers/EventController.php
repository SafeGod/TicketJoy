<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    /**
     * Display a listing of the events.
     */
    public function index(Request $request)
    {
        try {
            $query = Event::query();
            
            // Si el usuario no está autenticado o no es admin, solo mostrar eventos publicados
            $user = $request->user();
            $isAdmin = $user && ($user->hasRole('admin') ?? false);
            
            if (!$isAdmin) {
                $query->where('status', 'published');
            }
            
            // Filtros
            if ($request->has('category')) {
                $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('event_categories.id', $request->category);
                });
            }
            
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
                });
            }
            
            $query->orderBy('start_date', 'asc');
            
            $events = $query->paginate(10);
            
            // Agregar información adicional a cada evento
            foreach ($events->items() as $event) {
                $event->available_tickets = $event->capacity; // Simplificado por ahora
                
                // Cargar relaciones si existen
                try {
                    $event->load('organizer');
                } catch (\Exception $e) {
                    // Si no puede cargar la relación, continuar
                    Log::warning('Could not load organizer relation: ' . $e->getMessage());
                }
                
                try {
                    $event->load('categories');
                } catch (\Exception $e) {
                    // Si no puede cargar la relación, continuar
                    Log::warning('Could not load categories relation: ' . $e->getMessage());
                }
            }
            
            return response()->json($events);
            
        } catch (\Exception $e) {
            Log::error('Error in EventController@index: ' . $e->getMessage());
            return response()->json(['message' => 'Error al cargar eventos'], 500);
        }
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        try {
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
            
            // Verificar autenticación básica
            if (!$request->user()) {
                return response()->json(['message' => 'No autorizado'], 401);
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
            
            // Asignar categorías si la tabla existe
            if ($request->has('categories')) {
                try {
                    $event->categories()->attach($request->categories);
                } catch (\Exception $e) {
                    Log::warning('Could not attach categories: ' . $e->getMessage());
                }
            }
            
            // Agregar información adicional
            $event->available_tickets = $event->capacity;
            
            return response()->json($event, 201);
            
        } catch (\Exception $e) {
            Log::error('Error in EventController@store: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['message' => 'Error al crear evento: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified event.
     */
    public function show(Request $request, $id)
    {
        try {
            $event = Event::find($id);
            
            if (!$event) {
                return response()->json(['message' => 'Evento no encontrado'], 404);
            }
            
            // Si el evento no está publicado, solo el organizador y admin pueden verlo
            $user = $request->user();
            if ($event->status !== 'published') {
                if (!$user || ($event->organizer_id !== $user->id && !($user->hasRole('admin') ?? false))) {
                    return response()->json(['message' => 'Evento no encontrado'], 404);
                }
            }
            
            // Cargar relaciones si existen
            try {
                $event->load('organizer');
            } catch (\Exception $e) {
                Log::warning('Could not load organizer relation: ' . $e->getMessage());
            }
            
            try {
                $event->load('categories');
            } catch (\Exception $e) {
                Log::warning('Could not load categories relation: ' . $e->getMessage());
            }
            
            $event->available_tickets = $event->capacity;
            
            return response()->json($event);
            
        } catch (\Exception $e) {
            Log::error('Error in EventController@show: ' . $e->getMessage());
            return response()->json(['message' => 'Error al cargar evento'], 500);
        }
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $event = Event::find($id);
            
            if (!$event) {
                return response()->json(['message' => 'Evento no encontrado'], 404);
            }
            
            // Verificar si el usuario es el organizador o admin
            if ($event->organizer_id !== $request->user()->id && !($request->user()->hasRole('admin') ?? false)) {
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
                try {
                    $event->categories()->sync($request->categories);
                } catch (\Exception $e) {
                    Log::warning('Could not sync categories: ' . $e->getMessage());
                }
            }
            
            $event->available_tickets = $event->capacity;
            
            return response()->json($event);
            
        } catch (\Exception $e) {
            Log::error('Error in EventController@update: ' . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar evento'], 500);
        }
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Request $request, $id)
    {
        try {
            $event = Event::find($id);
            
            if (!$event) {
                return response()->json(['message' => 'Evento no encontrado'], 404);
            }
            
            // Verificar si el usuario es el organizador o admin
            if ($event->organizer_id !== $request->user()->id && !($request->user()->hasRole('admin') ?? false)) {
                return response()->json(['message' => 'No autorizado para eliminar este evento'], 403);
            }
            
            $event->delete();
            
            return response()->json(['message' => 'Evento eliminado correctamente']);
            
        } catch (\Exception $e) {
            Log::error('Error in EventController@destroy: ' . $e->getMessage());
            return response()->json(['message' => 'Error al eliminar evento'], 500);
        }
    }
    
    /**
     * Publish an event
     */
    public function publish(Request $request, $id)
    {
        try {
            $event = Event::find($id);
            
            if (!$event) {
                return response()->json(['message' => 'Evento no encontrado'], 404);
            }
            
            // Verificar si el usuario es el organizador o admin
            if ($event->organizer_id !== $request->user()->id && !($request->user()->hasRole('admin') ?? false)) {
                return response()->json(['message' => 'No autorizado para publicar este evento'], 403);
            }
            
            $event->status = 'published';
            $event->save();
            
            $event->available_tickets = $event->capacity;
            
            return response()->json($event);
            
        } catch (\Exception $e) {
            Log::error('Error in EventController@publish: ' . $e->getMessage());
            return response()->json(['message' => 'Error al publicar evento'], 500);
        }
    }
    
    /**
     * Cancel an event
     */
    public function cancel(Request $request, $id)
    {
        try {
            $event = Event::find($id);
            
            if (!$event) {
                return response()->json(['message' => 'Evento no encontrado'], 404);
            }
            
            // Verificar si el usuario es el organizador o admin
            if ($event->organizer_id !== $request->user()->id && !($request->user()->hasRole('admin') ?? false)) {
                return response()->json(['message' => 'No autorizado para cancelar este evento'], 403);
            }
            
            $event->status = 'cancelled';
            $event->save();
            
            $event->available_tickets = $event->capacity;
            
            return response()->json($event);
            
        } catch (\Exception $e) {
            Log::error('Error in EventController@cancel: ' . $e->getMessage());
            return response()->json(['message' => 'Error al cancelar evento'], 500);
        }
    }
}