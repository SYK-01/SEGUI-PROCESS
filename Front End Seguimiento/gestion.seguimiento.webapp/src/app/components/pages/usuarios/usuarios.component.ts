import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MATERIAL_MODULES } from '../../../material/material.imports';
import { UsuariosService } from '../../../services/Usuarios.service';
import { EquipoService } from '../../../services/Equipo.service';
import { Usuario } from '../../../interfaces/models/Usuario.interface';
import { MiembroEquipo } from '../../../interfaces/models/MiembroEquipo.interface';

interface EditingUsuario {
  Accion: 'INS' | 'UPD';
  Cod_Usuario?: number | null;
  Nom_Usuario: string;
  Nom_Completo: string;
  Password: string;
  Rol: 'Admin' | 'Usuario';
  Cod_Miembro: number | null;
}

/**
 * Mantenimiento de cuentas de acceso (solo Admin, ver adminGuard en las rutas
 * y [Authorize(Roles="Admin")] en UsuariosController). Cod_Miembro vincula la
 * cuenta con un integrante del Equipo: eso es lo que hace que ese usuario solo
 * vea/administre sus propios tickets (ver TicketsController/DashboardController).
 */
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ...MATERIAL_MODULES],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  equipo: MiembroEquipo[] = [];

  modalAbierto = false;
  editing: EditingUsuario | null = null;
  guardando = false;

  constructor(
    private usuariosService: UsuariosService,
    private equipoService: EquipoService
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEquipo();
  }

  cargarUsuarios(): void {
    this.usuariosService.listar().subscribe({
      next: (res) => this.usuarios = res,
      error: () => this.toastError('No se pudieron cargar los usuarios.')
    });
  }

  cargarEquipo(): void {
    this.equipoService.listar().subscribe({
      next: (res) => this.equipo = res,
      error: () => this.toastError('No se pudo cargar el equipo.')
    });
  }

  /** Integrantes que ya tienen una cuenta activa vinculada, para no ofrecerlos dos veces. */
  miembroDisponible(codMiembro: number): boolean {
    if (this.editing?.Cod_Miembro === codMiembro) return true;
    return !this.usuarios.some(u => u.Activo && u.Cod_Miembro === codMiembro);
  }

  abrirNuevoUsuario(): void {
    this.editing = {
      Accion: 'INS',
      Nom_Usuario: '',
      Nom_Completo: '',
      Password: '',
      Rol: 'Usuario',
      Cod_Miembro: null
    };
    this.modalAbierto = true;
  }

  abrirEditarUsuario(u: Usuario): void {
    this.editing = {
      Accion: 'UPD',
      Cod_Usuario: u.Cod_Usuario,
      Nom_Usuario: u.Nom_Usuario,
      Nom_Completo: u.Nom_Completo,
      Password: '',
      Rol: u.Rol,
      Cod_Miembro: u.Cod_Miembro ?? null
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.editing = null;
  }

  guardarUsuario(): void {
    if (!this.editing) return;

    if (!this.editing.Nom_Usuario?.trim()) {
      this.toastError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!this.editing.Nom_Completo?.trim()) {
      this.toastError('El nombre completo es obligatorio.');
      return;
    }
    if (this.editing.Accion === 'INS' && !this.editing.Password?.trim()) {
      this.toastError('La contraseña es obligatoria para crear el usuario.');
      return;
    }

    this.guardando = true;

    this.usuariosService.mantenimiento({
      Accion: this.editing.Accion,
      Cod_Usuario: this.editing.Cod_Usuario ?? null,
      Nom_Usuario: this.editing.Nom_Usuario,
      Nom_Completo: this.editing.Nom_Completo,
      Password: this.editing.Password?.trim() ? this.editing.Password : null,
      Rol: this.editing.Rol,
      Cod_Miembro: this.editing.Cod_Miembro
    }).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.Codigo === 1) {
          this.cerrarModal();
          this.cargarUsuarios();
          this.toastOk(res.Mensaje);
        } else {
          this.toastError(res.Mensaje);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.toastError(err.message || 'No se pudo guardar el usuario.');
      }
    });
  }

  desactivar(u: Usuario): void {
    Swal.fire({
      icon: 'warning',
      title: `¿Desactivar a ${u.Nom_Completo}?`,
      text: 'No podrá volver a iniciar sesión hasta que se reactive desde la base de datos.',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8f2121'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.usuariosService.mantenimiento({ Accion: 'DEL', Cod_Usuario: u.Cod_Usuario }).subscribe({
        next: (res) => {
          if (res.Codigo === 1) {
            this.cargarUsuarios();
            this.toastOk(res.Mensaje);
          } else {
            this.toastError(res.Mensaje);
          }
        },
        error: (err: HttpErrorResponse) => this.toastError(err.message || 'No se pudo desactivar el usuario.')
      });
    });
  }

  private toastOk(mensaje: string): void {
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: mensaje, showConfirmButton: false, timer: 2200 });
  }

  private toastError(mensaje: string): void {
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'error', title: mensaje, showConfirmButton: false, timer: 3200 });
  }
}
