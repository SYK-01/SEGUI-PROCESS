/**
 * Modelo de estados del flujo real de Seguimiento (coincide exactamente con el
 * CHECK CK_Seg_Tickets_Estado de la base de datos). El tablero solo muestra 4
 * columnas al usuario, pero por debajo cada ticket sigue guardando uno de
 * estos 6 estados reales: la columna "Cerrado" agrupa los 3 estados finales
 * del proceso (validación funcional -> aprobación del usuario -> entregado).
 *
 * Si el día de mañana la base de datos agrega o renombra un estado, este es
 * el único archivo que hay que tocar: todo lo demás (tablero, dashboard,
 * formularios) lee de aquí.
 */

export const ESTADOS_REALES = [
  'Pendiente (No Programado)',
  'Programado (Con fechas de entrega)',
  'En Proceso',
  'Con Validación Funcional (por el analista funcional)',
  'Con Aprobación del Usuario y/ó KeyUser',
  'Entregado (en cancha del analista funcional)'
] as const;

export type EstadoReal = typeof ESTADOS_REALES[number];

/** Las 4 columnas visibles del tablero (lo único que ve el usuario a diario). */
export const COLUMNAS = ['Pendiente', 'Programado', 'En Proceso', 'Cerrado'] as const;

export type Columna = typeof COLUMNAS[number];

/** A qué columna del tablero pertenece cada estado real. */
export const ESTADO_A_COLUMNA: Record<EstadoReal, Columna> = {
  'Pendiente (No Programado)': 'Pendiente',
  'Programado (Con fechas de entrega)': 'Programado',
  'En Proceso': 'En Proceso',
  'Con Validación Funcional (por el analista funcional)': 'Cerrado',
  'Con Aprobación del Usuario y/ó KeyUser': 'Cerrado',
  'Entregado (en cancha del analista funcional)': 'Cerrado'
};

/**
 * Estado real por defecto al mover una tarjeta a cada columna con el
 * selector rápido del tablero. "Cerrado" no tiene un valor 1 a 1: mover una
 * tarjeta ahí siempre cierra el ticket por completo (ver ESTADO_FINAL). Para
 * dejarlo en un estado intermedio de cierre (validación funcional o
 * aprobación del usuario) se usa el selector de estado detallado del modal
 * de edición, no el selector rápido de la tarjeta.
 */
export const COLUMNA_A_ESTADO_DEFECTO: Partial<Record<Columna, EstadoReal>> = {
  'Pendiente': 'Pendiente (No Programado)',
  'Programado': 'Programado (Con fechas de entrega)',
  'En Proceso': 'En Proceso'
};

/** Estado real que representa un ticket totalmente cerrado. */
export const ESTADO_FINAL: EstadoReal = 'Entregado (en cancha del analista funcional)';

/** Los 3 estados reales que caen dentro de la columna "Cerrado", en orden. */
export const SUBESTADOS_CERRADO: EstadoReal[] = [
  'Con Validación Funcional (por el analista funcional)',
  'Con Aprobación del Usuario y/ó KeyUser',
  'Entregado (en cancha del analista funcional)'
];

/** Etiqueta corta para mostrar el sub-estado dentro de una tarjeta "Cerrado". */
export const SUBESTADO_CORTO: Record<string, string> = {
  'Con Validación Funcional (por el analista funcional)': 'Validación funcional',
  'Con Aprobación del Usuario y/ó KeyUser': 'Aprobación usuario',
  'Entregado (en cancha del analista funcional)': 'Entregado'
};

export const TIPOS = ['INCIDENCIA', 'REQUERIMIENTO', 'SOLICITUD', 'REUNIÓN'] as const;

export const PRIORIDADES = ['Alta', 'Medio', 'Baja'] as const;

/** Mismos colores del prototipo aprobado, como variables CSS (ver styles.css). */
export const COLUMNA_COLOR: Record<Columna, string> = {
  'Pendiente': 'var(--pendiente)',
  'Programado': 'var(--programado)',
  'En Proceso': 'var(--enproceso)',
  'Cerrado': 'var(--cerrado)'
};

/**
 * Mismos colores que COLUMNA_COLOR pero como valores hex literales, para
 * usar en <canvas> (Chart.js, en el Dashboard): el contexto 2D de canvas no
 * entiende `var(--x)` como color, solo lo entiende CSS normal en el DOM.
 */
export const COLUMNA_COLOR_HEX: Record<Columna, string> = {
  'Pendiente': '#B5563C',
  'Programado': '#2563EB',
  'En Proceso': '#D97706',
  'Cerrado': '#16A34A'
};

export const COLUMNA_COLOR_WASH: Record<Columna, string> = {
  'Pendiente': 'var(--pendiente-wash)',
  'Programado': 'var(--programado-wash)',
  'En Proceso': 'var(--enproceso-wash)',
  'Cerrado': 'var(--cerrado-wash)'
};

/** Color por tipo de ticket, para la etiqueta de cada tarjeta. */
export const TIPO_COLOR: Record<string, string> = {
  'INCIDENCIA': 'var(--incidencia)',
  'REQUERIMIENTO': 'var(--requerimiento)',
  'SOLICITUD': 'var(--solicitud)',
  'REUNIÓN': 'var(--reunion)'
};

export const TIPO_COLOR_WASH: Record<string, string> = {
  'INCIDENCIA': 'var(--incidencia-wash)',
  'REQUERIMIENTO': 'var(--requerimiento-wash)',
  'SOLICITUD': 'var(--solicitud-wash)',
  'REUNIÓN': 'var(--reunion-wash)'
};

/** true si el estado real pertenece a la columna "Cerrado". */
export function esEstadoDeCierre(estado: string | null | undefined): boolean {
  return !!estado && SUBESTADOS_CERRADO.indexOf(estado as EstadoReal) !== -1;
}
