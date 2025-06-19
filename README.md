# Bidify MVP

Sistema de subastas en tiempo real desarrollado con .NET Core y React.

## 🚀 Inicio Rápido

### 📦 Ejecutar con Docker

Esta es la forma más sencilla de ejecutar el proyecto, ya que Docker se encarga de toda la configuración.

#### Prerrequisitos

- Docker
- Docker Compose

#### Pasos para ejecutar con Docker

1. Clona el repositorio

   ```bash
   git clone [url-del-repositorio]
   cd Holberton-Bidify-MVP
   ```

2. Inicia los contenedores

   ```bash
   docker compose up -d
   ```

3. Verifica que todos los servicios estén funcionando
   ```bash
   docker compose ps
   ```

Los servicios estarán disponibles en:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5015
- PostgreSQL: localhost:5432
  - Database: BDfyDatabase
  - Usuario: root
  - Contraseña: 1234
- RabbitMQ:
  - Servicio: localhost:5672
  - Panel de administración: http://localhost:15672
  - Usuario: guest
  - Contraseña: guest

#### Comandos Docker útiles

```bash
# Ver logs de todos los servicios
docker compose logs

# Ver logs de un servicio específico
docker compose logs backend
docker compose logs frontend
docker compose logs db
docker compose logs rabbitmq

# Reiniciar un servicio
docker compose restart [servicio]

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (borra la base de datos)
docker compose down -v

# Reconstruir las imágenes (después de cambios)
docker compose build
```

### Resolución de problemas comunes con Docker

1. Si el backend no se conecta a la base de datos:

   - Espera unos segundos más, la base de datos puede tardar en inicializarse
   - Verifica los logs: `docker compose logs db`
   - Asegúrate de que los volúmenes se crearon correctamente

2. Si el frontend no se conecta al backend:

   - Verifica que el backend esté funcionando: `docker compose ps`
   - Revisa los logs del backend: `docker compose logs backend`
   - Asegúrate de que los puertos no estén en uso por otras aplicaciones

3. Si necesitas reiniciar todo desde cero:
   ```bash
   docker compose down -v
   docker compose build --no-cache
   docker compose up -d
   ```

## 🛠️ Estructura del Proyecto

```
app/
├── Bdfy/               # Backend (.NET Core)
│   ├── Controllers/    # Controladores API
│   ├── Models/         # Modelos de datos
│   └── Services/       # Servicios y lógica de negocio
│
└── BDfy-Frontend/      # Frontend (React)
    |
    ├── components/     # Componentes React
    └── services/       # Servicios API
```

## 📝 Notas Adicionales

- La configuración de Docker está optimizada para desarrollo y puede requerir ajustes para producción
- Para contribuir al proyecto, por favor crea un branch y envía un pull request
