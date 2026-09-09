using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;

namespace ptxSeguimiento.Application.Services
{
    public class UsuariosService : IUsuariosService
    {
        private readonly IUsuariosRepository _repository;

        public UsuariosService(IUsuariosRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Usuario>> Listar()
        {
            return await _repository.Listar();
        }

        public async Task<RespuestaUsuarioMantenimiento> Mantenimiento(
            string Accion,
            int? Cod_Usuario,
            string? Nom_Usuario,
            string? Nom_Completo,
            string? Password,
            string? Rol,
            int? Cod_Miembro)
        {
            // El hash se calcula en esta capa (nunca en el controlador ni en el
            // repositorio). SEG_CF_MAN_USUARIO ya conserva el hash existente cuando
            // @Pwd_Hash llega NULL, así que en "UPD" sin cambio de contraseña
            // simplemente no se envía ninguno.
            string? pwdHash = string.IsNullOrWhiteSpace(Password)
                ? null
                : BCrypt.Net.BCrypt.HashPassword(Password);

            return await _repository.Mantenimiento(Accion, Cod_Usuario, Nom_Usuario, Nom_Completo, pwdHash, Rol, Cod_Miembro);
        }
    }
}
