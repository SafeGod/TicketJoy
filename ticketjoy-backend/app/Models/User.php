<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Log;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'institutional_id',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'organizer_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function hasRole($roleName)
    {
        try {
            return $this->roles()->where('name', $roleName)->exists();
        } catch (\Exception $e) {
            Log::warning('Could not check role for user ' . $this->id . ': ' . $e->getMessage());
            return false;
        }
    }

    public function hasPermission($permissionName)
    {
        try {
            return $this->roles()
                ->whereHas('permissions', function ($query) use ($permissionName) {
                    $query->where('name', $permissionName);
                })
                ->exists();
        } catch (\Exception $e) {
            Log::warning('Could not check permission for user ' . $this->id . ': ' . $e->getMessage());
            return false;
        }
    }

    public function assignRole($role)
    {
        try {
            if (is_string($role)) {
                $role = Role::where('name', $role)->firstOrFail();
            }

            $this->roles()->syncWithoutDetaching([$role->id]);
        } catch (\Exception $e) {
            Log::error('Could not assign role to user ' . $this->id . ': ' . $e->getMessage());
        }
    }

    public function getRoleNames()
    {
        try {
            return $this->roles()->pluck('name');
        } catch (\Exception $e) {
            Log::warning('Could not get role names for user ' . $this->id . ': ' . $e->getMessage());
            return collect();
        }
    }

    public function getAllPermissions()
    {
        try {
            $permissions = collect();

            foreach ($this->roles as $role) {
                $permissions = $permissions->merge($role->permissions);
            }

            return $permissions->unique('id');
        } catch (\Exception $e) {
            Log::warning('Could not get permissions for user ' . $this->id . ': ' . $e->getMessage());
            return collect();
        }
    }
}
