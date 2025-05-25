<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Crear permisos
        $permissions = [
            // Eventos
            ['name' => 'event.view', 'description' => 'Ver eventos'],
            ['name' => 'event.create', 'description' => 'Crear eventos'],
            ['name' => 'event.edit', 'description' => 'Editar eventos'],
            ['name' => 'event.delete', 'description' => 'Eliminar eventos'],
            ['name' => 'event.publish', 'description' => 'Publicar eventos'],
            
            // Tickets
            ['name' => 'ticket.view', 'description' => 'Ver tickets'],
            ['name' => 'ticket.create', 'description' => 'Crear tickets'],
            ['name' => 'ticket.edit', 'description' => 'Editar tickets'],
            ['name' => 'ticket.delete', 'description' => 'Eliminar tickets'],
            ['name' => 'ticket.validate', 'description' => 'Validar tickets'],
            
            // Usuarios
            ['name' => 'user.view', 'description' => 'Ver usuarios'],
            ['name' => 'user.create', 'description' => 'Crear usuarios'],
            ['name' => 'user.edit', 'description' => 'Editar usuarios'],
            ['name' => 'user.delete', 'description' => 'Eliminar usuarios'],
            
            // Reportes
            ['name' => 'report.view', 'description' => 'Ver reportes'],
            ['name' => 'report.export', 'description' => 'Exportar reportes'],
            
            // Pagos
            ['name' => 'payment.view', 'description' => 'Ver pagos'],
            ['name' => 'payment.process', 'description' => 'Procesar pagos'],
            ['name' => 'payment.refund', 'description' => 'Reembolsar pagos'],
        ];
        
        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
        
        // Crear roles
        $roles = [
            ['name' => 'admin', 'description' => 'Administrador con acceso completo'],
            ['name' => 'organizer', 'description' => 'Organizador de eventos'],
            ['name' => 'staff', 'description' => 'Staff para gestionar tickets'],
            ['name' => 'user', 'description' => 'Usuario regular'],
        ];
        
        foreach ($roles as $role) {
            Role::create($role);
        }
        
        // Asignar permisos a roles
        $adminRole = Role::where('name', 'admin')->first();
        $organizerRole = Role::where('name', 'organizer')->first();
        $staffRole = Role::where('name', 'staff')->first();
        $userRole = Role::where('name', 'user')->first();
        
        // Admin tiene todos los permisos
        $adminRole->permissions()->attach(Permission::all());
        
        // Organizador puede gestionar eventos y ver reportes
        $organizerPermissions = Permission::whereIn('name', [
            'event.view', 'event.create', 'event.edit', 'event.publish',
            'ticket.view', 'ticket.validate',
            'report.view', 'report.export',
            'payment.view'
        ])->get();
        $organizerRole->permissions()->attach($organizerPermissions);
        
        // Staff puede validar tickets y gestionar algunos aspectos
        $staffPermissions = Permission::whereIn('name', [
            'event.view',
            'ticket.view', 'ticket.validate',
            'payment.view', 'payment.process'
        ])->get();
        $staffRole->permissions()->attach($staffPermissions);
        
        // Usuario regular
        $userPermissions = Permission::whereIn('name', [
            'event.view',
            'ticket.view'
        ])->get();
        $userRole->permissions()->attach($userPermissions);
    }
}
