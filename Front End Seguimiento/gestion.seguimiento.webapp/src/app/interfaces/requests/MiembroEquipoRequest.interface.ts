export interface MiembroEquipoRequest {
  Accion: 'INS' | 'UPD' | 'DEL';
  Cod_Miembro?: number | null;
  Nom_Miembro?: string | null;
}
