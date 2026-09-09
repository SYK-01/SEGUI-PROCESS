using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ptxSeguimiento.Application.Interfaces;

namespace ptxSeguimiento.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SistemasController : ControllerBase
    {
        private readonly ISistemasService _service;

        public SistemasController(ISistemasService service)
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
    }
}
