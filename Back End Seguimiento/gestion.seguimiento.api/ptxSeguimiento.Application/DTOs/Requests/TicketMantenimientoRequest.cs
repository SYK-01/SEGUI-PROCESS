namespace ptxSeguimiento.Application.DTOs.Requests
{
    public class TicketMantenimientoRequest
    {
        public string Accion { get; set; } = string.Empty;      // INS | UPD | DEL
        public int? Num_Ticket { get; set; }
        public int Cod_Sistema { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Estado { get; set; } = "Pendiente (No Programado)";
        public string Prioridad { get; set; } = "Medio";
        public int? Cod_Responsable { get; set; }
        public DateTime? Fecha_Creacion { get; set; }
        public DateTime? Fecha_Resolucion { get; set; }

        /// <summary>
        /// Fecha fin real del ticket. Obligatoria cuando Estado queda en uno de los 3
        /// estados de la columna "Cerrado" (ver SEG_CF_MAN_TICKET).
        /// </summary>
        public DateTime? Fecha_Real_Final { get; set; }

        /// <summary>Planificación usada por la vista Gantt (día/mes).</summary>
        public DateTime? Fecha_Estimada_Inicio { get; set; }
        public DateTime? Fecha_Estimada_Entrega { get; set; }
    }
}
