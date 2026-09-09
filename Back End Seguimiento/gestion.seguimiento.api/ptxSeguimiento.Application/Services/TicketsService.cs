using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;

namespace ptxSeguimiento.Application.Services
{
    public class TicketsService : ITicketsService
    {
        private readonly ITicketsRepository _repository;

        public TicketsService(ITicketsRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Ticket>> Listar(int? Cod_Sistema, int? Cod_Responsable, string? Tipo)
        {
            return await _repository.Listar(Cod_Sistema, Cod_Responsable, Tipo);
        }

        public async Task<Ticket?> Obtener(int Num_Ticket)
        {
            return await _repository.Obtener(Num_Ticket);
        }

        public async Task<RespuestaTicketMantenimiento> Mantenimiento(
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
            DateTime? Fecha_Estimada_Entrega)
        {
            return await _repository.Mantenimiento(Accion, Num_Ticket, Cod_Sistema, Tipo, Titulo, Descripcion,
                Estado, Prioridad, Cod_Responsable, Fecha_Creacion, Fecha_Resolucion, Fecha_Real_Final, Cod_Usuario,
                Fecha_Estimada_Inicio, Fecha_Estimada_Entrega);
        }

        public async Task<RespuestaMantenimiento> MoverEstado(int Num_Ticket, string Estado, DateTime? Fecha_Real_Final, int? Cod_Usuario)
        {
            return await _repository.MoverEstado(Num_Ticket, Estado, Fecha_Real_Final, Cod_Usuario);
        }
    }
}
