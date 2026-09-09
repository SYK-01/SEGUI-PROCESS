using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Domain.Interfaces
{
    public interface ITicketsRepository
    {
        Task<IEnumerable<Ticket>> Listar(int? Cod_Sistema, int? Cod_Responsable, string? Tipo);

        Task<Ticket?> Obtener(int Num_Ticket);

        Task<RespuestaTicketMantenimiento> Mantenimiento(
            string Accion,
            int? Num_Ticket,
            int Cod_Sistema,
            string Tipo,
            string Titulo,
            string? Descripcion,
            string Estado,
            string Prioridad,
            int? Cod_Responsable,
            DateTime? Fecha_Creacion,
            DateTime? Fecha_Resolucion,
            DateTime? Fecha_Real_Final,
            int? Cod_Usuario,
            DateTime? Fecha_Estimada_Inicio,
            DateTime? Fecha_Estimada_Entrega);

        Task<RespuestaMantenimiento> MoverEstado(int Num_Ticket, string Estado, DateTime? Fecha_Real_Final, int? Cod_Usuario);
    }
}
