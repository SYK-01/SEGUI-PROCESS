import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import { MATERIAL_MODULES } from '../../../material/material.imports';
import { DashboardService } from '../../../services/Dashboard.service';
import { TicketsService } from '../../../services/Tickets.service';
import { DashboardResumen } from '../../../interfaces/responses/DashboardResumen.interface';
import { Ticket } from '../../../interfaces/models/Ticket.interface';
import {
  COLUMNA_COLOR_HEX,
  Columna,
  COLUMNAS,
  ESTADO_A_COLUMNA,
  EstadoReal,
  SUBESTADO_CORTO
} from '../../../constants/estados.constants';

/**
 * Fila de la tabla cruzada sistema × columna: cuántos tickets tiene cada
 * sistema en cada una de las 4 columnas del tablero. El backend no devuelve
 * este cruce (DashboardResumen solo trae PorSistema y PorEstado por
 * separado), así que se arma acá mismo a partir del listado completo de
 * tickets (Fase 17).
 */
interface FilaSistemaEstado {
  sistema: string;
  corto: string;
  porColumna: Record<Columna, number>;
  total: number;
}

/**
 * Plugin de Chart.js (sin dependencias nuevas, se registra solo en este
 * gráfico) que dibuja el porcentaje encima de cada segmento de la barra
 * apilada al 100%, pero solo cuando el segmento es lo bastante ancho como
 * para que el número no se vea apretado (>= 10%).
 */
const porcentajeEnBarraPlugin: any = {
  id: 'porcentajeEnBarra',
  afterDatasetsDraw(chart: Chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset: any, dsIndex: number) => {
      const meta = chart.getDatasetMeta(dsIndex);
      meta.data.forEach((elemento: any, index: number) => {
        const valor = dataset.data[index] as number;
        if (valor >= 10) {
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${Math.round(valor)}%`, elemento.x, elemento.y);
          ctx.restore();
        }
      });
    });
  }
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chartSistema') chartSistemaRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEstado') chartEstadoRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartResponsable') chartResponsableRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSistemaEstado') chartSistemaEstadoRef?: ElementRef<HTMLCanvasElement>;

  resumen: DashboardResumen | null = null;

  /** Tabla cruzada sistema × columna, calculada en construirCrossTab(). */
  crossTab: FilaSistemaEstado[] = [];
  responsablesSorted: any[] = [];
  maxTickets = 0;
  distribucion: { col: string; cantidad: number; pct: number; color: string; dashArray: string; dashOffset: number }[] = [];
  totalTicketsDist = 0;
  private charts: Chart[] = [];
  activeIndex: number | null = null;

  constructor(
    private dashboardService: DashboardService,
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  cargar(): void {
    // El resumen (métricas y agregados) y el listado completo de tickets se
    // piden en paralelo: el resumen alimenta los 3 gráficos originales, y el
    // listado completo es lo único que permite armar el cruce sistema ×
    // columna (el backend no lo devuelve armado).
    forkJoin({
      resumen: this.dashboardService.obtenerResumen(),
      tickets: this.ticketsService.listar()
    }).subscribe({
      next: ({ resumen, tickets }) => {
        this.resumen = resumen;
        this.construirCrossTab(tickets);
        // El canvas (#chartSistema, etc.) solo existe en el DOM dentro del
        // @if (resumen) del template. Forzamos la detección de cambios aquí
        // para que Angular pinte ese bloque y los @ViewChild queden
        // resueltos ANTES de intentar crear los gráficos de Chart.js —
        // un setTimeout(0) no lo garantiza y dejaba el dashboard en blanco.
        this.cdr.detectChanges();
        this.renderCharts();
        this.responsablesSorted = [...this.resumen.PorResponsable]
        .sort((a, b) => b.Tickets_Activos - a.Tickets_Activos);
      this.maxTickets = this.responsablesSorted.length
        ? this.responsablesSorted[0].Tickets_Activos
        : 1;
        const coloresDistribucion: Record<string, string> = {
          'Pendiente': '#f97066',
          'Programado': '#818cf8',
          'En Proceso': '#fb923c',
          'Cerrado': '#34d399'
        };

        const porColumna = COLUMNAS.map(col => {
          const cantidad = this.resumen!.PorEstado
            .filter(d => ESTADO_A_COLUMNA[d.Estado as EstadoReal] === col)
            .reduce((acc, d) => acc + d.Cantidad, 0);
          return { col, cantidad };
        }).filter(d => d.cantidad > 0);

        const totalDist = porColumna.reduce((acc, d) => acc + d.cantidad, 0);
        this.totalTicketsDist = totalDist;

        const circumference = 2 * Math.PI * 80;
        const gap = 8;
        const totalGaps = gap * porColumna.length;
        const usable = circumference - totalGaps;
        let offset = 0;

        this.distribucion = porColumna.map(d => {
          const pct = Math.round((d.cantidad / totalDist) * 1000) / 10;
          const segmentLength = (d.cantidad / totalDist) * usable;
          const dashArray = `${segmentLength} ${circumference - segmentLength}`;
          const dashOffset = -offset;
          offset += segmentLength + gap;

          return {
            col: d.col,
            cantidad: d.cantidad,
            pct,
            color: coloresDistribucion[d.col] || '#888',
            dashArray,
            dashOffset
          };
        });
      }
    });
  }

  private construirCrossTab(tickets: Ticket[]): void {
    if (!this.resumen) {
      this.crossTab = [];
      return;
    }
    this.crossTab = this.resumen.PorSistema.map(p => {
      const porColumna: Record<Columna, number> = {
        'Pendiente': 0, 'Programado': 0, 'En Proceso': 0, 'Cerrado': 0
      };
      tickets
        .filter(t => t.Cod_Sistema === p.Cod_Sistema)
        .forEach(t => {
          const col = ESTADO_A_COLUMNA[t.Estado as EstadoReal];
          if (col) porColumna[col]++;
        });
      const total = COLUMNAS.reduce((acc, col) => acc + porColumna[col], 0);
      return { sistema: p.Nom_Sistema, corto: p.Cod_Corto, porColumna, total };
    });
  }

  private renderCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    if (!this.resumen) return;

        if (this.chartSistemaRef) {
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: this.resumen.PorSistema.map(p => p.Cod_Corto),
          datasets: [
            { label: 'Requerimiento', data: this.resumen.PorSistema.map(p => p.Cant_Requerimiento), backgroundColor: '#6366f1', borderRadius: 6, barPercentage: 0.5, categoryPercentage: 0.6, stack: 'a' },
            { label: 'Incidencia', data: this.resumen.PorSistema.map(p => p.Cant_Incidente), backgroundColor: '#f87171', borderRadius: 6, barPercentage: 0.5, categoryPercentage: 0.6, stack: 'a' },
            { label: 'Solicitud', data: this.resumen.PorSistema.map(p => p.Cant_Solicitud), backgroundColor: '#34d399', borderRadius: 6, barPercentage: 0.5, categoryPercentage: 0.6, stack: 'a' },
            { label: 'Reunión', data: this.resumen.PorSistema.map(p => p.Cant_Reunion), backgroundColor: '#a78bfa', borderRadius: 6, barPercentage: 0.5, categoryPercentage: 0.6, stack: 'a' }
          ] 
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          
          scales: {
            x: {
              ticks: { color: '#aaa', font: { size: 11 } },
              grid: { display: false },
              border: { display: false }
            },
            y: {
              ticks: { color: '#aaa', font: { size: 11 }, precision: 0 },
              grid: { color: '#f5f5f5' },
              border: { display: false }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                color: '#888',
                font: { size: 11 },
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 16
              }
            }
          }
        }
      };
      this.charts.push(new Chart(this.chartSistemaRef.nativeElement, config));
    }

    if (this.chartEstadoRef) {
      // El backend sigue devolviendo el detalle de los 6 estados reales
      // (PorEstado); aquí se agrupan en las mismas 4 columnas del tablero
      // para que el gráfico se lea de un vistazo. El detalle fino de
      // "Cerrado" (validación funcional / aprobación usuario / entregado)
      // no se pierde: queda disponible en el tooltip de esa porción.
      const subDetalle: Record<Columna, { Estado: string; Cantidad: number }[]> = {
        'Pendiente': [], 'Programado': [], 'En Proceso': [], 'Cerrado': []
      };
      this.resumen.PorEstado.forEach(d => {
        const col = ESTADO_A_COLUMNA[d.Estado as EstadoReal];
        if (col) subDetalle[col].push(d);
      });
      const porColumna = COLUMNAS
        .map(col => ({ col, cantidad: subDetalle[col].reduce((acc, d) => acc + d.Cantidad, 0) }))
        .filter(d => d.cantidad > 0);

      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: porColumna.map(d => d.col),
          datasets: [{
            data: porColumna.map(d => d.cantidad),
            backgroundColor: ['#f97066', '#818cf8', '#fb923c', '#34d399'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
            position: 'bottom',
            labels: {
              color: '#888',
              font: { size: 11 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16
            }
          },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const col = porColumna[ctx.dataIndex].col;
                  const total = ctx.parsed as number;
                  if (col !== 'Cerrado') return `${col}: ${total}`;
                  const detalle = subDetalle['Cerrado']
                    .map(d => `${SUBESTADO_CORTO[d.Estado] || d.Estado}: ${d.Cantidad}`)
                    .join(' · ');
                  return [`Cerrado: ${total}`, detalle];
                }
              }
            }
          }
        }
      };
      this.charts.push(new Chart(this.chartEstadoRef.nativeElement, config));
    }

    if (this.chartResponsableRef) {
      const porResponsable = [...this.resumen.PorResponsable].sort((a, b) => b.Tickets_Activos - a.Tickets_Activos);
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: porResponsable.map(p => p.Nom_Miembro),
          datasets: [{ label: 'Tickets activos', data: porResponsable.map(p => p.Tickets_Activos), backgroundColor: '#4F63D2' }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: '#565D6C', precision: 0 }, grid: { color: '#E2E4EA' } },
            y: { ticks: { color: '#565D6C' }, grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      };
      this.charts.push(new Chart(this.chartResponsableRef.nativeElement, config));
    }

  if (this.chartSistemaEstadoRef && this.crossTab.length) {
  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: this.crossTab.map(f => f.corto),
      datasets: COLUMNAS.map(col => ({
      label: col,
      data: this.crossTab.map(f => f.total ? Math.round((f.porColumna[col] / f.total) * 1000) / 10 : 0),
      backgroundColor: COLUMNA_COLOR_HEX[col],
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
      stack: 'a'
    } as any))
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          min: 0,
          max: 100,
          ticks: { color: '#aaa', font: { size: 11 }, callback: (v) => `${v}%` },
          grid: { color: '#f5f5f5' },
          border: { display: false }
        },
        y: {
          stacked: true,
          ticks: { color: '#aaa', font: { size: 11 } },
          grid: { display: false },
          border: { display: false }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#888',
            font: { size: 11 },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const fila = this.crossTab[ctx.dataIndex];
              const col = ctx.dataset.label as Columna;
              return `${col}: ${fila.porColumna[col]} tickets (${ctx.parsed.x}%)`;
            }
          }
        }
      }
    },
    plugins: [porcentajeEnBarraPlugin]
  };
  this.charts.push(new Chart(this.chartSistemaEstadoRef.nativeElement, config));
} 
}

  /**
   * Exporta el Dashboard a un Excel real (.xlsx, no CSV) con una hoja por
   * bloque de datos, cada una con su fila de encabezado. No navega a otra
   * pantalla: genera el archivo y lo descarga directo desde el Dashboard.
   */
  exportarExcel(): void {
    if (!this.resumen) return;

    const libro = XLSX.utils.book_new();

    const hojaResumen = XLSX.utils.json_to_sheet([
      { Métrica: 'Total tickets', Valor: this.resumen.Metricas.Total_Tickets },
      { Métrica: 'Incidentes abiertos', Valor: this.resumen.Metricas.Incidentes_Abiertos },
      { Métrica: 'Cerrados', Valor: this.resumen.Metricas.Resueltos_Cerrados },
      { Métrica: 'Tiempo promedio de cierre (días)', Valor: this.resumen.Metricas.Tiempo_Promedio_Resolucion }
    ]);
    XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen');

    const hojaSistema = XLSX.utils.json_to_sheet(this.resumen.PorSistema.map(p => ({
      Sistema: p.Nom_Sistema,
      Requerimiento: p.Cant_Requerimiento,
      Incidencia: p.Cant_Incidente,
      Solicitud: p.Cant_Solicitud,
      Reunión: p.Cant_Reunion
    })));
    XLSX.utils.book_append_sheet(libro, hojaSistema, 'Por sistema y tipo');

    const hojaEstado = XLSX.utils.json_to_sheet(this.resumen.PorEstado.map(d => ({
      Estado: d.Estado,
      Cantidad: d.Cantidad
    })));
    XLSX.utils.book_append_sheet(libro, hojaEstado, 'Distribución por columna');

    const hojaSistemaEstado = XLSX.utils.json_to_sheet(this.crossTab.map(f => ({
      Sistema: f.sistema,
      Pendiente: f.porColumna['Pendiente'],
      Programado: f.porColumna['Programado'],
      'En Proceso': f.porColumna['En Proceso'],
      Cerrado: f.porColumna['Cerrado'],
      Total: f.total
    })));
    XLSX.utils.book_append_sheet(libro, hojaSistemaEstado, 'Por sistema y estado');

    const hojaResponsable = XLSX.utils.json_to_sheet(
      [...this.resumen.PorResponsable]
        .sort((a, b) => b.Tickets_Activos - a.Tickets_Activos)
        .map(p => ({ Responsable: p.Nom_Miembro, 'Tickets activos': p.Tickets_Activos }))
    );
    XLSX.utils.book_append_sheet(libro, hojaResponsable, 'Carga por responsable');

    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Dashboard_Seguimiento_${fecha}.xlsx`);
  }
}
