import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AppLayoutComponent } from './shared/components/app-layout/app-layout.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'events',
        loadChildren: () => import('./modules/events/events.module').then(m => m.EventsModule)
      },
      {
        path: 'tickets',
        loadChildren: () => import('./modules/tickets/tickets.module').then(m => m.TicketsModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        data: { roles: ['admin'] }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

// Agregar estas opciones para usar Hash Location Strategy
const routerOptions: ExtraOptions = {
  useHash: true, // Esto ayuda con los problemas de navegación en SPA
  scrollPositionRestoration: 'enabled' // Restaura la posición de scroll al navegar
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }