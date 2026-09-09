namespace ptxSeguimiento.Application.DTOs.Requests
{
    public class ListaTicketsRequest
    {
        public int? Cod_Sistema { get; set; }
        public int? Cod_Responsable { get; set; }
        public string? Tipo { get; set; }
    }
}
