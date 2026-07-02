import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminDashboardResponse,
  UsuarioResponse,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioEstadoRequest,
  CarreraResponse,
  CarreraRequest,
  CursoResponse,
  CursoCreateRequest,
  DocenteResponse,
  DocenteRequest,
  CursoDocenteResponse,
  CursoDocenteRequest,
  CursoDocenteEstadoRequest,
  CriterioResponse,
  CriterioRequest,
  CriterioEstadoRequest,
  ModeracionResenaResponse,
  MotivoRechazoRequest,
  ModeracionSolicitudResponse,
  AprobarSolicitudRequest,
  RechazarSolicitudRequest
} from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);

  // Dashboard
  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${environment.apiUrl}/admin/dashboard`);
  }

  // Usuarios CRUD
  listarUsuarios(rol?: string, estado?: string): Observable<UsuarioResponse[]> {
    let params = new HttpParams();
    if (rol) params = params.set('rol', rol);
    if (estado) params = params.set('estado', estado);
    return this.http.get<UsuarioResponse[]>(`${environment.apiUrl}/admin/usuarios`, { params });
  }

  crearUsuario(request: UsuarioCreateRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${environment.apiUrl}/admin/usuarios`, request);
  }

  obtenerUsuario(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${environment.apiUrl}/admin/usuarios/${id}`);
  }

  actualizarUsuario(id: number, request: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${environment.apiUrl}/admin/usuarios/${id}`, request);
  }

  cambiarEstadoUsuario(id: number, request: UsuarioEstadoRequest): Observable<UsuarioResponse> {
    return this.http.patch<UsuarioResponse>(`${environment.apiUrl}/admin/usuarios/${id}/estado`, request);
  }

  // Carreras CRUD
  listarCarreras(): Observable<CarreraResponse[]> {
    return this.http.get<CarreraResponse[]>(`${environment.apiUrl}/admin/carreras`);
  }

  crearCarrera(request: CarreraRequest): Observable<CarreraResponse> {
    return this.http.post<CarreraResponse>(`${environment.apiUrl}/admin/carreras`, request);
  }

  actualizarCarrera(id: number, request: CarreraRequest): Observable<CarreraResponse> {
    return this.http.put<CarreraResponse>(`${environment.apiUrl}/admin/carreras/${id}`, request);
  }

  inactivarCarrera(id: number): Observable<CarreraResponse> {
    return this.http.delete<CarreraResponse>(`${environment.apiUrl}/admin/carreras/${id}`);
  }

  // Cursos CRUD
  listarCursos(): Observable<CursoResponse[]> {
    return this.http.get<CursoResponse[]>(`${environment.apiUrl}/admin/cursos`);
  }

  crearCurso(request: CursoCreateRequest): Observable<CursoResponse> {
    return this.http.post<CursoResponse>(`${environment.apiUrl}/admin/cursos`, request);
  }

  actualizarCurso(id: number, request: CursoCreateRequest): Observable<CursoResponse> {
    return this.http.put<CursoResponse>(`${environment.apiUrl}/admin/cursos/${id}`, request);
  }

  inactivarCurso(id: number): Observable<CursoResponse> {
    return this.http.delete<CursoResponse>(`${environment.apiUrl}/admin/cursos/${id}`);
  }

  // Docentes CRUD
  listarDocentes(): Observable<DocenteResponse[]> {
    return this.http.get<DocenteResponse[]>(`${environment.apiUrl}/admin/docentes`);
  }

  crearDocente(request: DocenteRequest): Observable<DocenteResponse> {
    return this.http.post<DocenteResponse>(`${environment.apiUrl}/admin/docentes`, request);
  }

  actualizarDocente(id: number, request: DocenteRequest): Observable<DocenteResponse> {
    return this.http.put<DocenteResponse>(`${environment.apiUrl}/admin/docentes/${id}`, request);
  }

  inactivarDocente(id: number): Observable<DocenteResponse> {
    return this.http.delete<DocenteResponse>(`${environment.apiUrl}/admin/docentes/${id}`);
  }

  // Curso-Docente
  listarAsignaciones(): Observable<CursoDocenteResponse[]> {
    return this.http.get<CursoDocenteResponse[]>(`${environment.apiUrl}/admin/curso-docente`);
  }

  crearAsignacion(request: CursoDocenteRequest): Observable<CursoDocenteResponse> {
    return this.http.post<CursoDocenteResponse>(`${environment.apiUrl}/admin/curso-docente`, request);
  }

  listarDocentesPorCurso(cursoId: number): Observable<CursoDocenteResponse[]> {
    return this.http.get<CursoDocenteResponse[]>(`${environment.apiUrl}/admin/cursos/${cursoId}/docentes`);
  }

  listarCursosPorDocente(docenteId: number): Observable<CursoDocenteResponse[]> {
    return this.http.get<CursoDocenteResponse[]>(`${environment.apiUrl}/admin/docentes/${docenteId}/cursos`);
  }

  cambiarEstadoAsignacion(id: number, request: CursoDocenteEstadoRequest): Observable<CursoDocenteResponse> {
    return this.http.patch<CursoDocenteResponse>(`${environment.apiUrl}/admin/curso-docente/${id}/estado`, request);
  }

  // Criterios CRUD
  listarCriterios(): Observable<CriterioResponse[]> {
    return this.http.get<CriterioResponse[]>(`${environment.apiUrl}/admin/criterios`);
  }

  crearCriterio(request: CriterioRequest): Observable<CriterioResponse> {
    return this.http.post<CriterioResponse>(`${environment.apiUrl}/admin/criterios`, request);
  }

  actualizarCriterio(id: number, request: CriterioRequest): Observable<CriterioResponse> {
    return this.http.put<CriterioResponse>(`${environment.apiUrl}/admin/criterios/${id}`, request);
  }

  cambiarEstadoCriterio(id: number, request: CriterioEstadoRequest): Observable<CriterioResponse> {
    return this.http.patch<CriterioResponse>(`${environment.apiUrl}/admin/criterios/${id}/estado`, request);
  }

  // Moderacion Reseñas
  listarResenasPendientes(estado?: string): Observable<ModeracionResenaResponse[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<ModeracionResenaResponse[]>(`${environment.apiUrl}/admin/moderacion/resenas`, { params });
  }

  aprobarResena(id: number): Observable<ModeracionResenaResponse> {
    return this.http.post<ModeracionResenaResponse>(`${environment.apiUrl}/admin/moderacion/resenas/${id}/aprobar`, {});
  }

  rechazarResena(id: number, request: MotivoRechazoRequest): Observable<ModeracionResenaResponse> {
    return this.http.post<ModeracionResenaResponse>(`${environment.apiUrl}/admin/moderacion/resenas/${id}/rechazar`, request);
  }

  ocultarResena(id: number): Observable<ModeracionResenaResponse> {
    return this.http.post<ModeracionResenaResponse>(`${environment.apiUrl}/admin/moderacion/resenas/${id}/ocultar`, {});
  }

  // Moderacion Solicitudes
  listarSolicitudesPendientes(estado?: string): Observable<ModeracionSolicitudResponse[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<ModeracionSolicitudResponse[]>(`${environment.apiUrl}/admin/moderacion/solicitudes`, { params });
  }

  aprobarSolicitud(id: number, request: AprobarSolicitudRequest): Observable<ModeracionSolicitudResponse> {
    return this.http.post<ModeracionSolicitudResponse>(`${environment.apiUrl}/admin/moderacion/solicitudes/${id}/aprobar`, request);
  }

  rechazarSolicitud(id: number, request: RechazarSolicitudRequest): Observable<ModeracionSolicitudResponse> {
    return this.http.post<ModeracionSolicitudResponse>(`${environment.apiUrl}/admin/moderacion/solicitudes/${id}/rechazar`, request);
  }
}
