export interface Usuario {
  Cod_Usuario: number;
  Nom_Usuario: string;
  Nom_Completo: string;
  Rol: 'Admin' | 'Usuario';
  Cod_Miembro?: number | null;
  Nom_Miembro?: string | null;
  Activo: boolean;
}
