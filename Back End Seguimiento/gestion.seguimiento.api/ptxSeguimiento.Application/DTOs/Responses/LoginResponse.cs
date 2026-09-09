namespace ptxSeguimiento.Application.DTOs.Responses
{
    public class LoginResponse
    {
        public int Codigo { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public string? Token { get; set; }
        public int? Cod_Usuario { get; set; }
        public string? Nom_Usuario { get; set; }
        public string? Nom_Completo { get; set; }
        public string? Rol { get; set; }
        public int? Cod_Miembro { get; set; }
    }
}
