using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using ptxSeguimiento.Infrastructure.Configurations;

namespace ptxSeguimiento.Infrastructure.Common
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public DbConnectionFactory(IOptions<ConnectionStrings> options)
        {
            _connectionString = options.Value.CadenaSQL ?? throw new ArgumentNullException(nameof(options), "La cadena de conexión no puede ser nula.");
        }

        public SqlConnection CreateConnection() => new(_connectionString);
    }
}
