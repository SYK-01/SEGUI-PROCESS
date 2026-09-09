using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Domain.Interfaces
{
    public interface IEquipoRepository
    {
        Task<IEnumerable<MiembroEquipo>> Listar();
        Task<RespuestaEquipoMantenimiento> Mantenimiento(string Accion, int? Cod_Miembro, string? Nom_Miembro);
    }
}
