import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../../material/material.imports';
import { TicketsService } from '../../../services/Tickets.service';
import { Ticket } from '../../../interfaces/models/Ticket.interface';
import { COLUMNA_COLOR, COLUMNAS, Columna, ESTADO_A_COLUMNA } from '../../../constants/estados.constants';

type Vista = 'dia' | 'mes';

interface BarraTicket {
  ticket: Ticket;
  columna: Columna;
  inicio: Date;
  fin: Date;
  offsetIzq: number;   // en unidades (días o meses) desde el inicio del rango visible
  ancho: number;       // en unidades
  usaFechaEstimada: boolean;
}

interface ColumnaEncabezado {
  etiqueta: string;
  esHoy: boolean;
  esInicioMes: boolean;
}

const DIA_MS = 24 * 60 * 60 * 1000;
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Vista Gantt con dos escalas (día / mes). Usa Fecha_Estimada_Inicio /
 * Fecha_Estimada_Entrega como planificación; si un ticket todavía no las
 * tiene cargadas (se editan desde el modal del tablero), cae a
 * Fecha_Creacion -> Fecha_Real_Final/Fecha_Resolucion como aproximación y lo
 * marca con un borde punteado para que se note que es un estimado implícito.
 * Reutiliza TicketsService.listar(), que ya viene filtrado por responsable
 * cuando el rol no es Admin (mismo dato que ve el tablero).
 */
@Component({
  selector: 'app-gantt',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES],
  templateUrl: './gantt.component.html',
  styleUrls: ['./gantt.component.scss']
})
export class GanttComponent implements OnInit {

  vista: Vista = 'dia';
  tickets: Ticket[] = [];
  cargando = true;

  columnas = COLUMNAS;
  columnaColor = COLUMNA_COLOR;

  anchoUnidadPx = 34;
  anchoMinimoBarraPx = 18;

  rangoInicio!: Date;
  rangoFin!: Date;
  encabezados: ColumnaEncabezado[] = [];
  barras: BarraTicket[] = [];

  constructor(private ticketsService: TicketsService) { }

  ngOnInit(): void {
    this.cargar();
  }

  cambiarVista(v: Vista): void {
    if (this.vista === v) return;
    this.vista = v;
    this.recalcular();
  }

  cargar(): void {
    this.cargando = true;
    this.ticketsService.listar().subscribe({
      next: (res) => {
        this.tickets = res;
        this.cargando = false;
        this.recalcular();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  private fechaInicioDe(t: Ticket): { fecha: Date; esEstimada: boolean } {
    if (t.Fecha_Estimada_Inicio) {
      return { fecha: new Date(t.Fecha_Estimada_Inicio), esEstimada: true };
    }
    return { fecha: new Date(t.Fecha_Creacion), esEstimada: false };
  }

  private fechaFinDe(t: Ticket, inicio: Date, esEstimadaInicio: boolean): { fecha: Date; esEstimada: boolean } {
    if (t.Fecha_Estimada_Entrega) {
      return { fecha: new Date(t.Fecha_Estimada_Entrega), esEstimada: true };
    }
    const aproximada = t.Fecha_Real_Final || t.Fecha_Resolucion;
    if (aproximada) {
      return { fecha: new Date(aproximada), esEstimada: false };
    }
    // Sin ninguna fecha de referencia: barra mínima de 1 día desde el inicio.
    return { fecha: new Date(inicio.getTime() + DIA_MS), esEstimada: esEstimadaInicio };
  }

  private diasEntre(a: Date, b: Date): number {
    return Math.round((this.soloFecha(b).getTime() - this.soloFecha(a).getTime()) / DIA_MS);
  }

  private soloFecha(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private offsetUnidades(d: Date): number {
    if (this.vista === 'dia') {
      return this.diasEntre(this.rangoInicio, d);
    }
    const meses = (d.getFullYear() - this.rangoInicio.getFullYear()) * 12 + (d.getMonth() - this.rangoInicio.getMonth());
    const diasEnMes = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return meses + (d.getDate() - 1) / diasEnMes;
  }

  private recalcular(): void {
    if (!this.tickets.length) {
      this.barras = [];
      this.encabezados = [];
      return;
    }

    const hoy = this.soloFecha(new Date());
    let minFecha = hoy;
    let maxFecha = hoy;

    const calculadas = this.tickets.map(t => {
      const ini = this.fechaInicioDe(t);
      const fin = this.fechaFinDe(t, ini.fecha, ini.esEstimada);
      const iniF = this.soloFecha(ini.fecha);
      let finF = this.soloFecha(fin.fecha);
      if (finF < iniF) finF = iniF;

      if (iniF < minFecha) minFecha = iniF;
      if (finF > maxFecha) maxFecha = finF;

      return { t, iniF, finF, esEstimada: ini.esEstimada && fin.esEstimada };
    });

    // Margen de contexto alrededor del rango real de datos.
    const margenDias = this.vista === 'dia' ? 3 : 20;
    this.rangoInicio = new Date(minFecha.getTime() - margenDias * DIA_MS);
    this.rangoFin = new Date(maxFecha.getTime() + margenDias * DIA_MS);
    if (this.vista === 'mes') {
      this.rangoInicio = new Date(this.rangoInicio.getFullYear(), this.rangoInicio.getMonth(), 1);
      this.rangoFin = new Date(this.rangoFin.getFullYear(), this.rangoFin.getMonth() + 1, 0);
    }

    this.barras = calculadas.map(c => {
      const offsetIzq = Math.max(0, this.offsetUnidades(c.iniF));
      const offsetDer = this.offsetUnidades(c.finF);
      return {
        ticket: c.t,
        columna: ESTADO_A_COLUMNA[c.t.Estado],
        inicio: c.iniF,
        fin: c.finF,
        offsetIzq,
        ancho: Math.max(0.4, offsetDer - offsetIzq),
        usaFechaEstimada: c.esEstimada
      };
    }).sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    this.encabezados = this.construirEncabezados();
  }

  private construirEncabezados(): ColumnaEncabezado[] {
    const hoy = this.soloFecha(new Date());
    const encabezados: ColumnaEncabezado[] = [];

    if (this.vista === 'dia') {
      const totalDias = this.diasEntre(this.rangoInicio, this.rangoFin) + 1;
      for (let i = 0; i < totalDias; i++) {
        const d = new Date(this.rangoInicio.getTime() + i * DIA_MS);
        encabezados.push({
          etiqueta: `${d.getDate()}`,
          esHoy: d.getTime() === hoy.getTime(),
          esInicioMes: d.getDate() === 1
        });
      }
    } else {
      let cursor = new Date(this.rangoInicio);
      while (cursor <= this.rangoFin) {
        encabezados.push({
          etiqueta: `${MESES_CORTOS[cursor.getMonth()]} ${cursor.getFullYear()}`,
          esHoy: cursor.getFullYear() === hoy.getFullYear() && cursor.getMonth() === hoy.getMonth(),
          esInicioMes: true
        });
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      }
    }

    return encabezados;
  }

  get esVistaMes(): boolean {
    return this.vista === 'mes';
  }

  get anchoTotalPx(): number {
    return this.encabezados.length * this.anchoUnidadPx;
  }

  barraEstiloIzq(b: BarraTicket): string {
    return `${b.offsetIzq * this.anchoUnidadPx}px`;
  }

  barraEstiloAncho(b: BarraTicket): string {
    return `${Math.max(this.anchoMinimoBarraPx, b.ancho * this.anchoUnidadPx)}px`;
  }

  formatoFecha(d: Date): string {
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
