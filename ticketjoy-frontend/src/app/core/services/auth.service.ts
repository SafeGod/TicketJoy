import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest 
} from '../models/auth.model';
import { User } from '../models/user.model';

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
  
  // Almacenar la URL de redirección después del inicio de sesión
  public redirectUrl: string | null = null;

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
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
    } catch (error) {
      // Si hay algún error en el parsing, limpiar datos potencialmente corruptos
      console.error('Error loading auth data from storage', error);
      this.clearAuthData();
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
    this.redirectUrl = null;
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