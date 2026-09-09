using AutoMapper;
using ptxSeguimiento.Application.DTOs.Responses;
using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Application.Mappings
{
    public class SeguimientoProfile : Profile
    {
        public SeguimientoProfile()
        {
            // El hash de contraseña nunca se mapea hacia la respuesta expuesta por la API.
            CreateMap<Usuario, LoginResponse>();
        }
    }
}
