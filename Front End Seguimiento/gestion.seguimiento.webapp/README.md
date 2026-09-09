# Frontend - Portal de Seguimiento (gestion-seguimiento-webapp)

Angular 19 (standalone components) + Angular Material, siguiendo la misma
estructura del proyecto de referencia `gestion.calidad.webapp`: interceptores,
guards, servicios, e interfaces separadas de modelos/requests/responses.

## Vistas

- **Login** (`/auth/login`): autenticación contra `POST /api/Auth/Login`, guarda el JWT en `localStorage`.
- **Tablero** (`/pages/tablero`): tablero Kanban por sistema (Nuevo / En proceso / Resuelto / Cerrado), con modal de alta/edición.
- **Dashboard** (`/pages/dashboard`): métricas y gráficos (Chart.js) por sistema, estado y responsable.
- **Equipo** (`/pages/equipo`): alta/baja de integrantes y carga de trabajo actual.

## Configuración

Edita `src/environments/environment.development.ts` con la URL del backend en
desarrollo (por defecto `http://localhost:5206/api`).

## Ejecutar

```bash
npm install
npm start
```

> Nota: se verificó que el proyecto compila correctamente con
> `ng build --configuration development` y `ng build --configuration production`
> antes de entregarlo.
