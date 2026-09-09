using AutoMapper;
using ptxSeguimiento.Application.DTOs.Responses;
using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Interfaces;

namespace ptxSeguimiento.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUsuariosRepository _usuariosRepository;
        private readonly IJwtService _jwtService;
        private readonly IMapper _mapper;

        public AuthService(IUsuariosRepository usuariosRepository, IJwtService jwtService, IMapper mapper)
        {
            _usuariosRepository = usuariosRepository;
            _jwtService = jwtService;
            _mapper = mapper;
        }

        public async Task<LoginResponse> Login(string Nom_Usuario, string Pwd_Usuario)
        {
            var usuario = await _usuariosRepository.ObtenerPorNombreUsuario(Nom_Usuario);

            //if (usuario is null || string.IsNullOrEmpty(usuario.Pwd_Hash) ||
            //    !BCrypt.Net.BCrypt.Verify(Pwd_Usuario, usuario.Pwd_Hash))
            //{
            //    return new LoginResponse { Codigo = 0, Mensaje = "Usuario o contraseña incorrectos." };
            //}

            if (string.IsNullOrEmpty(usuario.Pwd_Hash) || usuario.Pwd_Hash.ToUpperInvariant() != Pwd_Usuario.ToUpperInvariant())
            {
                return new LoginResponse { Codigo = 0, Mensaje = "La contraseña ingresada es incorrecta." };
            }

            var respuesta = _mapper.Map<LoginResponse>(usuario);
            respuesta.Codigo = 1;
            respuesta.Mensaje = "Inicio de sesión correcto.";
            respuesta.Token = _jwtService.GenerarToken(usuario);

            return respuesta;
        }
    }
}
