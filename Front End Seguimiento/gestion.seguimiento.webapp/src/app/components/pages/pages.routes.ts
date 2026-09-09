import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';
import { adminGuard } from '../auth/guards/admin.guard';
import { PagesComponent } from './pages.component';

export const PAGES_ROUTES: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tablero'
      },
      {
        path: 'tablero',
        loadComponent: () => import('./tablero/tablero.component').then(c => c.TableroComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'gantt',
        loadComponent: () => import('./gantt/gantt.component').then(c => c.GanttComponent)
      },
      {
        path: 'imprimir',
        loadComponent: () => import('./imprimir/imprimir.component').then(c => c.ImprimirComponent)
      },
      {
        // Ver el equipo (para el combo de responsables) queda abierto a todos vía
        // EquipoService, pero la pantalla de mantenimiento es solo para Admin.
        path: 'equipo',
        canActivate: [adminGuard],
        loadComponent: () => import('./equipo/equipo.component').then(c => c.EquipoComponent)
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./usuarios/usuarios.component').then(c => c.UsuariosComponent)
      }
    ]
  }
];
