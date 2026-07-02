# Documentación de Identidad Visual: UTP Red & Light Premium

Este documento detalla la migración de la interfaz del sistema **UTP+Recommends** desde la estética inicial de **Dark Glassmorphism** (basada en azul/negro profundo con acentos índigo) hacia el diseño limpio, profesional y académico **UTP Red & Light Premium**.

---

## 1. Paleta de Colores Oficial

Se ha implementado de forma estricta la paleta de colores especificada en la especificación visual:

### Colores Principales
- **UTP Primary**: `#FF1744` (Rojo institucional activo, acciones primarias, acentos de marca)
- **UTP Primary Dark**: `#D50032` (Rojo oscuro para estados de hover en botones primarios)
- **UTP Text**: `#0B0B0F` (Texto oscuro de alto contraste y legibilidad)
- **UTP Text Secondary**: `#6B7280` (Texto secundario/gris medio para subtítulos y descripciones)
- **UTP Text Muted**: `#9CA3AF` (Texto desvanecido/gris claro para placeholders)
- **UTP Background**: `#F6F7FB` (Fondo claro de la aplicación)
- **UTP Surface**: `#FFFFFF` (Fondo blanco puro para tarjetas y bloques de contenido)
- **UTP Surface Soft**: `#FAFAFB` (Fondo gris extra suave para inputs y zonas de baja jerarquía)
- **UTP Border**: `#E5E7EB` (Borde sutil en componentes)
- **UTP Border Soft**: `#F3F4F6` (Borde interno en tablas y separadores ligeros)

### Estados
- **Success**: `#059669` (Verde para aprobaciones y éxitos)
- **Warning**: `#D97706` (Ámbar para alertas, puntuaciones y estados pendientes)
- **Danger**: `#DC2626` (Rojo vivo para rechazos e inactivación)
- **Info**: `#0284C7` (Azul claro para enlaces y datos complementarios)

---

## 2. Decisión de Diseño y Arquitectura CSS

### Abandono de Dark Glassmorphism como Tema Principal
Siguiendo las directrices académicas, el tema oscuro con desenfoque de cristal (glassmorphism) se ha retirado de las pantallas principales del sistema y las rutas autenticadas. Ahora:
1. El fondo de la aplicación es completamente claro (`var(--utp-bg)` / `#F6F7FB`).
2. Las pantallas utilizan un diseño limpio con alta legibilidad, bordes redondeados estándar y sombras sutiles.

### Compatibilidad de Plantillas (Clases CSS Heredadas)
Para evitar la modificación de más de 20 archivos de componentes de Angular de forma manual (lo cual incrementaría el riesgo de errores en la compilación y la lógica), se mantuvieron las firmas de clases existentes en los componentes, pero se redefinieron sus estilos globales en `src/styles.scss`:
- `.glass-card`: Ahora representa una tarjeta premium en color blanco (`var(--utp-surface)`) con borde suave (`var(--utp-border)`) y sombra sutil.
- `.glass-input`: Ahora es un input de fondo claro (`var(--utp-surface-soft)`), con texto oscuro y borde suave que al enfocarse se resalta en rojo UTP.
- `.btn-primary-glass`: Ahora es un botón de fondo rojo UTP con texto blanco.
- `.btn-secondary-glass`: Ahora es un botón con contorno de borde suave y texto oscuro.

Esto garantiza estabilidad en la compilación y mantenimiento del software.

### Criterio de Sobrescritura Controlada de `.text-white`
Se implementó una redefinición selectiva de la clase `.text-white` para evitar que títulos con dicha clase embebida en Bootstrap se vuelvan invisibles sobre el fondo claro de la aplicación.
- **En layouts claros** (dentro de `.main-layout` del App Shell, la portada `.public-landing`, y los modales `.cdk-overlay-container`), la clase `.text-white` se dibuja como el texto oscuro (`var(--utp-text)`).
- **En fondos oscuros** (como los botones rojos `.btn-primary-glass`, `.btn`, badges de estados o el banner de login), la clase `.text-white` o el color blanco real se conservan intactos para preservar el contraste correcto de lectura.

---

## 3. Pantallas Verificadas Visualmente

Se ha validado la consistencia visual y la correcta visualización de los contrastes mediante pruebas con agente de navegación automatizado:
1. **Portada Pública (`/public/inicio`)**: Carga de reseñas de forma clara, filtros limpios y alta legibilidad de comentarios.
2. **Formulario de Login (`/auth/login`)**: Card central blanca y elegante sobre fondo claro, campos de entrada con foco rojo UTP y texto oscuro.
3. **Formulario de Registro (`/auth/registro`)**: Formulario con validaciones en rojo UTP y campos legibles.
4. **Consola del Administrador (`/admin/inicio`)**: Tarjetas de métricas operacionales con opacidades sutiles basadas en la paleta de estados de la UTP.
5. **Lista de Usuarios (`/admin/usuarios`)**: Tabla con contrastes correctos, buscador y selectores de filtro limpios adaptados al tema claro.
6. **Moderación de Reseñas (`/admin/moderacion/resenas`)**: Tarjetas de moderación, comentarios resaltados con indicador rojo UTP, y botones de acción limpios.
7. **Moderación de Solicitudes (`/admin/moderacion/solicitudes`)**: Tarjetas con flujo de aprobación en cascada, selectores y formularios correctamente visualizados.

---

## 4. Resultados de Compilación y Pruebas Técnicas

- **Build (`npm run build`)**: Generación del bundle de producción exitosa sin ningún error sintáctico o de compilación en el compilador de Angular (`ng build`).
- **Tests (`npm test`)**: Suite de pruebas unitarias ejecutada con éxito (`TOTAL: 2 SUCCESS`).

---

## 5. Riesgos Restantes

- **Imágenes y Recursos Gráficos Externos**: En caso de que se agreguen logotipos u otros recursos institucionales, asegurar que usen versiones transparentes adaptadas para fondos claros.
- **Diálogos de Terceros**: Las ventanas emergentes customizadas que no utilicen el overlay estándar de Angular Material deberán ser validadas individualmente para asegurar que no contengan estilos oscuros hardcodeados.
