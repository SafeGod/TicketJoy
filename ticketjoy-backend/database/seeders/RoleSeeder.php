<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Resetear roles y permisos en caché
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permisos para gestión de eventos
        $eventPermissions = [
            'event.view',
            'event.create',
            'event.edit',
            'event.delete',
            'event.publish',
        ];

        // Permisos para gestión de tickets
        $ticketPermissions = [
            'ticket.view',
            'ticket.create',
            'ticket.edit',
            'ticket.delete',
            'ticket.validate',
        ];

        // Permisos para gestión de usuarios
        $userPermissions = [
            'user.view',
            'user.create',
            'user.edit',
            'user.delete',
        ];

        // Permisos para reportes
        $reportPermissions = [
            'report.view',
            'report.export',
        ];

        // Permisos para pagos
        $paymentPermissions = [
            'payment.view',
            'payment.process',
            'payment.refund',
        ];

        // Crear permisos
        $allPermissions = array_merge(
            $eventPermissions, 
            $ticketPermissions, 
            $userPermissions, 
            $reportPermissions,
            $paymentPermissions
        );

        foreach ($allPermissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Crear roles
        $adminRole = Role::create(['name' => 'admin']);
        $organizerRole = Role::create(['name' => 'organizer']);
        $userRole = Role::create(['name' => 'user']);
        $staffRole = Role::create(['name' => 'staff']);

        // Asignar permisos
        // Admin tiene todos los permisos
        $adminRole->givePermissionTo(Permission::all());

        // Organizador puede gestionar eventos y ver reportes
        $organizerRole->givePermissionTo([
            'event.view', 'event.create', 'event.edit', 'event.publish',
            'ticket.view', 'ticket.validate',
            'report.view', 'report.export',
            'payment.view'
        ]);

        // Staff puede validar tickets y gestionar algunos aspectos
        $staffRole->givePermissionTo([
            'event.view',
            'ticket.view', 'ticket.validate',
            'payment.view', 'payment.process'
        ]);

        // Usuario regular
        $userRole->givePermissionTo([
            'event.view',
            'ticket.view'
        ]);
    }
}
