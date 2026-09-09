using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Domain.Interfaces
{
    public interface IJwtService
    {
        string GenerarToken(Usuario usuario);
    }
}
