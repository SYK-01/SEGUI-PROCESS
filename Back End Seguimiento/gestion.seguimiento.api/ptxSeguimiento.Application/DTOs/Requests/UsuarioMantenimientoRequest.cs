namespace ptxSeguimiento.Application.DTOs.Requests
{
    public class UsuarioMantenimientoRequest
    {
        public string Accion { get; set; } = string.Empty;    // INS | UPD | DEL
        public int? Cod_Usuario { get; set; }
        public string? Nom_Usuario { get; set; }
        public string? Nom_Completo { get; set; }

        /// <summary>
        /// Contraseña en texto plano tal como la escribe el Admin en el formulario.
        /// UsuariosService la hashea con BCrypt antes de llegar al repositorio; nunca
        /// se guarda ni se transmite en texto plano hacia la base de datos. En "UPD"
        /// se puede dejar vacía si no se quiere cambiar la contraseña actual
        /// (SEG_CF_MAN_USUARIO conserva el hash existente cuando no se envía uno nuevo).
        /// </summary>
        public string? Password { get; set; }

        public string? Rol { get; set; }                      // Admin | Usuario
        public int? Cod_Miembro { get; set; }
    }
}
