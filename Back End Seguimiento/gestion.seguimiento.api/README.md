# Backend - Portal de Seguimiento (ptxSeguimiento)

API en .NET 8 (Clean Architecture: API / Application / Domain / Infrastructure), ADO.NET
puro con `Microsoft.Data.SqlClient` contra procedimientos almacenados de SQL Server,
AutoMapper, JWT y Swagger. Sigue la misma estructura del proyecto de referencia
`ptxInspeccion` (gestion.calidad.api).

## 1. Base de datos

1. Ejecuta el script `Seguimiento_BaseDatos.sql` (carpeta raíz del proyecto,
   junto a `Back End Seguimiento` y `Front End Seguimiento`) en SQL Server.
   Crea la base `PRECOTEX_SEGUIMIENTO`, las tablas y los procedimientos
   almacenados, e inserta datos iniciales (sistemas, equipo de ejemplo y un
   usuario administrador).
2. Usuario inicial: `admin` / Contraseña: `Precotex2026!` (cámbiala apenas
   puedas — el hash BCrypt ya viene generado en el script).

## 2. Configuración

Edita `ptxSeguimiento.API/appsettings.json` (o `appsettings.Development.json`)
con la cadena de conexión real y, muy importante, reemplaza `Jwt:Key` por una
clave secreta propia de al menos 32 caracteres.

## 3. Ejecutar

```bash
cd ptxSeguimiento.API
dotnet restore
dotnet run
```

Swagger queda disponible en `/swagger` (perfil `http`: http://localhost:5206/swagger).

## 4. Endpoints principales

- `POST /api/Auth/Login`
- `GET  /api/Sistemas/Listar`
- `GET  /api/Equipo/Listar` · `POST /api/Equipo/Mantenimiento`
- `GET  /api/Tickets/Listar` · `GET /api/Tickets/Obtener/{Num_Ticket}` ·
  `POST /api/Tickets/Mantenimiento` · `POST /api/Tickets/MoverEstado`
- `GET  /api/Dashboard/ObtenerResumen`

Todos (excepto `Auth/Login`) requieren `Authorization: Bearer {token}`.

> Nota: este proyecto se generó en un entorno sin el SDK de .NET instalado, por lo
> que no fue posible ejecutar `dotnet build` para verificarlo de forma automática.
> Se recomienda correr `dotnet build` la primera vez para confirmar que todo
> compila en tu máquina antes de integrarlo.
