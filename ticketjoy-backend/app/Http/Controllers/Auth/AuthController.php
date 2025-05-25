<?php
// app/Http/Controllers/Auth/AuthController.php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario con el correo institucional
     */
    public function register(Request $request)
    {
        // Validar los datos
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'institutional_id' => 'required|string|max:50',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validar que el correo pertenezca al dominio institucional
        $allowedDomain = config('app.allowed_email_domain', 'fet.edu.co');
        $emailDomain = explode('@', $request->email)[1] ?? '';
        
        if ($emailDomain !== $allowedDomain) {
            return response()->json([
                'message' => 'Debes usar tu correo institucional para registrarte',
                'domain' => $allowedDomain
            ], 422);
        }

        // Crear el usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'institutional_id' => $request->institutional_id,
            'phone' => $request->phone,
        ]);

        // Asignar rol de usuario por defecto
        $user->assignRole('user');

        // Crear token para el usuario
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Iniciar sesión y generar token
     */
    public function login(Request $request)
    {
        // Validar los datos
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validar que el correo pertenezca al dominio institucional
        $allowedDomain = config('app.allowed_email_domain', 'fet.edu.co');
        $emailDomain = explode('@', $request->email)[1] ?? '';
        
        if ($emailDomain !== $allowedDomain) {
            return response()->json([
                'message' => 'Debes usar tu correo institucional para iniciar sesión',
                'domain' => $allowedDomain
            ], 422);
        }

        // Intentar autenticar
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        
        // Revocar tokens anteriores
        $user->tokens()->delete();
        
        // Crear nuevo token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Cerrar sesión (revocar token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    /**
     * Obtener información del usuario autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }
}