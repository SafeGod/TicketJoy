<?php
// routes/api.php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Aquí irían las demás rutas protegidas
    // Eventos
    // Route::apiResource('events', EventController::class);
    
    // Tickets
    // Route::apiResource('tickets', TicketController::class);
    
    // Pagos
    // Route::apiResource('payments', PaymentController::class);
});