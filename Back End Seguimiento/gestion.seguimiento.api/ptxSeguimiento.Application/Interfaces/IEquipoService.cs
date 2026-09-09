using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Application.Interfaces
{
    public interface IEquipoService
    {
        Task<IEnumerable<MiembroEquipo>> Listar();
        Task<RespuestaEquipoMantenimiento> Mantenimiento(string Accion, int? Cod_Miembro, string? Nom_Miembro);
    }
}
