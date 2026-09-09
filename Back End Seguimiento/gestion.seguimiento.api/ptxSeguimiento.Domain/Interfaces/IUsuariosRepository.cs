using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Domain.Interfaces
{
    public interface IUsuariosRepository
    {
        Task<Usuario?> ObtenerPorNombreUsuario(string Nom_Usuario);

        Task<IEnumerable<Usuario>> Listar();

        Task<RespuestaUsuarioMantenimiento> Mantenimiento(
            string Accion,
            int? Cod_Usuario,
            string? Nom_Usuario,
            string? Nom_Completo,
            string? Pwd_Hash,
            string? Rol,
            int? Cod_Miembro);
    }
}
