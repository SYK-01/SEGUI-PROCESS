import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../../material/material.imports';
import { SistemasService } from '../../../services/Sistemas.service';
import { TicketsService } from '../../../services/Tickets.service';
import { Sistema } from '../../../interfaces/models/Sistema.interface';
import { Ticket } from '../../../interfaces/models/Ticket.interface';
import { COLUMNA_COLOR, Columna, COLUMNAS, ESTADO_A_COLUMNA, SUBESTADO_CORTO } from '../../../constants/estados.constants';

/**
 * Vista de impresión: una lista por columna (no el grid de 4 columnas del
 * tablero, que no pagina bien en papel). "Imprimir" llama a window.print();
 * el resto de la interfaz (menú, barra superior) se oculta vía @media print
 * en menu.component.css para que solo salga esta hoja.
 */
@Component({
  selector: 'app-imprimir',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES],
  templateUrl: './imprimir.component.html',
  styleUrls: ['./imprimir.component.scss']
})
export class ImprimirComponent implements OnInit {

  columnas = COLUMNAS;
  columnaColor = COLUMNA_COLOR;

  sistemas: Sistema[] = [];
  tickets: Ticket[] = [];
  cargando = true;
    
   

  fechaGeneracion = new Date();

  expandedCols = new Set<string>();

  toggleCol(col: string): void {
  if (this.expandedCols.has(col)) {
    this.expandedCols.delete(col);
  } else {
    this.expandedCols.add(col);
  }
}

  constructor(
    private sistemasService: SistemasService,
    private ticketsService: TicketsService
  ) { }

  ngOnInit(): void {
    this.sistemasService.listar().subscribe({ next: (res) => this.sistemas = res });
    this.ticketsService.listar().subscribe({
      next: (res) => {
        this.tickets = res;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  columnaDe(t: Ticket): Columna {
    return ESTADO_A_COLUMNA[t.Estado];
  }

  subEstadoCorto(t: Ticket): string {
    return SUBESTADO_CORTO[t.Estado] || '';
  }

  ticketsDe(col: Columna): Ticket[] {
    return this.tickets.filter(t => this.columnaDe(t) === col);
  }

  nombreSistema(codSistema: number): string {
    return this.sistemas.find(s => s.Cod_Sistema === codSistema)?.Nom_Sistema || '—';
  }

  imprimir(): void {
    window.print();
  }
}
