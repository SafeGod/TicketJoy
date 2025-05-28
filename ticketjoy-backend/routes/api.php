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

// Rutas públicas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Rutas públicas de eventos (la autenticación se maneja dentro del controlador)
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Rutas públicas de categorías
Route::get('/categories', [EventCategoryController::class, 'index']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Eventos (operaciones que requieren autenticación)
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::patch('/events/{id}/publish', [EventController::class, 'publish']);
    Route::patch('/events/{id}/cancel', [EventController::class, 'cancel']);
    
    // Categorías (admin only)
    Route::post('/categories', [EventCategoryController::class, 'store']);
    Route::put('/categories/{id}', [EventCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [EventCategoryController::class, 'destroy']);
    
    // Subida de imágenes
    Route::post('/upload-image', [ImageController::class, 'upload']);
    
    // Tickets (estas rutas las necesitarás más adelante)
    // Route::get('/tickets', [TicketController::class, 'index']);
    // Route::post('/tickets', [TicketController::class, 'store']);
    // Route::get('/tickets/{id}', [TicketController::class, 'show']);
});