using Microsoft.Data.SqlClient;
using System.Data;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;
using ptxSeguimiento.Infrastructure.Common;

namespace ptxSeguimiento.Infrastructure.Repositories
{
    public class TicketsRepository : ITicketsRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public TicketsRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        #region Listar

        public async Task<IEnumerable<Ticket>> Listar(int? Cod_Sistema, int? Cod_Responsable, string? Tipo)
        {
            var lista = new List<Ticket>();

            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SEG_UP_LISTA_TICKETS", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add(new SqlParameter("@Cod_Sistema", SqlDbType.Int) { Value = (object?)Cod_Sistema ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Cod_Responsable", SqlDbType.Int) { Value = (object?)Cod_Responsable ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Tipo", SqlDbType.VarChar, 20) { Value = (object?)Tipo ?? DBNull.Value });

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lista.Add(MapearTicket(reader));
            }

            return lista;
        }

        #endregion

        #region Obtener

        public async Task<Ticket?> Obtener(int Num_Ticket)
        {
            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SEG_UP_OBTENER_TICKET", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add(new SqlParameter("@Num_Ticket", SqlDbType.Int) { Value = Num_Ticket });

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return MapearTicket(reader);
        }

        private static Ticket MapearTicket(SqlDataReader reader)
        {
            return new Ticket
            {
                Num_Ticket = Convert.ToInt32(reader["Num_Ticket"]),
                Codigo = reader["Codigo"]?.ToString(),
                Cod_Sistema = Convert.ToInt32(reader["Cod_Sistema"]),
                Nom_Sistema = reader["Nom_Sistema"]?.ToString(),
                Cod_Corto = reader["Cod_Corto"]?.ToString(),
                Tipo = reader["Tipo"]?.ToString(),
                Titulo = reader["Titulo"]?.ToString(),
                Descripcion = reader["Descripcion"] == DBNull.Value ? null : reader["Descripcion"].ToString(),
                Estado = reader["Estado"]?.ToString(),
                Prioridad = reader["Prioridad"]?.ToString(),
                Cod_Responsable = reader["Cod_Responsable"] == DBNull.Value ? null : Convert.ToInt32(reader["Cod_Responsable"]),
                Nom_Responsable = reader["Nom_Responsable"] == DBNull.Value ? null : reader["Nom_Responsable"].ToString(),
                Fecha_Creacion = Convert.ToDateTime(reader["Fecha_Creacion"]),
                Fecha_Resolucion = reader["Fecha_Resolucion"] == DBNull.Value ? null : Convert.ToDateTime(reader["Fecha_Resolucion"]),
                Fecha_Real_Final = HasColumn(reader, "Fecha_Real_Final") && reader["Fecha_Real_Final"] != DBNull.Value
                    ? Convert.ToDateTime(reader["Fecha_Real_Final"])
                    : null,
                Fecha_Real_Inicio = HasColumn(reader, "Fecha_Real_Inicio") && reader["Fecha_Real_Inicio"] != DBNull.Value
                    ? Convert.ToDateTime(reader["Fecha_Real_Inicio"])
                    : null,
                // Usadas por la vista Gantt (día/mes) del Front End.
                Fecha_Estimada_Inicio = HasColumn(reader, "Fecha_Estimada_Inicio") && reader["Fecha_Estimada_Inicio"] != DBNull.Value
                    ? Convert.ToDateTime(reader["Fecha_Estimada_Inicio"])
                    : null,
                Fecha_Estimada_Entrega = HasColumn(reader, "Fecha_Estimada_Entrega") && reader["Fecha_Estimada_Entrega"] != DBNull.Value
                    ? Convert.ToDateTime(reader["Fecha_Estimada_Entrega"])
                    : null
            };
        }

        private static bool HasColumn(SqlDataReader reader, string columnName)
        {
            for (int i = 0; i < reader.FieldCount; i++)
            {
                if (string.Equals(reader.GetName(i), columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }

        #endregion

        #region Mantenimiento

        public async Task<RespuestaTicketMantenimiento> Mantenimiento(
            string Accion,
            int? Num_Ticket,
            int Cod_Sistema,
            string Tipo,
            string Titulo,
            string? Descripcion,
            string Estado,
            string Prioridad,
            int? Cod_Responsable,
            DateTime? Fecha_Creacion,
            DateTime? Fecha_Resolucion,
            DateTime? Fecha_Real_Final,
            int? Cod_Usuario,
            DateTime? Fecha_Estimada_Inicio,
            DateTime? Fecha_Estimada_Entrega)
        {
            var respuesta = new RespuestaTicketMantenimiento();

            await using var conn = _connectionFactory.CreateConnection();

            await using var cmd = new SqlCommand("SEG_CF_MAN_TICKET", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add(new SqlParameter("@Accion", SqlDbType.Char, 3) { Value = Accion });
            cmd.Parameters.Add(new SqlParameter("@Num_Ticket", SqlDbType.Int) { Value = (object?)Num_Ticket ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Cod_Sistema", SqlDbType.Int) { Value = Cod_Sistema });
            cmd.Parameters.Add(new SqlParameter("@Tipo", SqlDbType.VarChar, 20) { Value = Tipo });
            cmd.Parameters.Add(new SqlParameter("@Titulo", SqlDbType.VarChar, 200) { Value = Titulo });
            cmd.Parameters.Add(new SqlParameter("@Descripcion", SqlDbType.VarChar, 1000) { Value = (object?)Descripcion ?? DBNull.Value });
            // Estado es VARCHAR(80) en la base de datos: la etiqueta real más larga
            // ("Con Validación Funcional (por el analista funcional)") no cabe en
            // VARCHAR(20), así que usar ese tamaño aquí truncaba el valor antes de
            // llegar al procedimiento almacenado.
            cmd.Parameters.Add(new SqlParameter("@Estado", SqlDbType.VarChar, 80) { Value = Estado });
            cmd.Parameters.Add(new SqlParameter("@Prioridad", SqlDbType.VarChar, 10) { Value = Prioridad });
            cmd.Parameters.Add(new SqlParameter("@Cod_Responsable", SqlDbType.Int) { Value = (object?)Cod_Responsable ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Fecha_Creacion", SqlDbType.Date) { Value = (object?)Fecha_Creacion ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Fecha_Resolucion", SqlDbType.Date) { Value = (object?)Fecha_Resolucion ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Fecha_Real_Final", SqlDbType.Date) { Value = (object?)Fecha_Real_Final ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Cod_Usuario", SqlDbType.Int) { Value = (object?)Cod_Usuario ?? DBNull.Value });
            // Planificación para la vista Gantt. SEG_CF_MAN_TICKET usa ISNULL contra el
            // valor existente (ver Seguimiento_BaseDatos_10), así que no enviarlas no
            // borra lo que ya estuviera guardado.
            cmd.Parameters.Add(new SqlParameter("@Fecha_Estimada_Inicio", SqlDbType.Date) { Value = (object?)Fecha_Estimada_Inicio ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Fecha_Estimada_Entrega", SqlDbType.Date) { Value = (object?)Fecha_Estimada_Entrega ?? DBNull.Value });

            try
            {
                await conn.OpenAsync();
                await using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    respuesta.Codigo = Convert.ToInt32(reader["Codigo"]);
                    respuesta.Mensaje = reader["Mensaje"]?.ToString();
                    respuesta.Num_Ticket = reader["Num_Ticket"] == DBNull.Value ? null : Convert.ToInt32(reader["Num_Ticket"]);
                    respuesta.Codigo_Ticket = reader["Codigo_Ticket"] == DBNull.Value ? null : reader["Codigo_Ticket"].ToString();
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

        #region MoverEstado

        public async Task<RespuestaMantenimiento> MoverEstado(int Num_Ticket, string Estado, DateTime? Fecha_Real_Final, int? Cod_Usuario)
        {
            var respuesta = new RespuestaMantenimiento();

            await using var conn = _connectionFactory.CreateConnection();

            await using var cmd = new SqlCommand("SEG_CF_MOVER_ESTADO_TICKET", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add(new SqlParameter("@Num_Ticket", SqlDbType.Int) { Value = Num_Ticket });
            // Igual que en Mantenimiento: 80 caracteres para que entren las etiquetas
            // reales del flujo (la más larga tiene 53).
            cmd.Parameters.Add(new SqlParameter("@Estado", SqlDbType.VarChar, 80) { Value = Estado });
            cmd.Parameters.Add(new SqlParameter("@Fecha_Real_Final", SqlDbType.Date) { Value = (object?)Fecha_Real_Final ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Cod_Usuario", SqlDbType.Int) { Value = (object?)Cod_Usuario ?? DBNull.Value });

            try
            {
                await conn.OpenAsync();
                await using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    respuesta.Codigo = Convert.ToInt32(reader["Codigo"]);
                    respuesta.Mensaje = reader["Mensaje"]?.ToString();
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
