export interface RespuestaMantenimiento {
  Codigo: number;
  Mensaje: string;
}

export interface RespuestaTicketMantenimiento extends RespuestaMantenimiento {
  Num_Ticket?: number | null;
  Codigo_Ticket?: string | null;
}

export interface RespuestaEquipoMantenimiento extends RespuestaMantenimiento {
  Cod_Miembro?: number | null;
}

export interface RespuestaUsuarioMantenimiento extends RespuestaMantenimiento {
  Cod_Usuario?: number | null;
}
