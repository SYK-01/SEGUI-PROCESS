using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Domain.Interfaces
{
    public interface ISistemasRepository
    {
        Task<IEnumerable<Sistema>> Listar();
    }
}
