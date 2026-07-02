import { CriterioPuntajeRequest } from './student.models';

export interface AdminDashboardResponse {
  resenasPendientes: number;
  solicitudesPendientes: number;
  usuariosActivos: number;
  cursosActivos: number;
  docentesActivos: number;
  criteriosActivos: number;
}

export interface UsuarioCreateRequest {
  email: string;
  password?: string; // Optional during updates or creation depending on flow
  nombres: string;
  apellidos: string;
  rol: string; // 'ADMIN', 'ESTUDIANTE'
  carreraId?: number;
}

export interface UsuarioUpdateRequest {
  email: string;
  nombres: string;
  apellidos: string;
  carreraId?: number;
}

export interface UsuarioEstadoRequest {
  estado: string; // 'ACTIVO', 'INACTIVO', 'SUSPENDIDO'
}

export interface UsuarioResponse {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  rol: string;
  estado: string;
  codigoEstudiante?: string;
  carreraId?: number;
  carreraNombre?: string;
  totalResenas: number;
}

export interface CarreraRequest {
  nombre: string;
}

export interface CarreraResponse {
  id: number;
  nombre: string;
  estado: string; // 'ACTIVA', 'INACTIVA'
}

export interface CursoCreateRequest {
  nombre: string;
  tipo: string; // 'GENERAL', 'CARRERA'
  carreraId?: number;
  estado?: string; // 'ACTIVO', 'INACTIVO'
}

export interface CursoResponse {
  id: number;
  nombre: string;
  tipo: string;
  carreraId?: number;
  estado: string;
}

export interface DocenteRequest {
  nombres: string;
  apellidos: string;
  email?: string;
}

export interface DocenteResponse {
  id: number;
  nombres: string;
  apellidos: string;
  email?: string;
  estado: string; // 'ACTIVO', 'INACTIVO'
}

export interface CursoDocenteRequest {
  cursoId: number;
  docenteId: number;
  estado?: string;
}

export interface CursoDocenteEstadoRequest {
  estado: string;
}

export interface CursoDocenteResponse {
  id: number;
  cursoId: number;
  curso: string;
  docenteId: number;
  docente: string;
  estado: string;
}

export interface CriterioRequest {
  nombre: string;
  descripcion?: string;
}

export interface CriterioEstadoRequest {
  estado: string;
}

export interface CriterioResponse {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: string;
}

export interface StudentSummary {
  id: number;
  nombreCompleto: string;
  correo: string;
  carreraId?: number;
  carreraNombre?: string;
}

export interface CourseSummary {
  id: number;
  nombre: string;
  tipoCurso: string;
  carreraId?: number;
  carreraNombre?: string;
}

export interface TeacherSummary {
  id: number;
  nombreCompleto: string;
}

export interface ScoreSummary {
  criterioId: number;
  criterio: string;
  puntaje: number;
}

export interface ModeracionResenaResponse {
  idResena: number;
  estado: string;
  comentario: string;
  fechaCreacion: string;
  esAnonimo: boolean;
  estudiante: StudentSummary;
  curso: CourseSummary;
  docente: TeacherSummary;
  calificaciones: ScoreSummary[];
  motivoRechazo?: string;
}

export interface RequestedData {
  nombreCursoSugerido?: string;
  carreraSugeridaId?: number;
  carreraSugeridaNombre?: string;
  nombreDocenteSugerido?: string;
}

export interface ModeracionSolicitudResponse {
  idSolicitud: number;
  tipo: string;
  estado: string;
  fechaCreacion: string;
  comentario: string;
  estudiante: StudentSummary;
  requestedData: RequestedData;
  resenaGeneradaId?: number;
  motivoRechazo?: string;
}

export interface AprobarSolicitudRequest {
  tipoCurso?: string; // 'GENERAL', 'CARRERA'
  carreraId?: number;
  cursoExistenteId?: number;
  docenteExistenteId?: number;
  calificaciones: CriterioPuntajeRequest[];
}

export interface RechazarSolicitudRequest {
  motivoRechazo: string;
}

export interface MotivoRechazoRequest {
  motivoRechazo: string;
}
