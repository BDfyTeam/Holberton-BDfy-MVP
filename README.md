# Bidify

![Bidify Logo](https://user-images.githubusercontent.com/placeholder/logo.png)

Bidify es un sistema de subastas en tiempo real construido con **.NET Core**, **React** y **RabbitMQ**. El objetivo de este MVP es proveer una base sólida para lanzar y gestionar subastas de forma sencilla, moderna y escalable.

## Tabla de Contenidos
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso con Docker](#uso-con-docker)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Características
- Subastas en tiempo real mediante WebSockets
- Backend en **.NET Core** con API REST
- Frontend con **React** y **TailwindCSS**
- Comunicación asincrónica a través de **RabbitMQ**
- Base de datos **PostgreSQL** preconfigurada
- Orquestación completa con **Docker Compose**

## Tecnologías
- [ASP.NET Core](https://learn.microsoft.com/aspnet/core)
- [React](https://react.dev)
- [RabbitMQ](https://www.rabbitmq.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

## Instalación
1. Clona este repositorio
   ```bash
   git clone <url-del-repositorio>
   cd Holberton-Bidify-MVP
   ```
2. Asegúrate de tener **Docker** y **Docker Compose** instalados en tu máquina.

### Uso con Docker
Para levantar la aplicación completa ejecuta:
```bash
docker compose up -d
```
Este comando construirá las imágenes necesarias e iniciará los servicios:
- **backend** en `http://localhost:5015`
- **frontend** en `http://localhost:3000`
- **db** (PostgreSQL) en `localhost:5432`
- **rabbitmq** en `localhost:5672` (panel en `http://localhost:15672`)

Para detener todo utiliza:
```bash
docker compose down
```
Puedes revisar los logs con:
```bash
docker compose logs -f
```

## Estructura del Proyecto
```
app/
├── Bdfy/            # Backend (.NET Core)
│   ├── Controllers/ # Controladores API
│   ├── Models/      # Modelos de datos
│   └── Services/    # Lógica de negocio
└── BDfy-Frontend/   # Frontend (React)
    ├── components/  # Componentes de React
    └── services/    # Integración con la API
```

## Contribución
Las contribuciones son bienvenidas. Abre un issue para reportar errores o proponer mejoras. Si deseas colaborar directamente:
1. Crea un **fork** del repositorio.
2. Crea una rama para tu aporte:
   ```bash
   git checkout -b nombre-de-tu-rama
   ```
3. Realiza tus cambios y crea un commit descriptivo.
4. Envía un **pull request** para revisión.

## Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
