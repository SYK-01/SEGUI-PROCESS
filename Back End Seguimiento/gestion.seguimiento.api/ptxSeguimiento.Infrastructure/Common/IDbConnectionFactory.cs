using Microsoft.Data.SqlClient;

namespace ptxSeguimiento.Infrastructure.Common
{
    public interface IDbConnectionFactory
    {
        SqlConnection CreateConnection();
    }
}
