import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'logout',
        loadComponent: () => import('./logout/logout.component').then(c => c.LogoutComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
