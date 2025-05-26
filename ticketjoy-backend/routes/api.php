<?php
// routes/api.php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventCategoryController;
use App\Http\Controllers\ImageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Ruta pública para obtener eventos (solo los publicados)
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::get('/categories', [EventCategoryController::class, 'index']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Eventos
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::patch('/events/{id}/publish', [EventController::class, 'publish']);
    Route::patch('/events/{id}/cancel', [EventController::class, 'cancel']);
    
    // Categorías (si se necesita crear/editar categorías, solo admin)
    Route::post('/categories', [EventCategoryController::class, 'store']);
    Route::put('/categories/{id}', [EventCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [EventCategoryController::class, 'destroy']);
    
    // Subida de imágenes
    Route::post('/upload-image', [ImageController::class, 'upload']);
});