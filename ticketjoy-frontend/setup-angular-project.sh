#!/bin/bash

# Script para generar automáticamente todos los archivos del proyecto Angular
# Este script debe ejecutarse desde la raíz del proyecto Angular (ticketjoy-frontend)

echo "Iniciando generación de archivos para TicketJoy Frontend..."

# Crear estructura de carpetas
echo "Creando estructura de carpetas..."
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/services
mkdir -p src/app/core/models

mkdir -p src/app/shared/components
mkdir -p src/app/shared/pipes
mkdir -p src/app/shared/directives

mkdir -p src/app/modules/auth/components/login
mkdir -p src/app/modules/auth/components/register
mkdir -p src/app/modules/auth/services
mkdir -p src/app/modules/auth/guards

mkdir -p src/app/modules/events/components
mkdir -p src/app/modules/events/services

mkdir -p src/app/modules/tickets/components
mkdir -p src/app/modules/tickets/services

mkdir -p src/app/modules/payments/components
mkdir -p src/app/modules/payments/services

mkdir -p src/app/modules/dashboard/components

mkdir -p src/app/modules/admin/components
mkdir -p src/app/modules/admin/services

mkdir -p src/environments

# Crear archivos de entorno
echo "Creando archivos de entorno..."
cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  allowedEmailDomain: 'fet.edu.co',
  appName: 'TicketJoy'
};
EOF

cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: 'https://api.ticketjoy.fet.edu/api',
  allowedEmailDomain: 'fet.edu.co',
  appName: 'TicketJoy'
};
EOF

# Crear modelos
echo "Creando modelos..."
cat > src/app/core/models/user.model.ts << 'EOF'
export interface User {
  id: number;
  name: string;
  email: string;
  institutional_id: string;
  phone?: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}
EOF

cat > src/app/core/models/auth.model.ts << 'EOF'
export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  roles: string[];
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  institutional_id: string;
  phone?: string;
}
EOF

cat > src/app/core/models/event.model.ts << 'EOF'
export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  price: number;
  image?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer_id: number;
  created_at?: string;
  updated_at?: string;
  categories?: EventCategory[];
  organizer?: User;
  available_tickets?: number;
}
EOF

cat > src/app/core/models/event-category.model.ts << 'EOF'
export interface EventCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}
EOF

cat > src/app/core/models/ticket.model.ts << 'EOF'
export interface Ticket {
  id: number;
  event_id: number;
  user_id: number;
  ticket_number: string;
  status: 'pending' | 'confirmed' | 'used' | 'cancelled';
  price: number;
  purchased_at?: string;
  qr_code?: string;
  created_at?: string;
  updated_at?: string;
  event?: Event;
  user?: User;
  payment?: Payment;
}
EOF

cat > src/app/core/models/payment.model.ts << 'EOF'
export interface Payment {
  id: number;
  user_id: number;
  ticket_id?: number;
  payment_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  ticket?: Ticket;
}
EOF

cat > src/app/core/models/pagination.model.ts << 'EOF'
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
EOF

# Crear servicio de autenticación
echo "Creando servicios..."
cat > src/app/core/services/auth.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private rolesSubject = new BehaviorSubject<string[]>([]);
  private permissionsSubject = new BehaviorSubject<string[]>([]);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public roles$ = this.rolesSubject.asObservable();
  public permissions$ = this.permissionsSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user');
    const roles = localStorage.getItem('roles');
    const permissions = localStorage.getItem('permissions');
    const token = localStorage.getItem('token');

    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }

    if (roles) {
      this.rolesSubject.next(JSON.parse(roles));
    }

    if (permissions) {
      this.permissionsSubject.next(JSON.parse(permissions));
    }

    if (token) {
      this.tokenSubject.next(token);
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError(error => {
        // Even if the server request fails, clear local auth data
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('roles', JSON.stringify(response.roles));
    localStorage.setItem('permissions', JSON.stringify(response.permissions));

    this.currentUserSubject.next(response.user);
    this.tokenSubject.next(response.access_token);
    this.rolesSubject.next(response.roles);
    this.permissionsSubject.next(response.permissions);
  }

  private clearAuthData(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions');

    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.rolesSubject.next([]);
    this.permissionsSubject.next([]);
  }

  hasRole(role: string): boolean {
    const roles = this.rolesSubject.value;
    return roles.includes(role);
  }

  hasPermission(permission: string): boolean {
    const permissions = this.permissionsSubject.value;
    return permissions.includes(permission);
  }

  get isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }
}
EOF

# Crear interceptor HTTP
echo "Creando interceptor HTTP..."
cat > src/app/core/interceptors/auth.interceptor.ts << 'EOF'
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the token from auth service
    const token = this.authService.token;

    // Clone the request and add the token if available
    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized error
        if (error.status === 401) {
          // Log the user out and redirect to login
          this.authService.logout().subscribe(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          });
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
EOF

# Crear auth guard
echo "Creando guardias..."
cat > src/app/core/guards/auth.guard.ts << 'EOF'
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAuth(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAuth(route, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn) {
      // Check for required roles if specified
      const requiredRoles = route.data['roles'] as string[] | undefined;
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
        if (!hasRequiredRole) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      // Check for required permissions if specified
      const requiredPermissions = route.data['permissions'] as string[] | undefined;
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some(
          permission => this.authService.hasPermission(permission)
        );
        if (!hasRequiredPermission) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    }

    // Not logged in, redirect to login with return URL
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
EOF

# Crear componentes
echo "Creando componentes de autenticación..."
# Login component
cat > src/app/modules/auth/components/login/login.component.ts << 'EOF'
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl = '/dashboard';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize the form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate([this.returnUrl]);
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value
    })
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        if (error.error && error.error.message) {
          this.error = error.error.message;
        } else if (error.error && error.error.errors) {
          // Handle validation errors
          const validationErrors = error.error.errors;
          const errorMessages = Object.keys(validationErrors).map(key => validationErrors[key][0]);
          this.error = errorMessages.join(', ');
        } else {
          this.error = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
        }
      }
    });
  }
}
EOF

cat > src/app/modules/auth/components/login/login.component.html << 'EOF'
<div class="min-h-screen bg-gray-100 flex items-center justify-center">
  <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-fet mb-2">TicketJoy</h1>
      <p class="text-gray-600">Sistema de Boletería FET</p>
    </div>

    <h2 class="text-2xl font-semibold mb-6 text-center">Iniciar Sesión</h2>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Error message -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <!-- Email field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
        <input 
          type="email" 
          formControlName="email" 
          id="email" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="correo@fet.edu.co"
          [ngClass]="{ 'border-red-500': submitted && f['email'].errors }"
        >
        <div *ngIf="submitted && f['email'].errors" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['email'].errors['required']">El correo es requerido</div>
          <div *ngIf="f['email'].errors['email']">Ingresa un correo válido</div>
        </div>
      </div>

      <!-- Password field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <div class="relative">
          <input 
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password" 
            id="password" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            [ngClass]="{ 'border-red-500': submitted && f['password'].errors }"
          >
          <button 
            type="button" 
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
            (click)="hidePassword = !hidePassword"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path *ngIf="hidePassword" stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path *ngIf="hidePassword" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path *ngIf="!hidePassword" stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </div>
        <div *ngIf="submitted && f['password'].errors" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['password'].errors['required']">La contraseña es requerida</div>
        </div>
      </div>

      <!-- Remember me and Forgot password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember_me" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
          <label for="remember_me" class="ml-2 block text-sm text-gray-700">
            Recordarme
          </label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      <!-- Submit button -->
      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          [disabled]="loading"
        >
          <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </div>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        ¿No tienes una cuenta? 
        <a routerLink="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">Regístrate aquí</a>
      </p>
    </div>
  </div>
</div>
EOF

cat > src/app/modules/auth/components/login/login.component.scss << 'EOF'
/* Add any specific styles for the login component here */
EOF

# Register component
cat > src/app/modules/auth/components/register/register.component.ts << 'EOF'
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;
  allowedEmailDomain = environment.allowedEmailDomain;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize the form
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.institutionalEmailValidator()]],
      institutional_id: ['', [Validators.required]],
      phone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  // Custom validator for institutional email
  institutionalEmailValidator() {
    return (control: any) => {
      const email = control.value;
      if (!email) {
        return null;
      }

      const domain = email.split('@')[1];
      if (domain !== this.allowedEmailDomain) {
        return { invalidDomain: true };
      }

      return null;
    };
  }

  // Custom validator for password matching
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.error && error.error.errors) {
            // Handle validation errors
            const validationErrors = error.error.errors;
            const errorMessages = Object.keys(validationErrors).map(key => validationErrors[key][0]);
            this.error = errorMessages.join(', ');
          } else {
            this.error = 'Error al registrarse. Por favor, intenta de nuevo.';
          }
        }
      });
  }
}
EOF

cat > src/app/modules/auth/components/register/register.component.html << 'EOF'
<div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-fet mb-2">TicketJoy</h1>
      <p class="text-gray-600">Sistema de Boletería FET</p>
    </div>

    <h2 class="text-2xl font-semibold mb-6 text-center">Crear Cuenta</h2>

    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Error message -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <!-- Name field -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
        <input 
          type="text" 
          formControlName="name" 
          id="name" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          [ngClass]="{ 'border-red-500': submitted && f['name'].errors }"
        >
        <div *ngIf="submitted && f['name'].errors" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['name'].errors['required']">El nombre es requerido</div>
          <div *ngIf="f['name'].errors['minlength']">El nombre debe tener al menos 3 caracteres</div>
        </div>
      </div>

      <!-- Institutional ID field -->
      <div>
        <label for="institutional_id" class="block text-sm font-medium text-gray-700 mb-1">ID Institucional</label>
        <input 
          type="text" 
          formControlName="institutional_id" 
          id="institutional_id" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          [ngClass]="{ 'border-red-500': submitted && f['institutional_id'].errors }"
        >
        <div *ngIf="submitted && f['institutional_id'].errors" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['institutional_id'].errors['required']">El ID institucional es requerido</div>
        </div>
      </div>

      <!-- Email field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
        <input 
          type="email" 
          formControlName="email" 
          id="email" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="correo@fet.edu.co"
          [ngClass]="{ 'border-red-500': submitted && f['email'].errors }"
        >
        <div *ngIf="submitted && f['email'].errors" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['email'].errors['required']">El correo es requerido</div>
          <div *ngIf="f['email'].errors['email']">Ingresa un correo válido</div>
          <div *ngIf="f['email'].errors['invalidDomain']">Debes usar tu correo institucional (@{{allowedEmailDomain}})</div>
        </div>
      </div>

      <!-- Phone field -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
        <input 
          type="tel" 
          formControlName="phone" 
          id="phone" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          [ngClass]="{ 'border-red-500': submitted && f['phone'].errors }"
        >
        <div *ngIf="submitted && f['phone'].errors" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['phone'].errors['pattern']">Ingresa un número de teléfono válido</div>
        </div>
      </div>

      <!-- Password field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <div class="relative">
          <input 
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password" 
            id="password" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            [ngClass]="{ 'border-red-500': submitted && f['password'].errors }"
          >
          <button 
            type="button" 
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
            (click)="hidePassword = !hidePassword"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path *ngIf="hidePassword" stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path *ngIf="hidePassword" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path *ngIf="!hidePassword" stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </div>
        <div *ngIf="submitted && f['password'].errors" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['password'].errors['required']">La contraseña es requerida</div>
          <div *ngIf="f['password'].errors['minlength']">La contraseña debe tener al menos 8 caracteres</div>
        </div>
      </div>

      <!-- Confirm Password field -->
      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
        <div class="relative">
          <input 
            [type]="hideConfirmPassword ? 'password' : 'text'"
            formControlName="password_confirmation" 
            id="password_confirmation" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            [ngClass]="{ 'border-red-500': submitted && (f['password_confirmation'].errors || registerForm.hasError('passwordMismatch')) }"
          >
          <button 
            type="button" 
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
            (click)="hideConfirmPassword = !hideConfirmPassword"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path *ngIf="hideConfirmPassword" stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path *ngIf="hideConfirmPassword" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path *ngIf="!hideConfirmPassword" stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </div>
        <div *ngIf="submitted && (f['password_confirmation'].errors || registerForm.hasError('passwordMismatch'))" class="text-red-500 text-sm mt-1">
          <div *ngIf="f['password_confirmation'].errors?.['required']">Confirmar contraseña es requerido</div>
          <div *ngIf="registerForm.hasError('passwordMismatch')">Las contraseñas no coinciden</div>
        </div>
      </div>

      <!-- Terms and conditions -->
      <div class="flex items-center">
        <input id="terms" name="terms" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
        <label for="terms" class="ml-2 block text-sm text-gray-700">
          Acepto los <a href="#" class="text-primary-600 hover:text-primary-500">Términos y Condiciones</a>
        </label>
      </div>

      <!-- Submit button -->
      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          [disabled]="loading"
        >
          <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </div>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        ¿Ya tienes una cuenta? 
        <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">Inicia sesión</a>
      </p>
    </div>
  </div>
</div>
EOF

cat > src/app/modules/auth/components/register/register.component.scss << 'EOF'
/* Add any specific styles for the register component here */
EOF

# Crear módulos
echo "Creando módulos Angular..."
# Auth Module
cat > src/app/modules/auth/auth.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
EOF

# Auth Routing Module
cat > src/app/modules/auth/auth-routing.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
EOF

# Dashboard Module
cat > src/app/modules/dashboard/dashboard.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
EOF

# Dashboard Component
cat > src/app/modules/dashboard/components/dashboard.component.ts << 'EOF'
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }
}
EOF

# Create placeholder dashboard component files
cat > src/app/modules/dashboard/components/dashboard.component.html << 'EOF'
<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
  <div class="bg-white rounded-lg shadow p-6">
    <p>Bienvenido al sistema de boletería TicketJoy.</p>
  </div>
</div>
EOF

cat > src/app/modules/dashboard/components/dashboard.component.scss << 'EOF'
/* Add any specific styles for the dashboard component here */
EOF

# Update Dashboard Module with Component
cat > src/app/modules/dashboard/dashboard.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
EOF

# Events Module
cat > src/app/modules/events/events.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EventsModule { }
EOF

# Tickets Module
cat > src/app/modules/tickets/tickets.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TicketsModule { }
EOF

# Admin Module
cat > src/app/modules/admin/admin.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
EOF

# App Routing Module
cat > src/app/app-routing.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'events',
    loadChildren: () => import('./modules/events/events.module').then(m => m.EventsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tickets',
    loadChildren: () => import('./modules/tickets/tickets.module').then(m => m.TicketsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
EOF

# App Module
cat > src/app/app.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
EOF

# App Component
cat > src/app/app.component.ts << 'EOF'
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TicketJoy';
}
EOF

cat > src/app/app.component.html << 'EOF'
<router-outlet></router-outlet>
EOF

cat > src/app/app.component.scss << 'EOF'
/* Add any global styles here */
EOF

echo "Configurando Tailwind CSS..."
# Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f51b5',
          '50': '#e8eaf6',
          '100': '#c5cae9',
          '200': '#9fa8da',
          '300': '#7986cb',
          '400': '#5c6bc0',
          '500': '#3f51b5',
          '600': '#3949ab',
          '700': '#303f9f',
          '800': '#283593',
          '900': '#1a237e',
        },
        secondary: {
          DEFAULT: '#ff4081',
          '50': '#fce4ec',
          '100': '#f8bbd0',
          '200': '#f48fb1',
          '300': '#f06292',
          '400': '#ec407a',
          '500': '#e91e63',
          '600': '#d81b60',
          '700': '#c2185b',
          '800': '#ad1457',
          '900': '#880e4f',
        },
        fet: '#003366', // Color principal de tu universidad
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
EOF

# Update styles.scss
cat > src/styles.scss << 'EOF'
/* Tailwind CSS */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Global styles */
html, body { 
  height: 100%; 
  margin: 0; 
  font-family: 'Roboto', sans-serif;
}
EOF

echo "¡Estructura del proyecto Angular generada con éxito!"
echo "Para iniciar el servidor de desarrollo, ejecuta:"
echo "ng serve"
