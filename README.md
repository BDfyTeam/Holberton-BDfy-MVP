<div align="center">
   <img src="https://i.imgur.com/5FReqDz.png" height="150" width="150"><h1>BDfy MVP</h1></img>
</div>
<p>BDfy es una plataforma digital de subastas que brinda una experiencia simple y segura en tiempo real para usuarios y rematadores. 
Principalmente desarrollada en C# (.NET) y React en el frontend, emplea RabbitMQ para la concurrencia de ofertas, SignalR para la comunicación en tiempo real y PostgreSQL como base de datos</p>

## Tabla de Contenido

1. [Tecnologías](#tecnologías)
2. [Estructura del Proyecto](#️-estructura-del-proyecto)
3. [Flujo](#flujo)
4. [Setup](#setup)
5. [Funcionalidades](#funcionalidades)
6. [Documentación Técnica](#documentación-técnica)
7. [Entorno de producción](#entorno-de-producción)
8. [Autentificación](#autentificación)
9. [Miembros del equipo](#miembros-del-equipo)
---

## Tecnologías

### Backend:
- ASP.NET(C#) 
- RabbitMQ
- SignalR
- CloudSQL

### Frontend:
- React-router
- Tailwind
- TypeScript
- Vite
---

## 🛠️ Estructura del Proyecto

```
───────────────────────────────────────────────────────────────────────────────────
│app/
│    ├── Bdfy/                 # Backend (.NET Core)
│    │   ├── Controllers/      # Controladores API
│    |   ├── Data/             # Configuraciones de la base de datos
│    |   ├── Dtos/             # Almacena los Dtos (estructura de datos)
│    |   ├── HUB/              # Logica de SignalR
│    │   ├── Models/           # Modelos de datos
│    │   ├── Services/         # Servicios
│    |   ├── appsettings.json  # Configuracion del proyecto
│    |   └── Program.cs        # Builder o iniciador de C#
│    │
│    └── BDfy-Frontend/      # Frontend (React)
│        ├── components/     # Componentes React
│        ├── public/         # Assets publicos
│        ├── routes/         # Rutas del programa  
│        └── services/       # Servicios API
│ .gitignore
│ cloudbuild.yaml            # Iniciador para el deploy en Cloud
│ docker-compose.yml         # Docker compose que inicializa la app
│ README.md                  # Readme del repositorio
│ requirements.txt           # Detalles de los requerimientos del proyecto
──────────────────────────────────────────────────────────────────────────────────
```
---

## Flujo

![image](https://raw.githubusercontent.com/lucas2mz/Lucas2mz/refs/heads/flow-BDfy/Diagrama%20Arquitectura%20bien%20centrado.jpg)

---

## Setup

1- Clonar el repositorio
```bash
git clone <url del repositorio>
cd Holberton-Bidify-MVP
```
2- Instalar dependencias de React (leer requirements.txt para mas información)
```bash
cd app
cd BDfy-Frontend/app
npm install
```
3- En la raiz del repositorio, ejecutar los siguientes comandos
```bash
docker compose build
docker compose up
```
El `docker-compose.yaml` crea los contenedores dejando la applicación lista para ser usada

*Nota
- Tener instalado Docker for desktop o sus versiones para consola
```bash
apt get install docker.io
```

---

<h2>Funcionalidades</h2>
<h4>Para los usuarios</h4>
<ul>
   <li>Registro/Login</li>
   <li>Ver subastas activas</li>
   <li>Ver información del subastador</li>
   <li>Ofertar en un lote</li>
   <li>Automatizar ofertas en un lote</li>
   <li>Ver historial en un lote</li>
</ul>
<h4>Para los rematadores<h4>
<ul>
   <li>Registro/Login</li>
   <li>Ver subastas activas</li>
   <li>Ver historial en un lote</li>
   <li>Ver su inventario</li>
   <li>Reutilizar lotes en proximas subastas</li>
   <li>Crear subastas</li>
   <li>Crear lotes</li>
</ul>
   
---

<h2>Documentación Técnica</h2>
<a href="https://docs.google.com/document/d/1otZBrP6yAiJaQfg6aJGTC2W4TJOyHt5vK8hkPa1jZvs/edit?usp=sharing"><p>Click para ir</p></a>

---

<h2>Entorno de producción</h2>
<h4>URL del deploy</h4>

```
https://bdfy.tech/
```

<h4>URL de las API's</h4>

```
https://api.bdfy.tech/
```
---

<h2>Autentificación</h2>

<h4>Se utilizó JWT token para la autentificación de los endpoints</h4>

```http
Authorization: Bearer [your-JWT-token]
```

---

## Miembros del equipo

<img src="https://i.imgur.com/BiDivk1.png"></img>

<h2><a href="https://github.com/lucas2mz" style="color:#D96E1C;" ><strong>Lucas Andrada |</strong></a>
<a href="https://github.com/Ifabri31" style="color:#D91C87;" ><strong>Fabrizzio Oviedo |</strong></a>
<a href="https://github.com/RodrigoFerrer" style="color:#81D91C;" ><strong>Rodrigo Ferrer |</strong></a>
<a href="https://github.com/Franco-byte" style="color:#38A3C7;" ><strong>Franco Reyes</strong></a></h2>
