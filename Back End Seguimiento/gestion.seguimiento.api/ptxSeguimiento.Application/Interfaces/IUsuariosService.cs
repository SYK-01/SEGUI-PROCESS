using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Application.Interfaces
{
    public interface IUsuariosService
    {
        Task<IEnumerable<Usuario>> Listar();

        Task<RespuestaUsuarioMantenimiento> Mantenimiento(
            string Accion,
            int? Cod_Usuario,
            string? Nom_Usuario,
            string? Nom_Completo,
            string? Password,
            string? Rol,
            int? Cod_Miembro);
    }
}
