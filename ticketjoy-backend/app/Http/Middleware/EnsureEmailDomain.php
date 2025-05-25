<?php
// app/Http/Middleware/EnsureEmailDomain.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailDomain
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$this->hasValidDomain($request->user()->email)) {
            // Opción 1: Desconectar al usuario
            auth()->logout();
            return redirect()->route('login')->with('error', 'Debes usar tu correo institucional');
            
            // Opción 2: Devolver error para API
            // return response()->json(['error' => 'Debes usar tu correo institucional'], 403);
        }

        return $next($request);
    }

    /**
     * Verifica que el dominio del correo sea válido
     */
    protected function hasValidDomain(string $email): bool
    {
        $allowedDomain = config('app.allowed_email_domain', 'fet.edu.co');
        $emailDomain = explode('@', $email)[1] ?? '';
        
        return $emailDomain === $allowedDomain;
    }
}

// Registra el middleware en app/Http/Kernel.php
// En la sección $routeMiddleware añade:
// 'institutional.email' => \App\Http\Middleware\EnsureEmailDomain::class,