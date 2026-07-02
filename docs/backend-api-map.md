# Mapa de APIs del Backend

Esta es la matriz que detalla los módulos, endpoints, métodos, roles requeridos, DTOs de entrada y salida, reglas de validación y la pantalla correspondiente en el frontend.

| Módulo | Endpoint | Método | Rol Requerido | Request DTO | Response DTO | Validaciones | Pantalla Frontend Asociada |
|---|---|---|---|---|---|---|---|
| **AUTH** | `/api/auth/register` | `POST` | Público | `RegisterRequest` | `AuthResponse` | `email` (U + 8 dígitos + `@utp.edu.pe`), `password` (fuerte), `nombres`/`apellidos` (letras/espacios, 2-100), `carreraId` (not null) | Registro (`/auth/registro`) |
| **AUTH** | `/api/auth/login` | `POST` | Público | `LoginRequest` | `AuthResponse` | `email` (válido), `password` (not blank) | Login (`/auth/login`) |
| **AUTH** | `/api/auth/me` | `GET` | Autenticado (Cualquiera) | - | `CurrentUserResponse` | - | Layout / Info Perfil |
| **AUTH** | `/api/auth/change-password` | `PUT` | Autenticado (Cualquiera) | `ChangePasswordRequest` | - (204) | `currentPassword` (not blank), `newPassword` (not blank) | Perfil / Cambiar Contraseña (`/estudiante/perfil`) |
| **PÚBLICO** | `/api/public/resenas` | `GET` | Público | (Query params: `cursoId`, `cursoDocenteId`, pageable) | `Page<PublicResenaResponse>` | - | Inicio Público / Búsqueda (`/public/inicio`) |
| **PÚBLICO** | `/api/public/resenas/curso-docente/{cursoDocenteId}` | `GET` | Público | (Path param, pageable) | `Page<PublicResenaResponse>` | - | Detalle Curso-Docente (`/public/inicio`) |
| **PÚBLICO** | `/api/public/resenas/curso/{cursoId}` | `GET` | Público | (Path param, pageable) | `Page<PublicResenaResponse>` | - | Detalle Curso (`/public/inicio`) |
| **PÚBLICO** | `/api/public/resenas/promedios/curso-docente/{cursoDocenteId}` | `GET` | Público | (Path param) | `List<PromedioCriterioResponse>` | - | Visualización de Promedios en Reseñas |
| **PÚBLICO** | `/api/public/carreras/activas` | `GET` | Público | - | `List<CarreraResponse>` | - | Selectores en Registro / Filtros |
| **PÚBLICO** | `/api/public/criterios/activos` | `GET` | Público | - | `List<CriterioResponse>` | - | Formulario Reseña / Calificaciones |
| **ESTUDIANTE** | `/api/estudiante/resenas` | `POST` | `ESTUDIANTE` | `ResenaCreateRequest` | `ResenaResponse` | `cursoDocenteId` (not null), `comentario` (not blank), `calificaciones` (no vacía, puntaje 1-5 por criterio activo) | Escribir / Reenviar Reseña (`/estudiante/resenas/nueva`) |
| **ESTUDIANTE** | `/api/estudiante/resenas/mis-resenas` | `GET` | `ESTUDIANTE` | (Query params: pageable) | `Page<ResenaResponse>` | - | Mis Reseñas (`/estudiante/resenas/mis-resenas`) |
| **ESTUDIANTE** | `/api/estudiante/resenas/mis-resenas/{id}` | `GET` | `ESTUDIANTE` | (Path param) | `ResenaResponse` | - | Detalle / Reenvío Reseña |
| **ESTUDIANTE** | `/api/estudiante/solicitudes` | `POST` | `ESTUDIANTE` | `SolicitudCreateRequest` | `SolicitudResponse` | `tipo` (not null), `comentario` (not blank). Condicionales: `nombreCursoSugerido` si tipo incluye CURSO; `nombreDocenteSugerido` si tipo incluye DOCENTE. | Nueva Solicitud (`/estudiante/solicitudes/nueva`) |
| **ESTUDIANTE** | `/api/estudiante/solicitudes/mis-solicitudes` | `GET` | `ESTUDIANTE` | (Query params: pageable) | `Page<SolicitudResponse>` | - | Mis Solicitudes (`/estudiante/solicitudes/mis-solicitudes`) |
| **ESTUDIANTE** | `/api/estudiante/solicitudes/mis-solicitudes/{id}` | `GET` | `ESTUDIANTE` | (Path param) | `SolicitudResponse` | - | Detalle Solicitud |
| **ESTUDIANTE** | `/api/estudiante/perfil` | `GET` | `ESTUDIANTE` | - | `StudentProfileResponse` | - | Perfil (`/estudiante/perfil`) |
| **ESTUDIANTE** | `/api/estudiante/perfil` | `PUT` | `ESTUDIANTE` | `StudentProfileUpdateRequest` | `StudentProfileResponse` | `nombres` (letras, 2-100), `apellidos` (letras, 2-100) | Editar Perfil (`/estudiante/perfil`) |
| **ESTUDIANTE** | `/api/estudiante/dashboard` | `GET` | `ESTUDIANTE` | - | `StudentDashboardResponse` | - | Dashboard Estudiante (`/estudiante/inicio`) |
| **ESTUDIANTE** | `/api/estudiante/curso-docente/activos` | `GET` | `ESTUDIANTE` | (Query params: `texto`, `carreraId`, `cursoId`, `docenteId`) | `List<ActiveCourseTeacherOptionResponse>` | - | Buscador / Autocomplete de Curso-Docente |
| **ADMIN** | `/api/admin/dashboard` | `GET` | `ADMIN` | - | `AdminDashboardResponse` | - | Dashboard Admin (`/admin/inicio`) |
| **ADMIN** | `/api/admin/usuarios` | `POST` | `ADMIN` | `UsuarioCreateRequest` | `UsuarioResponse` | `email` (válido), `password` (fuerte), `nombres`/`apellidos` (letras), `rol` (not null) | Registrar Usuario (`/admin/usuarios`) |
| **ADMIN** | `/api/admin/usuarios` | `GET` | `ADMIN` | (Query params: `rol`, `estado`) | `List<UsuarioResponse>` | - | Listado Usuarios (`/admin/usuarios`) |
| **ADMIN** | `/api/admin/usuarios/{id}` | `GET` | `ADMIN` | (Path param) | `UsuarioResponse` | - | Ver Usuario |
| **ADMIN** | `/api/admin/usuarios/{id}` | `PUT` | `ADMIN` | `UsuarioUpdateRequest` | `UsuarioResponse` | `email` (válido), `nombres`/`apellidos` (letras) | Editar Usuario (`/admin/usuarios`) |
| **ADMIN** | `/api/admin/usuarios/{id}/estado` | `PATCH` | `ADMIN` | `UsuarioEstadoRequest` | `UsuarioResponse` | `estado` (not null) | Gestión de Estado (Activar/Suspender) |
| **ADMIN** | `/api/admin/carreras` | `POST` | `ADMIN` | `CarreraRequest` | `CarreraResponse` | `nombre` (not blank) | Crear Carrera (`/admin/carreras`) |
| **ADMIN** | `/api/admin/carreras` | `GET` | `ADMIN` | - | `List<CarreraResponse>` | - | Listado Carreras (`/admin/carreras`) |
| **ADMIN** | `/api/admin/carreras/{id}` | `PUT` | `ADMIN` | `CarreraRequest` | `CarreraResponse` | `nombre` (not blank) | Editar Carrera (`/admin/carreras`) |
| **ADMIN** | `/api/admin/carreras/{id}` | `DELETE` | `ADMIN` | (Path param) | `CarreraResponse` | - | Inactivar Carrera (Soft-delete) |
| **ADMIN** | `/api/admin/cursos` | `POST` | `ADMIN` | `CursoCreateRequest` | `CursoResponse` | `nombre` (not blank), `tipo` (not null) | Crear Curso (`/admin/cursos`) |
| **ADMIN** | `/api/admin/cursos` | `GET` | `ADMIN` | - | `List<CursoResponse>` | - | Listado Cursos (`/admin/cursos`) |
| **ADMIN** | `/api/admin/cursos/{id}` | `PUT` | `ADMIN` | `CursoCreateRequest` | `CursoResponse` | `nombre` (not blank), `tipo` (not null) | Editar Curso (`/admin/cursos`) |
| **ADMIN** | `/api/admin/cursos/{id}` | `DELETE` | `ADMIN` | (Path param) | `CursoResponse` | - | Inactivar Curso (Soft-delete) |
| **ADMIN** | `/api/admin/docentes` | `POST` | `ADMIN` | `DocenteRequest` | `DocenteResponse` | `nombres`/`apellidos` (letras), `email` (opcional) | Crear Docente (`/admin/docentes`) |
| **ADMIN** | `/api/admin/docentes` | `GET` | `ADMIN` | - | `List<DocenteResponse>` | - | Listado Docentes (`/admin/docentes`) |
| **ADMIN** | `/api/admin/docentes/{id}` | `PUT` | `ADMIN` | `DocenteRequest` | `DocenteResponse` | `nombres`/`apellidos` (letras) | Editar Docente (`/admin/docentes`) |
| **ADMIN** | `/api/admin/docentes/{id}` | `DELETE` | `ADMIN` | (Path param) | `DocenteResponse` | - | Inactivar Docente (Soft-delete) |
| **ADMIN** | `/api/admin/curso-docente` | `POST` | `ADMIN` | `CursoDocenteRequest` | `CursoDocenteResponse` | `cursoId` (not null), `docenteId` (not null) | Crear Asignación (`/admin/curso-docente`) |
| **ADMIN** | `/api/admin/curso-docente` | `GET` | `ADMIN` | - | `List<CursoDocenteResponse>` | - | Listado Asignaciones (`/admin/curso-docente`) |
| **ADMIN** | `/api/admin/cursos/{cursoId}/docentes` | `GET` | `ADMIN` | (Path param) | `List<CursoDocenteResponse>` | - | Ver Docentes de un Curso |
| **ADMIN** | `/api/admin/docentes/{docenteId}/cursos` | `GET` | `ADMIN` | (Path param) | `List<CursoDocenteResponse>` | - | Ver Cursos de un Docente |
| **ADMIN** | `/api/admin/curso-docente/{id}/estado` | `PATCH` | `ADMIN` | `CursoDocenteEstadoRequest` | `CursoDocenteResponse` | `estado` (not null) | Cambiar Estado Asignación |
| **ADMIN** | `/api/admin/criterios` | `POST` | `ADMIN` | `CriterioRequest` | `CriterioResponse` | `nombre` (not blank) | Crear Criterio (`/admin/criterios`) |
| **ADMIN** | `/api/admin/criterios` | `GET` | `ADMIN` | - | `List<CriterioResponse>` | - | Listado Criterios (`/admin/criterios`) |
| **ADMIN** | `/api/admin/criterios/{id}` | `PUT` | `ADMIN` | `CriterioRequest` | `CriterioResponse` | `nombre` (not blank) | Editar Criterio (`/admin/criterios`) |
| **ADMIN** | `/api/admin/criterios/{id}/estado` | `PATCH` | `ADMIN` | `CriterioEstadoRequest` | `CriterioResponse` | `estado` (not null) | Cambiar Estado Criterio |
| **ADMIN** | `/api/admin/moderacion/resenas` | `GET` | `ADMIN` | (Query params: `estado`) | `List<ModeracionResenaResponse>` | - | Moderación de Reseñas (`/admin/moderacion/resenas`) |
| **ADMIN** | `/api/admin/moderacion/resenas/{id}/aprobar` | `POST` | `ADMIN` | - | `ModeracionResenaResponse` | - | Aprobación en Cola |
| **ADMIN** | `/api/admin/moderacion/resenas/{id}/rechazar` | `POST` | `ADMIN` | `MotivoRechazoRequest` | `ModeracionResenaResponse` | `motivoRechazo` (not blank) | Rechazo con Motivo en Cola |
| **ADMIN** | `/api/admin/moderacion/resenas/{id}/ocultar` | `POST` | `ADMIN` | - | `ModeracionResenaResponse` | - | Ocultar Reseña Aprobada |
| **ADMIN** | `/api/admin/moderacion/solicitudes` | `GET` | `ADMIN` | (Query params: `estado`) | `List<ModeracionSolicitudResponse>` | - | Moderación de Solicitudes (`/admin/moderacion/solicitudes`) |
| **ADMIN** | `/api/admin/moderacion/solicitudes/{id}/aprobar` | `POST` | `ADMIN` | `AprobarSolicitudRequest` | `ModeracionSolicitudResponse` | `tipoCurso` (if new course), `calificaciones` (not empty, ratings 1-5) | Aprobación en Cascada en Cola |
| **ADMIN** | `/api/admin/moderacion/solicitudes/{id}/rechazar` | `POST` | `ADMIN` | `RechazarSolicitudRequest` | `ModeracionSolicitudResponse` | `motivoRechazo` (not blank) | Rechazo con Motivo en Cola |
