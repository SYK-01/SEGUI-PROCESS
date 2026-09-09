import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../interfaces/requests/LoginRequest.interface';
import { LoginResponse } from '../interfaces/responses/LoginResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private controller = 'Auth';

  constructor(private http: HttpClient, private router: Router) { }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/${this.controller}/Login`, data).pipe(
      tap(res => {
        if (res.Codigo === 1 && res.Token) {
          localStorage.setItem('token', res.Token);
          localStorage.setItem('codUsuario', String(res.Cod_Usuario ?? ''));
          localStorage.setItem('nomUsuario', res.Nom_Usuario ?? '');
          localStorage.setItem('nomCompleto', res.Nom_Completo ?? '');
          localStorage.setItem('rol', res.Rol ?? '');
          localStorage.setItem('codMiembro', res.Cod_Miembro != null ? String(res.Cod_Miembro) : '');
        }
      })
    );
  }

  /** true si el usuario logueado es Admin (ve y administra todo). */
  esAdmin(): boolean {
    return localStorage.getItem('rol') === 'Admin';
  }

  /** Integrante del equipo al que corresponde esta cuenta, o null si no está vinculada (ni es Admin). */
  obtenerCodMiembro(): number | null {
    const v = localStorage.getItem('codMiembro');
    return v ? Number(v) : null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    try {
      const expiry = JSON.parse(atob(token.split('.')[1])).exp;
      const ahora = Math.floor(new Date().getTime() / 1000);

      if (ahora <= expiry) {
        return true;
      }
    } catch {
      // token con formato inválido
    }

    localStorage.clear();
    return false;
  }

  obtenerNombreUsuario(): string {
    return localStorage.getItem('nomCompleto') || localStorage.getItem('nomUsuario') || '';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/', 'auth', 'login']);
  }
}
