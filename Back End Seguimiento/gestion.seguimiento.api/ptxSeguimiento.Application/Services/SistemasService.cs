using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;

namespace ptxSeguimiento.Application.Services
{
    public class SistemasService : ISistemasService
    {
        private readonly ISistemasRepository _repository;

        public SistemasService(ISistemasRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Sistema>> Listar()
        {
            return await _repository.Listar();
        }
    }
}
