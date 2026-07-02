import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | undefined): { label: string; class: string } {
    if (!status) {
      return { label: 'Desconocido', class: 'badge-gray' };
    }

    const normalized = status.toUpperCase();

    switch (normalized) {
      // Reviews / Requests states
      case 'PENDIENTE':
        return { label: 'Pendiente', class: 'badge-warning' };
      case 'APROBADA':
      case 'APROBADO':
        return { label: 'Aprobado', class: 'badge-success' };
      case 'RECHAZADA':
      case 'RECHAZADO':
        return { label: 'Rechazado', class: 'badge-danger' };
      case 'OCULTA':
      case 'OCULTO':
        return { label: 'Oculto', class: 'badge-danger' };

      // Users / Catalogs states
      case 'ACTIVO':
      case 'ACTIVA':
        return { label: 'Activo', class: 'badge-success' };
      case 'INACTIVO':
      case 'INACTIVA':
        return { label: 'Inactivo', class: 'badge-gray' };
      case 'SUSPENDIDO':
        return { label: 'Suspendido', class: 'badge-danger' };

      // Course types
      case 'GENERAL':
        return { label: 'General', class: 'badge-info' };
      case 'CARRERA':
        return { label: 'De Carrera', class: 'badge-primary' };

      // Request types
      case 'CURSO_NUEVO':
        return { label: 'Curso Nuevo', class: 'badge-info' };
      case 'DOCENTE_NUEVO':
        return { label: 'Docente Nuevo', class: 'badge-primary' };
      case 'AMBOS':
        return { label: 'Curso y Docente', class: 'badge-purple' };

      default:
        return { label: status, class: 'badge-gray' };
    }
  }
}
