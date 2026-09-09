import { EstadoReal } from '../../constants/estados.constants';

export interface Ticket {
  Num_Ticket: number;
  Codigo: string;
  Cod_Sistema: number;
  Nom_Sistema: string;
  Cod_Corto: string;
  Tipo: 'INCIDENCIA' | 'REQUERIMIENTO' | 'SOLICITUD' | 'REUNIÓN';
  Titulo: string;
  Descripcion?: string | null;
  Estado: EstadoReal;
  Prioridad: 'Alta' | 'Medio' | 'Baja';
  Cod_Responsable?: number | null;
  Nom_Responsable?: string | null;
  Fecha_Creacion: string;
  /** Se conserva por compatibilidad con el tiempo promedio de resolución del Dashboard. */
  Fecha_Resolucion?: string | null;
  /**
   * Fecha fin real del ticket. Es obligatoria para poder mover el ticket a la
   * columna "Cerrado": si falta, el tablero bloquea el cierre y pide
   * completarla (ver tablero.component.ts -> intentarCerrar()).
   */
  Fecha_Real_Final?: string | null;

  /** Fecha en la que realmente arrancó el trabajo (no se edita desde el tablero todavía). */
  Fecha_Real_Inicio?: string | null;

  /** Planificación usada por la vista Gantt (día/mes): inicio y entrega estimados. */
  Fecha_Estimada_Inicio?: string | null;
  Fecha_Estimada_Entrega?: string | null;
}
