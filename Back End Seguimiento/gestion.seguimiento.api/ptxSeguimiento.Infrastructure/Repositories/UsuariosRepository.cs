using Microsoft.Data.SqlClient;
using System.Data;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;
using ptxSeguimiento.Infrastructure.Common;

namespace ptxSeguimiento.Infrastructure.Repositories
{
    public class UsuariosRepository : IUsuariosRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public UsuariosRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Usuario?> ObtenerPorNombreUsuario(string Nom_Usuario)
        {
            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SEG_UP_LOGIN_USUARIO", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add(new SqlParameter("@Nom_Usuario", SqlDbType.VarChar) { Value = Nom_Usuario });

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            var accion = Convert.ToInt32(reader["Accion"]);
            if (accion == 0)
                return null;

            return new Usuario
            {
                Cod_Usuario = Convert.ToInt32(reader["Cod_Usuario"]),
                Nom_Usuario = reader["Nom_Usuario"]?.ToString(),
                Nom_Completo = reader["Nom_Completo"]?.ToString(),
                Pwd_Hash = reader["Pwd_Hash"]?.ToString(),
                Rol = reader["Rol"]?.ToString(),
                Cod_Miembro = reader["Cod_Miembro"] == DBNull.Value ? null : Convert.ToInt32(reader["Cod_Miembro"]),
                Activo = Convert.ToBoolean(reader["Activo"])
            };
        }

        #region Listar

        public async Task<IEnumerable<Usuario>> Listar()
        {
            var lista = new List<Usuario>();

            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SEG_UP_LISTA_USUARIOS", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lista.Add(new Usuario
                {
                    Cod_Usuario = Convert.ToInt32(reader["Cod_Usuario"]),
                    Nom_Usuario = reader["Nom_Usuario"]?.ToString(),
                    Nom_Completo = reader["Nom_Completo"]?.ToString(),
                    Rol = reader["Rol"]?.ToString(),
                    Cod_Miembro = reader["Cod_Miembro"] == DBNull.Value ? null : Convert.ToInt32(reader["Cod_Miembro"]),
                    Nom_Miembro = reader["Nom_Miembro"] == DBNull.Value ? null : reader["Nom_Miembro"].ToString(),
                    Activo = Convert.ToBoolean(reader["Activo"])
                });
            }

            return lista;
        }

        #endregion

        #region Mantenimiento

        public async Task<RespuestaUsuarioMantenimiento> Mantenimiento(string Accion, int? Cod_Usuario, string? Nom_Usuario, string? Nom_Completo, string? Pwd_Hash, string? Rol, int? Cod_Miembro)
        {
            var respuesta = new RespuestaUsuarioMantenimiento();

            await using var conn = _connectionFactory.CreateConnection();

            await using var cmd = new SqlCommand("SEG_CF_MAN_USUARIO", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add(new SqlParameter("@Accion", SqlDbType.Char, 3) { Value = Accion });
            cmd.Parameters.Add(new SqlParameter("@Cod_Usuario", SqlDbType.Int) { Value = (object?)Cod_Usuario ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Nom_Usuario", SqlDbType.VarChar, 50) { Value = (object?)Nom_Usuario ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Nom_Completo", SqlDbType.VarChar, 150) { Value = (object?)Nom_Completo ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Pwd_Hash", SqlDbType.VarChar, 255) { Value = (object?)Pwd_Hash ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Rol", SqlDbType.VarChar, 20) { Value = (object?)Rol ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Cod_Miembro", SqlDbType.Int) { Value = (object?)Cod_Miembro ?? DBNull.Value });

            try
            {
                await conn.OpenAsync();
                await using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    respuesta.Codigo = Convert.ToInt32(reader["Codigo"]);
                    respuesta.Mensaje = reader["Mensaje"]?.ToString();
                    respuesta.Cod_Usuario = reader["Cod_Usuario"] == DBNull.Value ? null : Convert.ToInt32(reader["Cod_Usuario"]);
                }
            }
            catch (SqlException ex)
            {
                respuesta.Codigo = 0;
                respuesta.Mensaje = ex.Message;
            }

            return respuesta;
        }

        #endregion
    }
}
