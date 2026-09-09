using Microsoft.Data.SqlClient;
using System.Data;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;
using ptxSeguimiento.Infrastructure.Common;

namespace ptxSeguimiento.Infrastructure.Repositories
{
    public class SistemasRepository : ISistemasRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public SistemasRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Sistema>> Listar()
        {
            var lista = new List<Sistema>();

            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SEG_UP_LISTA_SISTEMAS", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lista.Add(new Sistema
                {
                    Cod_Sistema = Convert.ToInt32(reader["Cod_Sistema"]),
                    Nom_Sistema = reader["Nom_Sistema"]?.ToString(),
                    Cod_Corto = reader["Cod_Corto"]?.ToString()
                });
            }

            return lista;
        }
    }
}
