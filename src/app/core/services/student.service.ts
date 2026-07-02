import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  StudentDashboardResponse, 
  StudentProfileResponse, 
  StudentProfileUpdateRequest,
  ActiveCourseTeacherOptionResponse,
  ResenaCreateRequest,
  ResenaResponse,
  SolicitudCreateRequest,
  SolicitudResponse
} from '../models/student.models';
import { PageResponse } from '../models/public.models';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<StudentDashboardResponse> {
    return this.http.get<StudentDashboardResponse>(`${environment.apiUrl}/estudiante/dashboard`);
  }

  getProfile(): Observable<StudentProfileResponse> {
    return this.http.get<StudentProfileResponse>(`${environment.apiUrl}/estudiante/perfil`);
  }

  updateProfile(request: StudentProfileUpdateRequest): Observable<StudentProfileResponse> {
    return this.http.put<StudentProfileResponse>(`${environment.apiUrl}/estudiante/perfil`, request);
  }

  // Active courses-teachers options autocomplete
  buscarCursoDocenteActivos(
    texto?: string, 
    carreraId?: number, 
    cursoId?: number, 
    docenteId?: number
  ): Observable<ActiveCourseTeacherOptionResponse[]> {
    let params = new HttpParams();
    if (texto) params = params.set('texto', texto);
    if (carreraId) params = params.set('carreraId', carreraId.toString());
    if (cursoId) params = params.set('cursoId', cursoId.toString());
    if (docenteId) params = params.set('docenteId', docenteId.toString());

    return this.http.get<ActiveCourseTeacherOptionResponse[]>(
      `${environment.apiUrl}/estudiante/curso-docente/activos`, 
      { params }
    );
  }

  crearResena(request: ResenaCreateRequest): Observable<ResenaResponse> {
    return this.http.post<ResenaResponse>(`${environment.apiUrl}/estudiante/resenas`, request);
  }

  listarMisResenas(page = 0, size = 10, sort = 'fechaCreacion,desc'): Observable<PageResponse<ResenaResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PageResponse<ResenaResponse>>(`${environment.apiUrl}/estudiante/resenas/mis-resenas`, { params });
  }

  obtenerMiResena(id: number): Observable<ResenaResponse> {
    return this.http.get<ResenaResponse>(`${environment.apiUrl}/estudiante/resenas/mis-resenas/${id}`);
  }

  crearSolicitud(request: SolicitudCreateRequest): Observable<SolicitudResponse> {
    return this.http.post<SolicitudResponse>(`${environment.apiUrl}/estudiante/solicitudes`, request);
  }

  listarMisSolicitudes(page = 0, size = 10, sort = 'fechaCreacion,desc'): Observable<PageResponse<SolicitudResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PageResponse<SolicitudResponse>>(`${environment.apiUrl}/estudiante/solicitudes/mis-solicitudes`, { params });
  }

  obtenerMiSolicitud(id: number): Observable<SolicitudResponse> {
    return this.http.get<SolicitudResponse>(`${environment.apiUrl}/estudiante/solicitudes/mis-solicitudes/${id}`);
  }
}
