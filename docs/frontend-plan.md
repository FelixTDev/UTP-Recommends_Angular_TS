# Plan del Frontend Angular (UTP+Recommends)

Este documento detalla la planificación del diseño, los módulos, componentes, servicios y la arquitectura general del frontend.

## Módulos Detectados y Estructura

La aplicación se construirá utilizando **standalone components** en Angular, organizados de forma modular lógica para permitir una carga perezosa (lazy loading):

1. **Módulo Auth (Autenticación)**
   - **Pantallas**: Login, Registro.
   - **Servicios**: `AuthService`, `StorageService`.
   - **Modelos**: `LoginRequest`, `RegisterRequest`, `AuthResponse`, `CurrentUserResponse`.
   - **Rutas**: `/auth/login`, `/auth/registro`.
2. **Módulo Público**
   - **Pantallas**: Inicio (Buscador general, detalles de curso o curso-docente, listado público de reseñas promediadas por criterio).
   - **Servicios**: `PublicService`.
   - **Modelos**: `PublicResenaResponse`, `PromedioCriterioResponse`, `CarreraResponse`, `CriterioResponse`.
   - **Rutas**: `/public/inicio`.
3. **Módulo Estudiante**
   - **Pantallas**: Dashboard (Estadísticas y actividad reciente), Perfil (Edición de datos personales, cambio de contraseña), Nueva Reseña (Formulario dinámico con calificaciones por criterio y opción de reenvío), Mis Reseñas (Cola personal con badges), Nueva Solicitud, Mis Solicitudes.
   - **Servicios**: `StudentService`, `PublicService` (para catálogos activos).
   - **Modelos**: `StudentDashboardResponse`, `StudentProfileResponse`, `ResenaCreateRequest`, `ResenaResponse`, `SolicitudCreateRequest`, `SolicitudResponse`.
   - **Rutas**: `/estudiante/*` (bajo `/estudiante/inicio`, `/estudiante/perfil`, `/estudiante/resenas/nueva`, `/estudiante/resenas/mis-resenas`, `/estudiante/solicitudes/nueva`, `/estudiante/solicitudes/mis-solicitudes`).
4. **Módulo Administrador**
   - **Pantallas**: Dashboard de Métricas, CRUD de Usuarios, CRUD de Carreras, CRUD de Cursos, CRUD de Docentes, Asignaciones de Cursos-Docentes, CRUD de Criterios, Cola de Moderación de Reseñas, Cola de Moderación de Solicitudes (Aprobación con cascada).
   - **Servicios**: `AdminService`.
   - **Modelos**: `AdminDashboardResponse`, `UsuarioResponse`, `CarreraResponse`, `CursoResponse`, `DocenteResponse`, `CursoDocenteResponse`, `CriterioResponse`, `ModeracionResenaResponse`, `ModeracionSolicitudResponse`.
   - **Rutas**: `/admin/*` (bajo `/admin/inicio`, `/admin/usuarios`, `/admin/carreras`, `/admin/cursos`, `/admin/docentes`, `/admin/curso-docente`, `/admin/criterios`, `/admin/moderacion/resenas`, `/admin/moderacion/solicitudes`).

## Guards e Interceptores

- **`AuthGuard`**: Verifica si el token existe y es válido. Si no, redirige a `/auth/login`.
- **`RoleGuard`**: Valida que el rol decodificado del token coincida con el requerido por la ruta (`ADMIN` o `ESTUDIANTE`). Redirige a `/public/inicio` en caso de denegación.
- **`AuthInterceptor`**: Agrega de forma transparente la cabecera `Authorization: Bearer <token>` a todas las peticiones, excluyendo `/api/auth/login` y `/api/auth/register`.
- **`ErrorInterceptor`**: Captura errores HTTP centralizados:
  - **401 (Unauthorized)**: Borra la sesión local y redirige a login con un mensaje descriptivo.
  - **403 (Forbidden)**: Muestra una vista o diálogo de Acceso Denegado.
  - **400/409/500**: Lanza notificaciones tipo toast/snackbar con los mensajes de error devueltos por el backend.

## Estrategia Visual

Utilizaremos **Angular Material** combinado con **SCSS** customizado para lograr una estética moderna y premium:
- **Tema Curado**: Paleta de colores basada en tonos azul profundo (UTP style) con acentos dorados y esmeraldas para botones primarios y estados de éxito.
- **Estilos Globales**: Estilo general limpio, con bordes redondeados suaves, sombras sutiles y transiciones hover fluidas.
- **Sidebars & Headers**: Menú colapsable responsivo, con perfiles de usuario accesibles y transiciones suaves para móvil.
- **Tablas Premium**: `mat-table` estilizada con scroll horizontal en móvil, ordenamiento dinámico y paginación.
- **Indicadores de Carga**: Skeletons y spinners integrados a un estado global para evitar pantallas en blanco intermitentes.

## Riesgos y Brechas del Backend

- **Inconsistencia de Tipos en BD**: La tabla `resena_calificacion.puntaje` está mapeada como `Integer` en Hibernate pero en MySQL es `tinyint`. El frontend manejará números enteros en el rango `[1, 5]`, previniendo desbordamientos.
- **Cursos Generales sin Carrera**: La restricción única de nombres de cursos generales debe ser controlada de antemano. El frontend validará unicidad a nivel de formulario cuando sea posible (o informará el error 409 arrojado por el backend).
