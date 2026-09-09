using Microsoft.Data.SqlClient;
using System.Data;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;
using ptxSeguimiento.Infrastructure.Common;

namespace ptxSeguimiento.Infrastructure.Repositories
{
    public class EquipoRepository : IEquipoRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public EquipoRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<MiembroEquipo>> Listar()
        {
            var lista = new List<MiembroEquipo>();

            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SEG_UP_LISTA_EQUIPO", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lista.Add(new MiembroEquipo
                {
                    Cod_Miembro = Convert.ToInt32(reader["Cod_Miembro"]),
                    Nom_Miembro = reader["Nom_Miembro"]?.ToString(),
                    Tickets_Activos = Convert.ToInt32(reader["Tickets_Activos"])
                });
            }

            return lista;
        }

        public async Task<RespuestaEquipoMantenimiento> Mantenimiento(string Accion, int? Cod_Miembro, string? Nom_Miembro)
        {
            var respuesta = new RespuestaEquipoMantenimiento();

            await using var conn = _connectionFactory.CreateConnection();

            await using var cmd = new SqlCommand("SEG_CF_MAN_EQUIPO", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add(new SqlParameter("@Accion", SqlDbType.Char, 3) { Value = Accion });
            cmd.Parameters.Add(new SqlParameter("@Cod_Miembro", SqlDbType.Int) { Value = (object?)Cod_Miembro ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Nom_Miembro", SqlDbType.VarChar, 150) { Value = (object?)Nom_Miembro ?? DBNull.Value });

            try
            {
                await conn.OpenAsync();
                await using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    respuesta.Codigo = Convert.ToInt32(reader["Codigo"]);
                    respuesta.Mensaje = reader["Mensaje"]?.ToString();
                    respuesta.Cod_Miembro = reader["Cod_Miembro"] == DBNull.Value ? null : Convert.ToInt32(reader["Cod_Miembro"]);
                }
            }
            catch (SqlException ex)
            {
                respuesta.Codigo = 0;
                respuesta.Mensaje = ex.Message;
            }

            return respuesta;
        }
    }
}
