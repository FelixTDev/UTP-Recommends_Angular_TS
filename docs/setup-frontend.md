# Guía de Configuración y Ejecución del Frontend

Esta guía describe los requisitos, la instalación de dependencias, variables de entorno, comandos de construcción y pruebas para ejecutar localmente el frontend Angular.

## Requisitos de Entorno

- **Node.js**: v18.x o superior (recomendado v20.x o superior)
- **NPM**: v9.x o superior
- **Angular CLI**: v20.3.x (gestionado mediante `npx` o instalado de forma global con `npm install -g @angular/cli`)

## Instalación de Dependencias

Ejecuta el siguiente comando en la raíz del proyecto para descargar e instalar todas las librerías necesarias:

```bash
npm install --legacy-peer-deps
```

*Nota: Es necesario usar `--legacy-peer-deps` debido a que el proyecto utiliza la versión estable más reciente de Angular 20 y las dependencias de Angular Material y CDK esperan firmas de pares compatibles.*

## Configuración de Entornos (Environment)

El archivo de configuración principal se encuentra en:
- `src/environments/environment.ts`

Por defecto, apunta al puerto local configurado en el backend Spring Boot:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api'
};
```

Si decides levantar el backend en otra máquina o puerto, actualiza el valor de `apiUrl` convenientemente.

## Comandos de Ejecución y Desarrollo

### Iniciar Servidor de Desarrollo Local
Para levantar la aplicación en modo desarrollo en el puerto predeterminado `4200`:

```bash
npm start
```
Ó directamente:
```bash
npx ng serve
```

Abre tu navegador en: [http://localhost:4200](http://localhost:4200)

### Compilación para Producción (Build)
Para compilar y empaquetar los assets en la carpeta `dist/`:

```bash
npm run build
```

## Ejecución de Pruebas Unitarias

Para correr las pruebas unitarias usando Karma y Chrome de manera automatizada:

```bash
npm test -- --watch=false
```

## Credenciales Locales de Prueba (Bootstrap)

Si el backend Spring Boot tiene configurado el bootstrap en su arranque local con las variables:

- **Usuario Admin**: `admin@utp.edu.pe`
- **Contraseña**: `Admin123!`

Puedes usar estas credenciales en la pantalla de Login `/auth/login` para entrar al panel de administración y probar los flujos de moderación de reseñas y solicitudes.
Para estudiantes, puedes registrar una cuenta nueva usando el formulario `/auth/registro`.
