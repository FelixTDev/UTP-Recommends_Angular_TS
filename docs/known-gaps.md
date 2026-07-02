# Brechas Detectadas y Mitigaciones en Frontend-Backend

Durante la auditoría del backend Spring Boot y el mapeo con el frontend Angular, se identificaron las siguientes discrepancias y limitaciones técnicas:

## 1. Discrepancia en Mapeo de Base de Datos - Hibernate (Puntaje)
- **Brecha**: La columna `puntaje` en la tabla `resena_calificacion` está declarada en MySQL como `TINYINT`. Sin embargo, el mapeo JPA en Hibernate espera un tipo de dato `Integer` (reportado en el arranque con `ddl-auto=validate`).
- **Mitigación**: En el frontend, todas las interfaces TypeScript e inputs del componente `StarRatingComponent` controlan que el valor ingresado sea estrictamente un entero entre `1` y `5` inclusive. Esto evita cualquier desbordamiento de tipo o inconsistencia de rango numérico.

## 2. Inconsistencia de Unicidad en Cursos Generales
- **Brecha**: Existe un índice de unicidad `UNIQUE(nombre, carrera_id)`. Sin embargo, para los cursos `GENERAL`, la columna `carrera_id` es `null`. Debido a que MySQL trata cada `null` como único y distinto, este índice no previene duplicados físicos de nombres en cursos generales.
- **Mitigación**: El servicio del backend valida manualmente esta condición antes de insertar un nuevo curso. En el frontend, se captura el error `409 Conflict` devuelto por el backend si se intenta duplicar el nombre de un curso general, notificando al administrador de forma clara en lugar de fallar en segundo plano.

## 3. Búsqueda Pública de Curso-Docente
- **Brecha**: El endpoint para buscar asignaciones activas de curso-docente en base a texto o carrera (`/api/estudiante/curso-docente/activos`) reside bajo el módulo de estudiante, lo que exige autenticación de rol `ESTUDIANTE`. Los usuarios públicos (no autenticados) no pueden realizar búsquedas dinámicas de autocompletado directamente de ese catálogo.
- **Mitigación**: En la pantalla de Inicio Pública (`/public/inicio`), los filtros de docente y curso buscan localmente en los datos de las reseñas aprobadas y promediadas que ya fueron cargadas y paginadas. Para estudiantes autenticados, se utiliza el endpoint optimizado del backend con autocompletado en el formulario de redacción.
