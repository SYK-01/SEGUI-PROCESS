using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;

namespace ptxSeguimiento.Application.Services
{
    public class EquipoService : IEquipoService
    {
        private readonly IEquipoRepository _repository;

        public EquipoService(IEquipoRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MiembroEquipo>> Listar()
        {
            return await _repository.Listar();
        }

        public async Task<RespuestaEquipoMantenimiento> Mantenimiento(string Accion, int? Cod_Miembro, string? Nom_Miembro)
        {
            return await _repository.Mantenimiento(Accion, Cod_Miembro, Nom_Miembro);
        }
    }
}
