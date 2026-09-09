using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;

namespace ptxSeguimiento.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _repository;

        public DashboardService(IDashboardRepository repository)
        {
            _repository = repository;
        }

        public async Task<DashboardResumen> ObtenerResumen(int? Cod_Responsable)
        {
            return await _repository.ObtenerResumen(Cod_Responsable);
        }
    }
}
