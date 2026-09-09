import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../../services/Auth.service';

/**
 * Protege las pantallas de administración (Usuarios, Equipo): un usuario
 * autenticado pero sin rol Admin es devuelto al tablero en vez de ver la
 * pantalla. authGuard ya garantiza que llegue autenticado antes que este guard.
 */
export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  return inject(AuthService).esAdmin()
    ? true
    : inject(Router).createUrlTree(['/pages/tablero']);
};
