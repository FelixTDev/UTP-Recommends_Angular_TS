import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UiService } from '../services/ui.service';
import { ApiErrorResponse } from '../models/public.models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const uiService = inject(UiService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Error de red: ${error.error.message}`;
      } else {
        // Backend error
        const apiError = error.error as ApiErrorResponse;
        
        if (apiError && apiError.message) {
          errorMessage = apiError.message;
          // If there are field errors, append them or format them nicely
          if (apiError.fieldErrors && apiError.fieldErrors.length > 0) {
            const details = apiError.fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `${apiError.message} (${details})`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Handle specific status codes
        switch (error.status) {
          case 401:
            // Session expired or unauthorized
            uiService.showError('Sesión expirada o no autorizada. Redirigiendo...');
            authService.logout();
            break;
          case 403:
            // Forbidden access
            uiService.showError('Acceso denegado. No tienes permisos para realizar esta acción.');
            break;
          case 409:
            // Conflict (e.g. review already exists, duplicate name)
            uiService.showError(errorMessage || 'Ya existe un registro con estos datos o conflicto en base de datos.');
            break;
          default:
            uiService.showError(errorMessage);
            break;
        }
      }

      return throwError(() => error);
    })
  );
};
