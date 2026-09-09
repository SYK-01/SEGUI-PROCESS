using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Application.Interfaces
{
    public interface ISistemasService
    {
        Task<IEnumerable<Sistema>> Listar();
    }
}
