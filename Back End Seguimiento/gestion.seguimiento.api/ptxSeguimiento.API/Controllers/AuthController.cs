using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ptxSeguimiento.Application.DTOs.Requests;
using ptxSeguimiento.Application.Interfaces;

namespace ptxSeguimiento.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;

        public AuthController(IAuthService service)
        {
            _service = service;
        }

        #region Login

        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Nom_Usuario) || string.IsNullOrWhiteSpace(request.Pwd_Usuario))
            {
                return BadRequest("Usuario y contraseña son obligatorios.");
            }

            var respuesta = await _service.Login(request.Nom_Usuario, request.Pwd_Usuario);

            if (respuesta.Codigo == 0)
            {
                return Unauthorized(respuesta);
            }

            return Ok(respuesta);
        }

        #endregion
    }
}
