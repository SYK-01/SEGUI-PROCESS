export interface DashboardMetricas {
  Total_Tickets: number;
  Incidentes_Abiertos: number;
  Resueltos_Cerrados: number;
  Tiempo_Promedio_Resolucion: number;
}

export interface DashboardPorSistema {
  Cod_Sistema: number;
  Cod_Corto: string;
  Nom_Sistema: string;
  Cant_Requerimiento: number;
  Cant_Incidente: number;
  Cant_Solicitud: number;
  Cant_Reunion: number;
}

export interface DashboardPorEstado {
  Estado: string;
  Cantidad: number;
}

export interface DashboardPorResponsable {
  Cod_Miembro: number;
  Nom_Miembro: string;
  Tickets_Activos: number;
}

export interface DashboardResumen {
  Metricas: DashboardMetricas;
  PorSistema: DashboardPorSistema[];
  PorEstado: DashboardPorEstado[];
  PorResponsable: DashboardPorResponsable[];
}
