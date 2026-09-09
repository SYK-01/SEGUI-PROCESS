namespace ptxSeguimiento.Application.DTOs.Requests
{
    public class MiembroEquipoRequest
    {
        public string Accion { get; set; } = string.Empty;    // INS | DEL
        public int? Cod_Miembro { get; set; }
        public string? Nom_Miembro { get; set; }
    }
}
