
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { MATERIAL_MODULES } from '../../../material/material.imports';
import { SistemasService } from '../../../services/Sistemas.service';
import { EquipoService } from '../../../services/Equipo.service';
import { TicketsService } from '../../../services/Tickets.service';
import { AuthService } from '../../../services/Auth.service';
import { Sistema } from '../../../interfaces/models/Sistema.interface';
import { MiembroEquipo } from '../../../interfaces/models/MiembroEquipo.interface';
import { Ticket } from '../../../interfaces/models/Ticket.interface';

import {
  COLUMNA_A_ESTADO_DEFECTO,
  COLUMNA_COLOR,
  Columna,
  COLUMNAS,
  ESTADO_A_COLUMNA,
  ESTADO_FINAL,
  EstadoReal,
  ESTADOS_REALES,
  PRIORIDADES,
  SUBESTADO_CORTO,
  SUBESTADOS_CERRADO,
  TIPO_COLOR,
  TIPO_COLOR_WASH,
  TIPOS
} from '../../../constants/estados.constants';

interface EditingTicket {
  Accion: 'INS' | 'UPD';
  Num_Ticket?: number | null;
  Cod_Sistema: number | null;
  Tipo: string;
  Titulo: string;
  Descripcion: string;
  Estado: EstadoReal;
  Prioridad: string;
  Cod_Responsable: number | null;
  Fecha_Creacion: string;
  Fecha_Real_Final: string;
  Fecha_Estimada_Inicio: string;
  Fecha_Estimada_Entrega: string;
}

@Component({
  selector: 'app-tablero',
  standalone: true,
  imports: [CommonModule, FormsModule, ...MATERIAL_MODULES],
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.scss']
})


export class TableroComponent implements OnInit {

  columnas = COLUMNAS;
  estadosReales = ESTADOS_REALES;
  subestadosCerrado = SUBESTADOS_CERRADO;
  tipos = TIPOS;
  prioridades = PRIORIDADES;

  sistemas: Sistema[] = [];
  equipo: MiembroEquipo[] = [];
  tickets: Ticket[] = [];

  sistemaActivo: number | null = null;
  filterResponsable: number | null = null;
  filterTipo: string = '';

  modalAbierto = false;
  editing: EditingTicket | null = null;
  guardando = false;
  focoFechaFin = false;

  columnaColor = COLUMNA_COLOR;
  tipoColor = TIPO_COLOR;
  tipoColorWash = TIPO_COLOR_WASH;

  prioridadColor: Record<string, string> = {
    'Alta': 'var(--danger)',
    'Medio': 'var(--enproceso)',
    'Baja': 'var(--cerrado)'
  };

  
  constructor(
    private sistemasService: SistemasService,
    private equipoService: EquipoService,
    private ticketsService: TicketsService,
    private authService: AuthService
  ) { }

  /** Solo el Admin ve y reasigna tickets de todo el equipo; un usuario normal
   *  solo trabaja con los suyos (el Back End ya filtra/valida esto también). */
  get esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  ngOnInit(): void {
    this.cargarSistemas();
    this.cargarEquipo();
    this.cargarTickets();
  }

  cargarSistemas(): void {
    this.sistemasService.listar().subscribe({
      next: (res) => {
        this.sistemas = res;
        if (!this.sistemaActivo && res.length) {
          this.sistemaActivo = res[0].Cod_Sistema;
        }
      },
      error: () => this.toastError('No se pudieron cargar los sistemas.')
    });
  }

  cargarEquipo(): void {
    this.equipoService.listar().subscribe({
      next: (res) => this.equipo = res,
      error: () => this.toastError('No se pudo cargar el equipo.')
    });
  }

  cargarTickets(): void {
    this.ticketsService.listar().subscribe({
      next: (res) => this.tickets = res,
      error: () => this.toastError('No se pudieron cargar los tickets.')
    });
  }

  get ticketsFiltrados(): Ticket[] {
    return this.tickets
      .filter(t => t.Cod_Sistema === this.sistemaActivo)
      .filter(t => !this.filterResponsable || t.Cod_Responsable === this.filterResponsable)
      .filter(t => !this.filterTipo || t.Tipo === this.filterTipo);
  }

  /** Columna del tablero (Pendiente/Programado/En Proceso/Cerrado) a la que pertenece el ticket. */
  columnaDe(t: Ticket): Columna {
    return ESTADO_A_COLUMNA[t.Estado];
  }

  /** Sub-etiqueta que se ve solo dentro de la columna "Cerrado" (validación funcional / aprobación / entregado). */
  subEstadoCorto(t: Ticket): string {
    return SUBESTADO_CORTO[t.Estado] || '';
  }

  columna(col: Columna): Ticket[] {
    return this.ticketsFiltrados.filter(t => this.columnaDe(t) === col);
  }

  get totalActivos(): number {
    return this.tickets.filter(t => this.columnaDe(t) !== 'Cerrado').length;
  }

  get totalIncidentesAbiertos(): number {
    return this.tickets.filter(t => t.Tipo === 'INCIDENCIA' && this.columnaDe(t) !== 'Cerrado').length;
  }

  get totalResueltos(): number {
    return this.tickets.filter(t => this.columnaDe(t) === 'Cerrado').length;
  }

  get totalGeneral(): number {
  return (this.totalActivos || 0) + (this.totalIncidentesAbiertos || 0) + (this.totalResueltos || 0) || 1;
  }

  cargaPorSistema(): { sistema: Sistema; n: number }[] {
    return this.sistemas.map(s => ({
      sistema: s,
      n: this.tickets.filter(t => t.Cod_Sistema === s.Cod_Sistema && this.columnaDe(t) !== 'Cerrado').length
    }));
  }

  cargaMax(): number {
    return Math.max(1, ...this.cargaPorSistema().map(c => c.n));
  }

  setSistemaActivo(cod: number): void {
    this.sistemaActivo = this.sistemaActivo === cod ? null : cod;
  }

  

  /**
   * Exporta a un Excel real (.xlsx) lo que se está viendo en el tablero
   * ahora mismo (sistema activo + filtros de responsable/tipo aplicados):
   * una hoja por columna (Pendiente/Programado/En Proceso/Cerrado), cada
   * una con su fila de encabezado. No navega a otra pantalla — genera y
   * descarga el archivo directo desde este mismo botón.
   */
  exportarExcel(): void {
    const libro = XLSX.utils.book_new();
    const encabezados = [
      'Código', 'Sistema', 'Tipo', 'Prioridad', 'Título', 'Descripción',
      'Responsable', 'Estado', 'Fecha creación', 'Fecha fin',
      'Inicio estimado', 'Entrega estimada'
    ];

    this.columnas.forEach(col => {
      const filas = this.columna(col).map(t => [
        t.Codigo,
        t.Nom_Sistema,
        t.Tipo,
        t.Prioridad,
        t.Titulo,
        t.Descripcion || '',
        t.Nom_Responsable || 'Sin asignar',
        t.Estado,
        this.formatoFechaExcel(t.Fecha_Creacion),
        this.formatoFechaExcel(t.Fecha_Real_Final),
        this.formatoFechaExcel(t.Fecha_Estimada_Inicio),
        this.formatoFechaExcel(t.Fecha_Estimada_Entrega)
      ]);

      const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);
      XLSX.utils.book_append_sheet(libro, hoja, col);
    });

    const sistema = this.sistemas.find(s => s.Cod_Sistema === this.sistemaActivo)?.Nom_Sistema || 'Tablero';
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Tablero_${sistema}_${fecha}.xlsx`.replace(/\s+/g, '_'));
  }

  /** dd/mm/aaaa para el Excel (mismo formato que se ve en el modal de edición); vacío si no hay fecha. */
  private formatoFechaExcel(fecha?: string | null): string {
    if (!fecha) return '';
    const [y, m, d] = fecha.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  private todayStr(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** Estados reales agrupados por columna, para los <optgroup> del selector detallado del modal. */
  estadosDeColumna(col: Columna): EstadoReal[] {
    return ESTADOS_REALES.filter(e => ESTADO_A_COLUMNA[e] === col);
  }

  abrirNuevoTicket(): void {
    this.editing = {
      Accion: 'INS',
      Cod_Sistema: this.sistemaActivo,
      Tipo: 'REQUERIMIENTO',
      Titulo: '',
      Descripcion: '',
      Estado: 'Pendiente (No Programado)',
      Prioridad: 'Medio',
      // Un usuario no-Admin siempre crea tickets a su propio nombre (el
      // Back End lo fuerza igual, esto es solo para que el modal lo refleje).
      Cod_Responsable: this.esAdmin ? null : this.authService.obtenerCodMiembro(),
      Fecha_Creacion: this.todayStr(),
      Fecha_Real_Final: '',
      Fecha_Estimada_Inicio: '',
      Fecha_Estimada_Entrega: ''
    
    };
    this.focoFechaFin = false;
    this.modalAbierto = true;
  }

  abrirEditarTicket(t: Ticket, focoFechaFin = false): void {
    this.editing = {
      Accion: 'UPD',
      Num_Ticket: t.Num_Ticket,
      Cod_Sistema: t.Cod_Sistema,
      Tipo: t.Tipo,
      Titulo: t.Titulo,
      Descripcion: t.Descripcion || '',
      Estado: t.Estado,
      Prioridad: t.Prioridad,
      Cod_Responsable: t.Cod_Responsable ?? null,
      Fecha_Creacion: t.Fecha_Creacion?.slice(0, 10),
      Fecha_Real_Final: t.Fecha_Real_Final ? t.Fecha_Real_Final.slice(0, 10) : '',
      Fecha_Estimada_Inicio: t.Fecha_Estimada_Inicio ? t.Fecha_Estimada_Inicio.slice(0, 10) : '',
      Fecha_Estimada_Entrega: t.Fecha_Estimada_Entrega ? t.Fecha_Estimada_Entrega.slice(0, 10) : ''
    };
    this.focoFechaFin = focoFechaFin;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.editing = null;
    this.focoFechaFin = false;
  }

  guardarTicket(): void {
    if (!this.editing) return;

    if (!this.editing.Titulo?.trim()) {
      this.toastError('El título es obligatorio.');
      return;
    }
    if (!this.editing.Cod_Sistema) {
      this.toastError('Selecciona un sistema.');
      return;
    }
    if (SUBESTADOS_CERRADO.indexOf(this.editing.Estado) !== -1 && !this.editing.Fecha_Real_Final) {
      this.toastError('Falta colocar la fecha fin para dejar el ticket en "Cerrado".');
      this.focoFechaFin = true;
      return;
    }

    this.guardando = true;

    this.ticketsService.mantenimiento({
      Accion: this.editing.Accion,
      Num_Ticket: this.editing.Num_Ticket ?? null,
      Cod_Sistema: this.editing.Cod_Sistema,
      Tipo: this.editing.Tipo,
      Titulo: this.editing.Titulo,
      Descripcion: this.editing.Descripcion,
      Estado: this.editing.Estado,
      Prioridad: this.editing.Prioridad,
      Cod_Responsable: this.editing.Cod_Responsable,
      Fecha_Creacion: this.editing.Fecha_Creacion || null,
      Fecha_Real_Final: this.editing.Fecha_Real_Final || null,
      Fecha_Estimada_Inicio: this.editing.Fecha_Estimada_Inicio || null,
      Fecha_Estimada_Entrega: this.editing.Fecha_Estimada_Entrega || null
    }).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.Codigo === 1) {
          this.cerrarModal();
          this.cargarTickets();
          this.toastOk(res.Mensaje);
        } else {
          this.toastError(res.Mensaje);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.toastError(err.message || 'No se pudo guardar el ticket.');
      }
    });
  }

  eliminarTicket(t: Ticket): void {
    Swal.fire({
      icon: 'warning',
      title: `¿Eliminar ${t.Codigo}?`,
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8f2121'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.ticketsService.mantenimiento({
        Accion: 'DEL',
        Num_Ticket: t.Num_Ticket,
        Cod_Sistema: t.Cod_Sistema,
        Tipo: t.Tipo,
        Titulo: t.Titulo,
        Estado: t.Estado,
        Prioridad: t.Prioridad
      }).subscribe({
        next: (res) => {
          if (res.Codigo === 1) {
            this.cargarTickets();
            this.toastOk(res.Mensaje);
          } else {
            this.toastError(res.Mensaje);
          }
        },
        error: (err: HttpErrorResponse) => this.toastError(err.message || 'No se pudo eliminar el ticket.')
      });
    });
  }

  /**
   * Selector rápido de columna en la tarjeta. Pendiente/Programado/En Proceso
   * se mueven directo; Cerrado siempre intenta cerrar el ticket por completo
   * y exige tener la fecha fin (si falta, se avisa y se abre el modal en
   * lugar de guardar un estado a medias).
   */
  moverColumna(t: Ticket, destino: Columna): void {
    if (destino === this.columnaDe(t)) return;

    if (destino === 'Cerrado') {
      this.intentarCerrar(t);
      return;
    }

    const estadoDestino = COLUMNA_A_ESTADO_DEFECTO[destino]!;
    this.ticketsService.moverEstado({ Num_Ticket: t.Num_Ticket, Estado: estadoDestino, Fecha_Real_Final: null }).subscribe({
      next: (res) => {
        if (res.Codigo === 1) {
          this.cargarTickets();
        } else {
          this.toastError(res.Mensaje);
        }
      },
      error: (err: HttpErrorResponse) => this.toastError(err.message || 'No se pudo actualizar el estado.')
    });
  }

  private intentarCerrar(t: Ticket): void {
    if (!t.Fecha_Real_Final) {
      this.toastError(`Falta colocar la fecha fin para cerrar el ticket "${t.Codigo}".`);
      this.abrirEditarTicket(t, true);
      return;
    }

    this.ticketsService.moverEstado({
      Num_Ticket: t.Num_Ticket,
      Estado: ESTADO_FINAL,
      Fecha_Real_Final: t.Fecha_Real_Final
    }).subscribe({
      next: (res) => {
        if (res.Codigo === 1) {
          this.cargarTickets();
          this.toastOk(`Ticket "${t.Codigo}" cerrado correctamente.`);
        } else {
          // La API valida de nuevo por su cuenta (ver SEG_CF_MOVER_ESTADO_TICKET);
          // si igual falta la fecha fin, el mensaje ya viene listo para mostrar.
          this.toastError(res.Mensaje);
        }
      },
      error: (err: HttpErrorResponse) => this.toastError(err.message || 'No se pudo cerrar el ticket.')
    });
  }

  private toastOk(mensaje: string): void {
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: mensaje, showConfirmButton: false, timer: 2200 });
  }

  private toastError(mensaje: string): void {
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'error', title: mensaje, showConfirmButton: false, timer: 3200 });
  }
}
