# UTP+Recommends Frontend

Frontend Angular para UTP+Recommends. Este proyecto implementa vistas publicas, autenticacion, paneles por rol, formularios con validacion, proteccion de rutas y consumo de API REST del backend Spring Boot.

Este `README` esta redactado para servir como documentacion tecnica del avance y como sustento frente a la rubrica de Avance de Proyecto Final 03.

## 1. Objetivo del avance

El frontend cubre estos objetivos principales:

- construir una SPA en Angular organizada por componentes y dominios;
- implementar navegacion por rutas publicas, de estudiante y de administrador;
- validar formularios en cliente y mostrar retroalimentacion al usuario;
- consumir el backend REST del proyecto;
- manejar autenticacion, autorizacion y proteccion de vistas;
- documentar la ejecucion y la integracion con el backend.

## 2. Tecnologias usadas

- Angular 20
- TypeScript
- Angular Router
- Angular HttpClient
- Angular Reactive Forms
- RxJS
- Angular Material / CDK
- Bootstrap 5
- Bootstrap Icons
- SCSS
- Karma / Jasmine

## 3. Estructura del front-end en Angular

El proyecto sigue una organizacion por dominios y capas UI bajo `src/app`:

- `features`: pantallas principales agrupadas por funcionalidad.
- `core`: servicios, autenticacion, guards, interceptores y modelos compartidos.
- `layout`: shell general de la aplicacion para vistas autenticadas.
- `shared`: componentes reutilizables, pipes y utilidades visuales.

Organizacion funcional:

- `features/public`: buscador y vistas abiertas al usuario no autenticado.
- `features/auth`: login y registro.
- `features/student`: dashboard, perfil, resenas y solicitudes del estudiante.
- `features/admin`: dashboard, catalogos y moderacion del administrador.

## 4. Requisitos previos

- Node.js 20 o superior recomendado
- npm instalado
- Angular CLI disponible a traves de dependencias del proyecto
- Backend Spring Boot ejecutandose en `http://localhost:8080`

## 5. Instalacion

Desde la carpeta del frontend:

```powershell
npm install
```

## 6. Configuracion de entorno

Archivo de entorno actual:

- `src/environments/environment.ts`

Configuracion actual de API:

```ts
apiUrl: 'http://localhost:8080/api'
```

Esto significa que el frontend espera que el backend este levantado localmente en el puerto `8080`.

## 7. Como ejecutar el frontend

### 7.1. Desarrollo

```powershell
npm start
```

o equivalentemente:

```powershell
ng serve
```

URL esperada:

- `http://localhost:4200`

### 7.2. Build

```powershell
npm run build
```

### 7.3. Pruebas

```powershell
npm test
```

## 8. Navegacion y rutas implementadas

La aplicacion usa Angular Router y define rutas publicas y protegidas.

### 8.1. Rutas publicas

- `/public/inicio`
- `/auth/login`
- `/auth/registro`

### 8.2. Rutas de estudiante

Protegidas por:

- `authGuard`
- `roleGuard` con rol `ESTUDIANTE`

Rutas:

- `/estudiante/inicio`
- `/estudiante/perfil`
- `/estudiante/resenas/nueva`
- `/estudiante/resenas/mis-resenas`
- `/estudiante/solicitudes/nueva`
- `/estudiante/solicitudes/mis-solicitudes`

### 8.3. Rutas de administrador

Protegidas por:

- `authGuard`
- `roleGuard` con rol `ADMIN`

Rutas:

- `/admin/inicio`
- `/admin/usuarios`
- `/admin/carreras`
- `/admin/cursos`
- `/admin/docentes`
- `/admin/curso-docente`
- `/admin/criterios`
- `/admin/moderacion/resenas`
- `/admin/moderacion/solicitudes`

### 8.4. Redirecciones

- ruta vacia redirige a `/public/inicio`
- rutas desconocidas redirigen a `/public/inicio`

## 9. Comunicacion entre componentes

La comunicacion se apoya en:

- `@Input` y `@Output` en componentes reutilizables;
- servicios inyectados para acceso a datos;
- señales (`signal`) para estado reactivo en componentes;
- Angular Router para transiciones entre vistas;
- `AppShellComponent` como contenedor de vistas autenticadas.

Ejemplos:

- los dashboards consumen servicios para poblar tarjetas y tablas;
- formularios de resenas y solicitudes coordinan busquedas, validaciones y envios;
- la navegacion lateral cambia segun el rol autenticado;
- la sesion actual se comparte desde `AuthService`.

## 10. Formularios, validacion y manejo de errores

El proyecto usa `ReactiveFormsModule` y validaciones del lado del cliente.

Formularios implementados:

- login
- registro
- perfil estudiante
- nueva resena
- nueva solicitud
- formularios CRUD de admin

Validaciones presentes:

- campos requeridos;
- patrones para correo institucional;
- validacion de password;
- longitud minima de comentarios;
- validaciones para nombres y apellidos;
- validacion de seleccion de curso-docente;
- validacion de campos obligatorios segun flujo.

Retroalimentacion visual:

- mensajes `invalid-feedback`;
- estados de carga;
- alertas y mensajes desde `UiService`;
- manejo centralizado de errores HTTP.

## 11. Consumo de API REST e integracion con el backend

El consumo REST se implementa con `HttpClient` y servicios por dominio:

- `AuthService`
- `PublicService`
- `StudentService`
- `AdminService`

Flujos integrados con el backend:

- login y registro;
- obtencion de usuario autenticado;
- carga de carreras y criterios activos;
- dashboard del estudiante;
- dashboard del administrador;
- CRUD de usuarios, carreras, cursos, docentes, criterios y curso-docente;
- creacion y listado de resenas;
- creacion y listado de solicitudes;
- moderacion administrativa;
- listados publicos y promedios.

La aplicacion trabaja contra el backend Spring Boot del proyecto `UTP-Recommends_SpringBoot`.

## 12. Autenticacion y autorizacion en front-end

El sistema implementa autenticacion y proteccion de vistas con:

- `AuthService`
- `StorageService`
- `authGuard`
- `roleGuard`
- `authInterceptor`
- `errorInterceptor`

Flujo implementado:

1. el usuario inicia sesion o se registra;
2. el backend devuelve un JWT;
3. el token se guarda localmente;
4. `authInterceptor` agrega `Authorization: Bearer <token>` en requests protegidas;
5. `authGuard` valida sesion antes de navegar;
6. `roleGuard` restringe acceso segun rol;
7. `errorInterceptor` maneja errores 401, 403, 409 y otros mensajes del backend.

Proteccion de vistas:

- las vistas de estudiante no son accesibles por administrador;
- las vistas de administrador no son accesibles por estudiante;
- si el token expira o es invalido, el usuario es deslogueado.

## 13. Componentes y pantallas relevantes para sustento

### 13.1. Publicas

- pagina de inicio publica
- buscador de resenas
- filtros de carrera y curso-docente

### 13.2. Autenticacion

- login
- registro

### 13.3. Estudiante

- panel principal
- perfil
- escribir resena
- mis resenas
- nueva solicitud
- mis solicitudes

### 13.4. Administrador

- dashboard
- usuarios
- carreras
- cursos
- docentes
- curso-docente
- criterios
- moderacion de resenas
- moderacion de solicitudes

## 14. Scripts utiles

```powershell
npm install
npm start
npm run build
npm test
```

## 15. Integracion esperada con el backend

Para demostrar correctamente el avance:

1. levantar primero el backend en `http://localhost:8080`;
2. verificar que el frontend apunte a `http://localhost:8080/api`;
3. levantar luego Angular en `http://localhost:4200`;
4. probar rutas publicas;
5. probar login y redireccion por rol;
6. probar formularios y consumo de datos reales;
7. probar proteccion de vistas y respuestas de error.

## 16. Evidencias sugeridas para la rubrica APF3

Para sustentar el avance, conviene mostrar:

- estructura del proyecto Angular en carpetas;
- navegacion funcional entre vistas publicas, estudiante y admin;
- formulario de login y registro con validaciones visibles;
- formularios de resena o solicitud con validaciones y mensajes;
- consumo correcto de datos desde el backend;
- evidencia de dashboards cargando informacion real;
- evidencia de token almacenado y enviado en requests protegidas;
- evidencia de rutas protegidas por rol;
- evidencia de mensajes ante errores 401, 403 o conflictos;
- build o prueba basica ejecutada.

## 17. Relacion con la rubrica de Avance Proyecto Final 03

Este frontend documenta evidencia para los criterios:

- estructura del front-end en Angular:
  - organizacion por `features`, `core`, `layout` y `shared`;
  - componentes standalone;
  - estilos aplicados con enfoque coherente.
- navegacion y comunicacion entre componentes:
  - rutas publicas y protegidas;
  - shell autenticado;
  - servicios y estado compartido.
- formularios, validacion y manejo de errores:
  - formularios reactivos;
  - validaciones de cliente;
  - feedback visual y manejo centralizado de errores.
- consumo de API REST e integracion con back-end:
  - servicios HTTP por dominio;
  - integracion con autenticacion, dashboards, CRUD y moderacion.
- autorizacion/autenticacion en front-end y documentacion:
  - guards por autenticacion y rol;
  - interceptores para token y errores;
  - README tecnico con instrucciones de ejecucion y evidencias.

## 18. Observaciones finales

Este frontend fue pensado para trabajar directamente con el backend del mismo proyecto. Si el backend cambia de puerto o dominio, debe actualizarse `src/environments/environment.ts`.
