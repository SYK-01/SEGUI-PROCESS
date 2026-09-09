import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../services/Auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  nomUsuario: string;
  opciones: { ruta: string; icono: string; etiqueta: string }[];

  constructor(private authService: AuthService, private router: Router) {
    this.nomUsuario = this.authService.obtenerNombreUsuario();

    const esAdmin = this.authService.esAdmin();

    this.opciones = [
      { ruta: 'tablero',   icono: 'view_kanban', etiqueta: 'Tablero' },
      { ruta: 'dashboard', icono: 'insights',     etiqueta: 'Dashboard' },
      { ruta: 'gantt',     icono: 'view_timeline', etiqueta: 'Gantt' },
      { ruta: 'imprimir',  icono: 'print',        etiqueta: 'Imprimir' },
      // Equipo y Usuarios son mantenimiento (alta/edición/baja): solo Admin.
      // Ver el listado de integrantes (para asignar responsables) no pasa por
      // aquí, sigue disponible para todos dentro del tablero.
      ...(esAdmin ? [
        { ruta: 'equipo',    icono: 'groups',              etiqueta: 'Equipo' },
        { ruta: 'usuarios',  icono: 'manage_accounts',     etiqueta: 'Usuarios' }
      ] : [])
    ];
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
