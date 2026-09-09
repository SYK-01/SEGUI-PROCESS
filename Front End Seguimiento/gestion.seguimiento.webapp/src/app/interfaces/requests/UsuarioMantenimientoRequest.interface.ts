export interface UsuarioMantenimientoRequest {
  Accion: 'INS' | 'UPD' | 'DEL';
  Cod_Usuario?: number | null;
  Nom_Usuario?: string | null;
  Nom_Completo?: string | null;
  /** Texto plano; se deja vacío/omitido en UPD para no cambiar la contraseña actual. */
  Password?: string | null;
  Rol?: 'Admin' | 'Usuario' | null;
  Cod_Miembro?: number | null;
}
