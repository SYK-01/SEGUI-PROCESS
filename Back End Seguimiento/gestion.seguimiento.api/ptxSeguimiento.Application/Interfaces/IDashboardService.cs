using ptxSeguimiento.Domain.Entities;

namespace ptxSeguimiento.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResumen> ObtenerResumen(int? Cod_Responsable);
    }
}
