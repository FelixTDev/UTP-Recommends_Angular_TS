export interface StudentDashboardResponse {
  totalResenas: number;
  resenasPendientes: number;
  resenasAprobadas: number;
  resenasRechazadas: number;
  totalSolicitudes: number;
  ultimasResenas: RecentReviewItem[];
  ultimasSolicitudes: RecentRequestItem[];
}

export interface RecentReviewItem {
  id: number;
  curso: string;
  docente: string;
  estado: string;
  fechaCreacion: string;
}

export interface RecentRequestItem {
  id: number;
  tipo: string;
  estado: string;
  fechaCreacion: string;
}

export interface StudentProfileResponse {
  estudianteId: number;
  usuarioId: number;
  email: string;
  rol: string;
  estado: string;
  codigoEstudiante: string;
  carreraId: number;
  carreraNombre: string;
  nombres: string;
  apellidos: string;
}

export interface StudentProfileUpdateRequest {
  nombres: string;
  apellidos: string;
}

export interface ActiveCourseTeacherOptionResponse {
  idCursoDocente: number;
  idCurso: number;
  nombreCurso: string;
  codigoCurso: string;
  tipoCurso: string;
  carreraId?: number;
  carreraNombre?: string;
  idDocente: number;
  nombreDocente: string;
  estado: string;
}

export interface CriterioPuntajeRequest {
  criterioId: number;
  puntaje: number;
}

export interface ResenaCreateRequest {
  cursoDocenteId: number;
  comentario: string;
  esAnonimo: boolean;
  calificaciones: CriterioPuntajeRequest[];
}

export interface ResenaCalificacionResponse {
  criterioId: number;
  criterio: string;
  puntaje: number;
}

export interface ResenaResponse {
  id: number;
  cursoDocenteId: number;
  curso: string;
  docente: string;
  comentario: string;
  esAnonimo: boolean;
  estado: string;
  version: number;
  motivoRechazo?: string;
  fechaCreacion: string;
  calificaciones: ResenaCalificacionResponse[];
}

export interface SolicitudCreateRequest {
  tipo: string; // 'CURSO_NUEVO', 'DOCENTE_NUEVO', 'AMBOS'
  nombreCursoSugerido?: string;
  carreraSugeridaId?: number;
  nombresDocenteSugerido?: string;
  apellidosDocenteSugerido?: string;
  nombreDocenteSugerido?: string;
  comentario: string;
}

export interface SolicitudResponse {
  id: number;
  tipo: string;
  estado: string;
  nombreCursoSugerido?: string;
  nombresDocenteSugerido?: string;
  apellidosDocenteSugerido?: string;
  nombreDocenteSugerido?: string;
  comentario: string;
  motivoRechazo?: string;
  fechaCreacion: string;
}
