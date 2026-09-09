namespace ptxSeguimiento.Domain.Entities
{
    public class RespuestaMantenimiento
    {
        public int Codigo { get; set; }
        public string? Mensaje { get; set; }
    }

    public class RespuestaTicketMantenimiento
    {
        public int Codigo { get; set; }
        public string? Mensaje { get; set; }
        public int? Num_Ticket { get; set; }
        public string? Codigo_Ticket { get; set; }
    }

    public class RespuestaEquipoMantenimiento
    {
        public int Codigo { get; set; }
        public string? Mensaje { get; set; }
        public int? Cod_Miembro { get; set; }
    }

    public class RespuestaUsuarioMantenimiento
    {
        public int Codigo { get; set; }
        public string? Mensaje { get; set; }
        public int? Cod_Usuario { get; set; }
    }
}
