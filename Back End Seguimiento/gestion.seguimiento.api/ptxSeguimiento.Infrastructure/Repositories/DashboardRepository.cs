using Microsoft.Data.SqlClient;
using System.Data;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;
using ptxSeguimiento.Infrastructure.Common;

namespace ptxSeguimiento.Infrastructure.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public DashboardRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<DashboardResumen> ObtenerResumen(int? Cod_Responsable)
        {
            var resumen = new DashboardResumen();

            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SEG_UP_DASHBOARD_RESUMEN", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            // NULL = ver todo (Admin); con valor = solo lo suyo. El procedimiento
            // almacenado ya soportaba este parámetro; antes el Back End nunca lo
            // enviaba, así que el Dashboard siempre mostraba el total general.
            cmd.Parameters.Add(new SqlParameter("@Cod_Responsable", SqlDbType.Int) { Value = (object?)Cod_Responsable ?? DBNull.Value });

            await using var reader = await cmd.ExecuteReaderAsync();

            // 1) Métricas generales
            if (await reader.ReadAsync())
            {
                resumen.Metricas = new DashboardMetricas
                {
                    Total_Tickets = Convert.ToInt32(reader["Total_Tickets"]),
                    Incidentes_Abiertos = Convert.ToInt32(reader["Incidentes_Abiertos"]),
                    Resueltos_Cerrados = Convert.ToInt32(reader["Resueltos_Cerrados"]),
                    Tiempo_Promedio_Resolucion = Convert.ToDouble(reader["Tiempo_Promedio_Resolucion"])
                };
            }

            // 2) Por sistema y tipo
            if (await reader.NextResultAsync())
            {
                while (await reader.ReadAsync())
                {
                    resumen.PorSistema.Add(new DashboardPorSistema
                    {
                        Cod_Sistema = Convert.ToInt32(reader["Cod_Sistema"]),
                        Cod_Corto = reader["Cod_Corto"]?.ToString(),
                        Nom_Sistema = reader["Nom_Sistema"]?.ToString(),
                        Cant_Requerimiento = Convert.ToInt32(reader["Cant_Requerimiento"]),
                        Cant_Incidente = Convert.ToInt32(reader["Cant_Incidente"]),
                        Cant_Solicitud = Convert.ToInt32(reader["Cant_Solicitud"]),
                        Cant_Reunion = Convert.ToInt32(reader["Cant_Reunion"])
                    });
                }
            }

            // 3) Por estado
            if (await reader.NextResultAsync())
            {
                while (await reader.ReadAsync())
                {
                    resumen.PorEstado.Add(new DashboardPorEstado
                    {
                        Estado = reader["Estado"]?.ToString(),
                        Cantidad = Convert.ToInt32(reader["Cantidad"])
                    });
                }
            }

            // 4) Por responsable
            if (await reader.NextResultAsync())
            {
                while (await reader.ReadAsync())
                {
                    resumen.PorResponsable.Add(new DashboardPorResponsable
                    {
                        Cod_Miembro = Convert.ToInt32(reader["Cod_Miembro"]),
                        Nom_Miembro = reader["Nom_Miembro"]?.ToString(),
                        Tickets_Activos = Convert.ToInt32(reader["Tickets_Activos"])
                    });
                }
            }

            return resumen;
        }
    }
}
