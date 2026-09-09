namespace ptxSeguimiento.Application.DTOs.Requests
{
    public class MoverEstadoTicketRequest
    {
        public int Num_Ticket { get; set; }
        public string Estado { get; set; } = string.Empty;

        /// <summary>
        /// Obligatoria cuando Estado es uno de los 3 estados de la columna "Cerrado"
        /// (Con Validación Funcional / Con Aprobación del Usuario / Entregado). Si se
        /// omite y el ticket tampoco la tenía guardada ya, SEG_CF_MOVER_ESTADO_TICKET
        /// rechaza el cambio en vez de cerrar el ticket sin fecha fin.
        /// </summary>
        public DateTime? Fecha_Real_Final { get; set; }
    }
}
