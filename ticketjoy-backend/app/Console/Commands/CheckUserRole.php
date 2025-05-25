<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CheckUserRole extends Command
{
    protected $signature = 'user:check-role {email} {role?}';
    protected $description = 'Verifica los roles de un usuario';

    public function handle()
    {
        $email = $this->argument('email');
        $roleName = $this->argument('role');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("No se encontró un usuario con el email: {$email}");
            return 1;
        }
        
        $roles = $user->roles->pluck('name')->toArray();
        $this->info("Roles del usuario {$email}:");
        $this->table(['Roles'], array_map(function($role) { return [$role]; }, $roles));
        
        if ($roleName) {
            $hasRole = $user->hasRole($roleName);
            if ($hasRole) {
                $this->info("El usuario tiene el rol '{$roleName}'");
            } else {
                $this->warn("El usuario NO tiene el rol '{$roleName}'");
            }
        }
        
        return 0;
    }
}