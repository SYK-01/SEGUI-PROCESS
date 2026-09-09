export interface LoginResponse {
  Codigo: number;
  Mensaje: string;
  Token?: string;
  Cod_Usuario?: number;
  Nom_Usuario?: string;
  Nom_Completo?: string;
  Rol?: string;
  Cod_Miembro?: number | null;
}
