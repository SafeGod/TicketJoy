import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkAuth(route, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.isLoggedIn) {
      // Check for required roles if specified
      const requiredRoles = route.data['roles'] as string[] | undefined;
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
        if (!hasRequiredRole) {
          // Redirigir a la página de no autorizado usando UrlTree
          return this.router.parseUrl('/unauthorized');
        }
      }

      // Check for required permissions if specified
      const requiredPermissions = route.data['permissions'] as string[] | undefined;
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some(
          permission => this.authService.hasPermission(permission)
        );
        if (!hasRequiredPermission) {
          // Redirigir a la página de no autorizado usando UrlTree
          return this.router.parseUrl('/unauthorized');
        }
      }

      return true;
    }

    // Almacenar la URL a la que se intentaba acceder para redirigir después del login
    this.authService.redirectUrl = state.url;
    
    // Usar UrlTree para redirigir en lugar de router.navigate
    return this.router.parseUrl('/auth/login');
  }
}