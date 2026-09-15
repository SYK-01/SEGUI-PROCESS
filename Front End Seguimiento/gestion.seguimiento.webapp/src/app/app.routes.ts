import { Routes } from '@angular/router';
import { authGuard } from './components/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: 'pages',
     canActivate: [authGuard],
    loadChildren: () => import('./components/pages/pages.routes').then(r => r.PAGES_ROUTES)
  },
  { path: '', redirectTo: 'pages/tablero', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages/tablero' }
];
