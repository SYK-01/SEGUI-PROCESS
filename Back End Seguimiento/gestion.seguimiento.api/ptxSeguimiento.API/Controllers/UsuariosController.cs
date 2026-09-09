using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ptxSeguimiento.Application.DTOs.Requests;
using ptxSeguimiento.Application.Interfaces;

namespace ptxSeguimiento.API.Controllers
{
    // Mantenimiento de cuentas de acceso: solo el rol Admin puede ver y
    // administrar usuarios. adminGuard hace lo mismo en el Front End, pero la
    // restricción real (la que importa) es esta, del lado del servidor.
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuariosService _service;

        public UsuariosController(IUsuariosService service)
        {
            _service = service;
        }

        #region Listar

        [HttpGet("Listar")]
        public async Task<IActionResult> Listar()
        {
            var lista = await _service.Listar();
            return Ok(lista);
        }

        #endregion

        #region Mantenimiento

        [HttpPost("Mantenimiento")]
        public async Task<IActionResult> Mantenimiento([FromBody] UsuarioMantenimientoRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Accion))
            {
                return BadRequest("La acción es obligatoria.");
            }

            if (request.Accion.Equals("INS", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(request.Nom_Usuario))
                {
                    return BadRequest("El nombre de usuario es obligatorio.");
                }
                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest("La contraseña es obligatoria para crear un usuario.");
                }
            }

            var respuesta = await _service.Mantenimiento(
                request.Accion,
                request.Cod_Usuario,
                request.Nom_Usuario,
                request.Nom_Completo,
                request.Password,
                request.Rol,
                request.Cod_Miembro);

            return Ok(respuesta);
        }

        #endregion
    }
}
