# Reporte de Auditoría E2E y Casos de Uso

Este reporte detalla la validación funcional, el alcance del frontend y los casos de uso implementados para garantizar la integridad E2E.

## 1. Alcance de los Casos de Uso Auditados

### Módulo de Autenticación (Público)
- **Login**: Validación de obligatoriedad, formato de correo, visualización de spinners durante la carga y almacenamiento seguro del token JWT en `localStorage`. Redirección automática según el rol decodificado.
- **Registro**: Validación estricta del formato de correo institucional (`^U[0-9]{8}@utp\.edu\.pe$`) para estudiantes, requerimientos de nombres y apellidos (solo letras, 2-100 caracteres) y fortaleza de la contraseña. Selector de carrera consumiendo catálogos dinámicos.

### Módulo de Estudiante (Privado - ESTUDIANTE)
- **Dashboard**: Consumo de métricas agregadas (reseñas totales, aprobadas, pendientes y rechazadas) y renderizado de la actividad reciente (reseñas y solicitudes) con badges de colores según su estado.
- **Mi Perfil**: Actualización de nombres y apellidos y cambio de contraseña con indicador de validaciones.
- **Nueva Reseña**: Autocomplete dinámico sobre asignaciones curso-docente activas. Carga dinámica de criterios de calificación activos desde el catálogo público.
- **Mis Reseñas**: Visualización de reseñas individuales, promedios e historial de calificaciones. Si la reseña está en estado `RECHAZADA`, se muestra el motivo detallado y un botón para precargar el formulario, corregirlo y reenviarlo.
- **Nueva Solicitud**: Formulario reactivo con toggle dinámico de validaciones según el tipo de sugerencia (Curso, Docente o Ambos).

### Módulo de Administrador (Privado - ADMIN)
- **Dashboard General**: Métricas en tiempo real de colas pendientes, usuarios, cursos, docentes y criterios activos.
- **CRUD de Catálogos**:
  - **Usuarios**: Gestión completa con cambio de estado (`ACTIVO`, `INACTIVO`, `SUSPENDIDO`).
  - **Carreras / Cursos / Docentes**: Creación y edición con soft-delete incorporado para conservar historial relacional en base de datos.
  - **Asignaciones Curso-Docente**: Creación de pairings y toggle de disponibilidad.
  - **Criterios**: Gestión de criterios activos/inactivos para evaluaciones estudiantiles.
- **Cola de Moderación de Reseñas**: Lista de reseñas pendientes de auditar. Aprobación inmediata y rechazo forzando un motivo textual obligatorio. Opción de ocultar reseñas ya aprobadas.
- **Cola de Moderación de Solicitudes**: Aprobación en cascada forzando la creación de entidades, enlace a registros existentes y entrada manual de calificaciones iniciales por criterio activo para publicar la primera reseña aprobada del estudiante.

## 2. Gestión de Estados Visuales de Interfaz

Cada componente contempla los siguientes estados:
- **Carga (Loading)**: Skeletons animados (`LoadingSkeletonComponent`) y spinners en botones de acción.
- **Vacío (Empty State)**: Componente gráfico (`EmptyStateComponent`) con ilustraciones vectoriales de fuente y botones para iniciar la acción principal.
- **Error**: Manejo mediante `ErrorInterceptor` que traduce las excepciones personalizadas del backend Spring Boot y las muestra mediante toasts no intrusivos (`MatSnackBar`).
- **Seguridad**: Guards de rol (`RoleGuard`) que previenen que estudiantes accedan a secciones administrativas, interceptando intentos a nivel de ruta y forzando redirecciones controladas.
- **Responsive**: Layouts diseñados bajo una arquitectura flexible mediante clases de Bootstrap y scroll horizontal en tablas.
