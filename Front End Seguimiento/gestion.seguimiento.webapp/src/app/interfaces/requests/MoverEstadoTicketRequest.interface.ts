export interface MoverEstadoTicketRequest {
  Num_Ticket: number;
  Estado: string;
  /**
   * Obligatoria cuando Estado es uno de los 3 estados de la columna
   * "Cerrado". Si se omite y el ticket tampoco la tiene guardada, la API
   * rechaza el cambio (ver SEG_CF_MOVER_ESTADO_TICKET).
   */
  Fecha_Real_Final?: string | null;
}
