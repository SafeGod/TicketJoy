<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class AssignAdminRole extends Command
{
    protected $signature = 'user:make-admin {email : El email del usuario}';
    protected $description = 'Asigna el rol de administrador a un usuario existente';

    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("No se encontró un usuario con el email: {$email}");
            return 1;
        }
        
        $adminRole = Role::where('name', 'admin')->first();
        
        if (!$adminRole) {
            $this->error("No se encontró el rol 'admin' en la base de datos");
            return 1;
        }
        
        $user->assignRole($adminRole);
        
        $this->info("El rol de administrador ha sido asignado al usuario: {$email}");
        return 0;
    }
}