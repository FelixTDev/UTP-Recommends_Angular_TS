import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicResenaResponse, PromedioCriterioResponse, PageResponse } from '../models/public.models';
import { CarreraResponse, CriterioResponse } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private readonly http = inject(HttpClient);

  // List all approved reviews with optional filters (cursoId, cursoDocenteId) and pagination
  listarResenas(cursoId?: number, cursoDocenteId?: number, page = 0, size = 10, sort = 'fechaCreacion,desc'): Observable<PageResponse<PublicResenaResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (cursoId) {
      params = params.set('cursoId', cursoId.toString());
    }
    if (cursoDocenteId) {
      params = params.set('cursoDocenteId', cursoDocenteId.toString());
    }

    return this.http.get<PageResponse<PublicResenaResponse>>(`${environment.apiUrl}/public/resenas`, { params });
  }

  // Get active reviews averages for a specific teacher-course
  obtenerPromedios(cursoDocenteId: number): Observable<PromedioCriterioResponse[]> {
    return this.http.get<PromedioCriterioResponse[]>(`${environment.apiUrl}/public/resenas/promedios/curso-docente/${cursoDocenteId}`);
  }

  // Get active carreras catalog
  listarCarrerasActivas(): Observable<CarreraResponse[]> {
    return this.http.get<CarreraResponse[]>(`${environment.apiUrl}/public/carreras/activas`);
  }

  // Get active criteria catalog
  listarCriteriosActivos(): Observable<CriterioResponse[]> {
    return this.http.get<CriterioResponse[]>(`${environment.apiUrl}/public/criterios/activos`);
  }
}
