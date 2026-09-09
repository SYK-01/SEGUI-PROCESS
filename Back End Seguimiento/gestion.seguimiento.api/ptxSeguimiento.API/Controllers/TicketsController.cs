using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ptxSeguimiento.Application.DTOs.Requests;
using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketsService _service;

        public TicketsController(ITicketsService service)
        {
            _service = service;
        }

        private int? CodUsuarioActual =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

        // Los accesos son por usuario: un usuario con rol "Usuario" solo ve y
        // administra los tickets cuyo Cod_Responsable es su propio Cod_Miembro
        // (el miembro de equipo vinculado a su cuenta). Solo el rol "Admin" ve
        // y administra los tickets de todos.
        private string? RolActual => User.FindFirstValue(ClaimTypes.Role);
        private bool EsAdmin => string.Equals(RolActual, "Admin", StringComparison.OrdinalIgnoreCase);
        private int? CodMiembroActual =>
            int.TryParse(User.FindFirstValue("cod_miembro"), out var id) ? id : (int?)null;

        #region Listar

        [HttpGet("Listar")]
        public async Task<IActionResult> Listar([FromQuery] ListaTicketsRequest query)
        {
            if (!EsAdmin && CodMiembroActual == null)
            {
                // Cuenta sin miembro de equipo vinculado: no tiene tickets propios.
                return Ok(Array.Empty<Ticket>());
            }

            var codResponsableFiltro = EsAdmin ? query.Cod_Responsable : CodMiembroActual;
            var lista = await _service.Listar(query.Cod_Sistema, codResponsableFiltro, query.Tipo);
            return Ok(lista);
        }

        #endregion

        #region Obtener

        [HttpGet("Obtener/{Num_Ticket}")]
        public async Task<IActionResult> Obtener(int Num_Ticket)
        {
            var ticket = await _service.Obtener(Num_Ticket);

            if (ticket == null)
            {
                return NotFound($"No se encontró el ticket {Num_Ticket}.");
            }

            if (!EsAdmin && ticket.Cod_Responsable != CodMiembroActual)
            {
                return Forbid();
            }

            return Ok(ticket);
        }

        #endregion

        #region Mantenimiento

        [HttpPost("Mantenimiento")]
        public async Task<IActionResult> Mantenimiento([FromBody] TicketMantenimientoRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Accion))
            {
                return BadRequest("La acción es obligatoria.");
            }

            if (!request.Accion.Equals("DEL", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(request.Titulo))
            {
                return BadRequest("El título es obligatorio.");
            }

            var codResponsable = request.Cod_Responsable;

            if (!EsAdmin)
            {
                if (CodMiembroActual == null)
                {
                    return Forbid();
                }

                if (request.Accion.Equals("INS", StringComparison.OrdinalIgnoreCase))
                {
                    // Un usuario no-Admin siempre crea el ticket a su propio nombre,
                    // sin importar qué responsable haya enviado el cliente.
                    codResponsable = CodMiembroActual;
                }
                else if (request.Num_Ticket.HasValue)
                {
                    // Editar o eliminar requiere ser el dueño del ticket.
                    var existente = await _service.Obtener(request.Num_Ticket.Value);
                    if (existente == null)
                    {
                        return NotFound($"No se encontró el ticket {request.Num_Ticket}.");
                    }
                    if (existente.Cod_Responsable != CodMiembroActual)
                    {
                        return Forbid();
                    }
                }
            }

            var respuesta = await _service.Mantenimiento(
                request.Accion,
                request.Num_Ticket,
                request.Cod_Sistema,
                request.Tipo,
                request.Titulo,
                request.Descripcion,
                request.Estado,
                request.Prioridad,
                codResponsable,
                request.Fecha_Creacion,
                request.Fecha_Resolucion,
                request.Fecha_Real_Final,
                CodUsuarioActual,
                request.Fecha_Estimada_Inicio,
                request.Fecha_Estimada_Entrega);

            return Ok(respuesta);
        }

        #endregion

        #region MoverEstado

        [HttpPost("MoverEstado")]
        public async Task<IActionResult> MoverEstado([FromBody] MoverEstadoTicketRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Estado))
            {
                return BadRequest("El estado es obligatorio.");
            }

            if (!EsAdmin)
            {
                if (CodMiembroActual == null)
                {
                    return Forbid();
                }

                var existente = await _service.Obtener(request.Num_Ticket);
                if (existente == null)
                {
                    return NotFound($"No se encontró el ticket {request.Num_Ticket}.");
                }
                if (existente.Cod_Responsable != CodMiembroActual)
                {
                    return Forbid();
                }
            }

            var respuesta = await _service.MoverEstado(request.Num_Ticket, request.Estado, request.Fecha_Real_Final, CodUsuarioActual);
            return Ok(respuesta);
        }

        #endregion
    }
}
