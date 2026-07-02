export interface PublicResenaCalificacionResponse {
  criterio: string;
  puntaje: number;
}

export interface PublicResenaResponse {
  id: number;
  curso: string;
  docente: string;
  comentario: string;
  esAnonimo: boolean;
  nombreEstudianteVisible?: string;
  fechaCreacion: string;
  calificaciones: PublicResenaCalificacionResponse[];
}

export interface PromedioCriterioResponse {
  criterio: string;
  promedio: number;
}

// Spring Page interface for tables and pagination
export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface FieldValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: FieldValidationError[];
}
