using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ptxSeguimiento.Application.DTOs.Requests;
using ptxSeguimiento.Application.Interfaces;

namespace ptxSeguimiento.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EquipoController : ControllerBase
    {
        private readonly IEquipoService _service;

        public EquipoController(IEquipoService service)
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
        public async Task<IActionResult> Mantenimiento([FromBody] MiembroEquipoRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Accion))
            {
                return BadRequest("La acción es obligatoria.");
            }

            if (request.Accion.Equals("INS", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(request.Nom_Miembro))
            {
                return BadRequest("El nombre del integrante es obligatorio.");
            }

            var respuesta = await _service.Mantenimiento(request.Accion, request.Cod_Miembro, request.Nom_Miembro);
            return Ok(respuesta);
        }

        #endregion
    }
}
