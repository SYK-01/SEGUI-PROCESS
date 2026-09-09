namespace ptxSeguimiento.Domain.Entities
{
    public class Usuario
    {
        public int Cod_Usuario { get; set; }
        public string? Nom_Usuario { get; set; }
        public string? Nom_Completo { get; set; }
        public string? Pwd_Hash { get; set; }
        public string? Rol { get; set; }
        /// <summary>
        /// A qué integrante de Seg_Equipo corresponde este login. Es la base del
        /// acceso por usuario: con Rol distinto de "Admin", el usuario solo ve/edita
        /// los tickets donde Cod_Responsable = Cod_Miembro (ver TicketsController).
        /// </summary>
        public int? Cod_Miembro { get; set; }
        public string? Nom_Miembro { get; set; }
        public bool Activo { get; set; }
    }
}
