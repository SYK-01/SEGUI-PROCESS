namespace ptxSeguimiento.Domain.Entities
{
    public class DashboardMetricas
    {
        public int Total_Tickets { get; set; }
        public int Incidentes_Abiertos { get; set; }
        public int Resueltos_Cerrados { get; set; }
        public double Tiempo_Promedio_Resolucion { get; set; }
    }

    public class DashboardPorSistema
    {
        public int Cod_Sistema { get; set; }
        public string? Cod_Corto { get; set; }
        public string? Nom_Sistema { get; set; }
        public int Cant_Requerimiento { get; set; }
        public int Cant_Incidente { get; set; }
        /// <summary>
        /// SEG_UP_DASHBOARD_RESUMEN ya devuelve esta columna (dominio real de Tipo:
        /// INCIDENCIA/REQUERIMIENTO/SOLICITUD/REUNIÓN); antes no se leía y esos
        /// tickets desaparecían del gráfico "Tickets por sistema y tipo".
        /// </summary>
        public int Cant_Solicitud { get; set; }
        public int Cant_Reunion { get; set; }
    }

    public class DashboardPorEstado
    {
        public string? Estado { get; set; }
        public int Cantidad { get; set; }
    }

    public class DashboardPorResponsable
    {
        public int Cod_Miembro { get; set; }
        public string? Nom_Miembro { get; set; }
        public int Tickets_Activos { get; set; }
    }

    public class DashboardResumen
    {
        public DashboardMetricas Metricas { get; set; } = new();
        public List<DashboardPorSistema> PorSistema { get; set; } = new();
        public List<DashboardPorEstado> PorEstado { get; set; } = new();
        public List<DashboardPorResponsable> PorResponsable { get; set; } = new();
    }
}
