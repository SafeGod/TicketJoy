<?php

namespace App\Http\Controllers;

use App\Models\EventCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventCategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $categories = EventCategory::all();
        return response()->json($categories);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        // Verificar si el usuario tiene permiso para crear categorías (admin)
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'No autorizado para crear categorías'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:event_categories',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $category = EventCategory::create($request->all());
        
        return response()->json($category, 201);
    }

    /**
     * Display the specified category.
     */
    public function show(int $id)
    {
        $category = EventCategory::findOrFail($id);
        return response()->json($category);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, int $id)
    {
        // Verificar si el usuario tiene permiso para editar categorías (admin)
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'No autorizado para editar categorías'], 403);
        }
        
        $category = EventCategory::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:event_categories,name,' . $id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $category->update($request->all());
        
        return response()->json($category);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Request $request, int $id)
    {
        // Verificar si el usuario tiene permiso para eliminar categorías (admin)
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'No autorizado para eliminar categorías'], 403);
        }
        
        $category = EventCategory::findOrFail($id);
        
        // Verificar si la categoría está en uso
        if ($category->events()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar esta categoría porque está siendo utilizada por eventos'
            ], 400);
        }
        
        $category->delete();
        
        return response()->json(['message' => 'Categoría eliminada correctamente']);
    }
}