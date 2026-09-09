import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      let errorMessage = 'Ha ocurrido un error desconocido.';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
        console.error('Error del cliente:', errorMessage);
      } else {
        console.error('Error del servidor:', error);

        if (error.status === 401) {
          localStorage.clear();
          router.navigate(['/', 'auth', 'login']);
          errorMessage = error.error?.mensaje || 'No autorizado, por favor inicia sesión nuevamente.';
          return throwError(() => error);
        } else if (error.status === 0) {
          errorMessage = 'No hay respuesta del servidor. Verifica tu conexión.';
        } else if (error.error?.mensaje) {
          errorMessage = error.error.mensaje;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else {
          errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
