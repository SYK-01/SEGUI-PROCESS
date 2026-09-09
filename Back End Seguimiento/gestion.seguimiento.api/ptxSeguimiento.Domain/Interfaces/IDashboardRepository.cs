using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Domain.Interfaces
{
    public interface IDashboardRepository
    {
        Task<DashboardResumen> ObtenerResumen(int? Cod_Responsable);
    }
}
