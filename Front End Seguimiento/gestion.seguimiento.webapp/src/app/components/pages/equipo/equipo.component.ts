import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MATERIAL_MODULES } from '../../../material/material.imports';
import { EquipoService } from '../../../services/Equipo.service';
import { MiembroEquipo } from '../../../interfaces/models/MiembroEquipo.interface';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule, ...MATERIAL_MODULES],
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.scss']
})
export class EquipoComponent implements OnInit {

  equipo: MiembroEquipo[] = [];
  nuevoMiembro = '';
  guardando = false;

  editandoId: number | null = null;
  editNombre = '';

  constructor(private equipoService: EquipoService) { }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.equipoService.listar().subscribe({
      next: (res) => this.equipo = res,
      error: () => this.toastError('No se pudo cargar el equipo.')
    });
  }

  agregar(): void {
    const nombre = this.nuevoMiembro.trim();
    if (!nombre) return;

    this.guardando = true;
    this.equipoService.mantenimiento({ Accion: 'INS', Nom_Miembro: nombre }).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.Codigo === 1) {
          this.nuevoMiembro = '';
          this.cargar();
        } else {
          this.toastError(res.Mensaje);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.toastError(err.message || 'No se pudo agregar al integrante.');
      }
    });
  }

  editar(m: MiembroEquipo): void {
    this.editandoId = m.Cod_Miembro;
    this.editNombre = m.Nom_Miembro;
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editNombre = '';
  }

  guardarEdicion(m: MiembroEquipo): void {
    const nombre = this.editNombre.trim();
    if (!nombre) return;

    this.guardando = true;
    this.equipoService.mantenimiento({ Accion: 'UPD', Cod_Miembro: m.Cod_Miembro, Nom_Miembro: nombre }).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.Codigo === 1) {
          this.cancelarEdicion();
          this.cargar();
        } else {
          this.toastError(res.Mensaje);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.toastError(err.message || 'No se pudo actualizar al integrante.');
      }
    });
  }

  eliminar(m: MiembroEquipo): void {
    Swal.fire({
      icon: 'warning',
      title: `¿Eliminar a ${m.Nom_Miembro}?`,
      text: 'Sus tickets quedarán sin responsable asignado.',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8f2121'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.equipoService.mantenimiento({ Accion: 'DEL', Cod_Miembro: m.Cod_Miembro }).subscribe({
        next: (res) => {
          if (res.Codigo === 1) {
            this.cargar();
          } else {
            this.toastError(res.Mensaje);
          }
        },
        error: (err: HttpErrorResponse) => this.toastError(err.message || 'No se pudo eliminar al integrante.')
      });
    });
  }

  private toastError(mensaje: string): void {
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'error', title: mensaje, showConfirmButton: false, timer: 3000 });
  }
}
