# Mapa de Integración Frontend - Backend

Este mapa detalla las pantallas del frontend, los servicios Angular asociados, los endpoints del backend que consumen, los métodos HTTP, y el estado de la integración.

| Pantalla Frontend | Servicio Angular | Endpoint Backend | Método | Request Payload | Response DTO | Estado |
|---|---|---|---|---|---|---|
| **Public Inicio** | `PublicService` | `/api/public/resenas` | `GET` | - | `Page<PublicResenaResponse>` | Integrado |
| | `PublicService` | `/api/public/carreras/activas` | `GET` | - | `List<CarreraResponse>` | Integrado |
| **Login** | `AuthService` | `/api/auth/login` | `POST` | `LoginRequest` | `AuthResponse` | Integrado |
| **Registro** | `AuthService` | `/api/auth/register` | `POST` | `RegisterRequest` | `AuthResponse` | Integrado |
| | `PublicService` | `/api/public/carreras/activas` | `GET` | - | `List<CarreraResponse>` | Integrado |
| **Estudiante Panel** | `StudentService` | `/api/estudiante/dashboard` | `GET` | - | `StudentDashboardResponse` | Integrado |
| **Estudiante Perfil** | `StudentService` | `/api/estudiante/perfil` | `GET` | - | `StudentProfileResponse` | Integrado |
| | `StudentService` | `/api/estudiante/perfil` | `PUT` | `StudentProfileUpdateRequest` | `StudentProfileResponse` | Integrado |
| | `AuthService` | `/api/auth/change-password` | `PUT` | `ChangePasswordRequest` | - | Integrado |
| **Escribir Reseña** | `PublicService` | `/api/public/criterios/activos` | `GET` | - | `List<CriterioResponse>` | Integrado |
| | `StudentService` | `/api/estudiante/curso-docente/activos` | `GET` | - | `List<ActiveCourseTeacherOptionResponse>` | Integrado |
| | `StudentService` | `/api/estudiante/resenas` | `POST` | `ResenaCreateRequest` | `ResenaResponse` | Integrado |
| **Reenviar Reseña** | `StudentService` | `/api/estudiante/resenas/mis-resenas/{id}` | `GET` | - | `ResenaResponse` | Integrado |
| | `StudentService` | `/api/estudiante/resenas` | `POST` | `ResenaCreateRequest` | `ResenaResponse` | Integrado |
| **Mis Reseñas** | `StudentService` | `/api/estudiante/resenas/mis-resenas` | `GET` | - | `Page<ResenaResponse>` | Integrado |
| **Nueva Solicitud** | `StudentService` | `/api/estudiante/solicitudes` | `POST` | `SolicitudCreateRequest` | `SolicitudResponse` | Integrado |
| | `PublicService` | `/api/public/carreras/activas` | `GET` | - | `List<CarreraResponse>` | Integrado |
| **Mis Solicitudes** | `StudentService` | `/api/estudiante/solicitudes/mis-solicitudes` | `GET` | - | `Page<SolicitudResponse>` | Integrado |
| **Admin Panel** | `AdminService` | `/api/admin/dashboard` | `GET` | - | `AdminDashboardResponse` | Integrado |
| **Admin Usuarios** | `AdminService` | `/api/admin/usuarios` | `GET` | - | `List<UsuarioResponse>` | Integrado |
| | `AdminService` | `/api/admin/usuarios` | `POST` | `UsuarioCreateRequest` | `UsuarioResponse` | Integrado |
| | `AdminService` | `/api/admin/usuarios/{id}` | `PUT` | `UsuarioUpdateRequest` | `UsuarioResponse` | Integrado |
| | `AdminService` | `/api/admin/usuarios/{id}/estado` | `PATCH` | `UsuarioEstadoRequest` | `UsuarioResponse` | Integrado |
| **Admin Carreras** | `AdminService` | `/api/admin/carreras` | `GET` | - | `List<CarreraResponse>` | Integrado |
| | `AdminService` | `/api/admin/carreras` | `POST` | `CarreraRequest` | `CarreraResponse` | Integrado |
| | `AdminService` | `/api/admin/carreras/{id}` | `PUT` | `CarreraRequest` | `CarreraResponse` | Integrado |
| | `AdminService` | `/api/admin/carreras/{id}` | `DELETE` | - | `CarreraResponse` | Integrado |
| **Admin Cursos** | `AdminService` | `/api/admin/cursos` | `GET` | - | `List<CursoResponse>` | Integrado |
| | `AdminService` | `/api/admin/cursos` | `POST` | `CursoCreateRequest` | `CursoResponse` | Integrado |
| | `AdminService` | `/api/admin/cursos/{id}` | `PUT` | `CursoCreateRequest` | `CursoResponse` | Integrado |
| | `AdminService` | `/api/admin/cursos/{id}` | `DELETE` | - | `CursoResponse` | Integrado |
| **Admin Docentes** | `AdminService` | `/api/admin/docentes` | `GET` | - | `List<DocenteResponse>` | Integrado |
| | `AdminService` | `/api/admin/docentes` | `POST` | `DocenteRequest` | `DocenteResponse` | Integrado |
| | `AdminService` | `/api/admin/docentes/{id}` | `PUT` | `DocenteRequest` | `DocenteResponse` | Integrado |
| | `AdminService` | `/api/admin/docentes/{id}` | `DELETE` | - | `DocenteResponse` | Integrado |
| **Admin Asignaciones**| `AdminService` | `/api/admin/curso-docente` | `GET` | - | `List<CursoDocenteResponse>` | Integrado |
| | `AdminService` | `/api/admin/curso-docente` | `POST` | `CursoDocenteRequest` | `CursoDocenteResponse` | Integrado |
| | `AdminService` | `/api/admin/curso-docente/{id}/estado` | `PATCH` | `CursoDocenteEstadoRequest` | `CursoDocenteResponse` | Integrado |
| **Admin Criterios** | `AdminService` | `/api/admin/criterios` | `GET` | - | `List<CriterioResponse>` | Integrado |
| | `AdminService` | `/api/admin/criterios` | `POST` | `CriterioRequest` | `CriterioResponse` | Integrado |
| | `AdminService` | `/api/admin/criterios/{id}` | `PUT` | `CriterioRequest` | `CriterioResponse` | Integrado |
| | `AdminService` | `/api/admin/criterios/{id}/estado` | `PATCH` | `CriterioEstadoRequest` | `CriterioResponse` | Integrado |
| **Cola Reseñas** | `AdminService` | `/api/admin/moderacion/resenas` | `GET` | - | `List<ModeracionResenaResponse>` | Integrado |
| | `AdminService` | `/api/admin/moderacion/resenas/{id}/aprobar` | `POST` | - | `ModeracionResenaResponse` | Integrado |
| | `AdminService` | `/api/admin/moderacion/resenas/{id}/rechazar` | `POST` | `MotivoRechazoRequest` | `ModeracionResenaResponse` | Integrado |
| | `AdminService` | `/api/admin/moderacion/resenas/{id}/ocultar` | `POST` | - | `ModeracionResenaResponse` | Integrado |
| **Cola Solicitudes** | `AdminService` | `/api/admin/moderacion/solicitudes` | `GET` | - | `List<ModeracionSolicitudResponse>` | Integrado |
| | `AdminService` | `/api/admin/moderacion/solicitudes/{id}/aprobar` | `POST` | `AprobarSolicitudRequest` | `ModeracionSolicitudResponse` | Integrado |
| | `AdminService` | `/api/admin/moderacion/solicitudes/{id}/rechazar` | `POST` | `RechazarSolicitudRequest` | `ModeracionSolicitudResponse` | Integrado |
