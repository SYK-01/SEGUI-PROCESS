namespace ptxSeguimiento.Domain.Entities
{
    public class Ticket
    {
        public int Num_Ticket { get; set; }
        public string? Codigo { get; set; }
        public int Cod_Sistema { get; set; }
        public string? Nom_Sistema { get; set; }
        public string? Cod_Corto { get; set; }
        public string? Tipo { get; set; }
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string? Estado { get; set; }
        public string? Prioridad { get; set; }
        public int? Cod_Responsable { get; set; }
        public string? Nom_Responsable { get; set; }
        public DateTime Fecha_Creacion { get; set; }
        public DateTime? Fecha_Resolucion { get; set; }

        /// <summary>
        /// Fecha fin real del ticket. Solo se puede dejar el Estado en uno de los 3
        /// estados de la columna "Cerrado" cuando este campo tiene valor.
        /// </summary>
        public DateTime? Fecha_Real_Final { get; set; }

        /// <summary>
        /// Fecha en la que realmente arrancó el trabajo (columna ya existente en
        /// Seg_Tickets, no se edita desde el tablero todavía).
        /// </summary>
        public DateTime? Fecha_Real_Inicio { get; set; }

        /// <summary>
        /// Planificación usada por la vista Gantt (día/mes): inicio y entrega
        /// estimados. Se editan desde el modal del tablero.
        /// </summary>
        public DateTime? Fecha_Estimada_Inicio { get; set; }
        public DateTime? Fecha_Estimada_Entrega { get; set; }
    }
}
