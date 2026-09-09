export interface TicketMantenimientoRequest {
  Accion: 'INS' | 'UPD' | 'DEL';
  Num_Ticket?: number | null;
  Cod_Sistema: number;
  Tipo: string;
  Titulo: string;
  Descripcion?: string | null;
  Estado: string;
  Prioridad: string;
  Cod_Responsable?: number | null;
  Fecha_Creacion?: string | null;
  Fecha_Resolucion?: string | null;
  Fecha_Real_Final?: string | null;
  Fecha_Estimada_Inicio?: string | null;
  Fecha_Estimada_Entrega?: string | null;
}
