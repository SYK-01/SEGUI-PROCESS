using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService service)
        {
            _service = service;
        }

        private string? RolActual => User.FindFirstValue(ClaimTypes.Role);
        private bool EsAdmin => string.Equals(RolActual, "Admin", StringComparison.OrdinalIgnoreCase);
        private int? CodMiembroActual =>
            int.TryParse(User.FindFirstValue("cod_miembro"), out var id) ? id : (int?)null;

        #region ObtenerResumen

        [HttpGet("ObtenerResumen")]
        public async Task<IActionResult> ObtenerResumen()
        {
            // Un usuario no-Admin sin miembro de equipo asociado no tiene tickets
            // propios que mostrar: se devuelve un resumen vacío en vez de pasar
            // null (que para el procedimiento almacenado significa "ver todo").
            if (!EsAdmin && CodMiembroActual == null)
            {
                return Ok(new DashboardResumen());
            }

            var resumen = await _service.ObtenerResumen(EsAdmin ? null : CodMiembroActual);
            return Ok(resumen);
        }

        #endregion
    }
}
