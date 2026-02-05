# Sistema de Mantenimiento - Edición SaaS 🚀
> Transformado de un desafío de un solo tenant a una Plataforma SaaS Multi-Tenant escalable.

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue) ![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-green) ![Java](https://img.shields.io/badge/Java-17-orange) ![Security](https://img.shields.io/badge/Auth-JWT%20%2B%20Spring%20Security-red)

## 🏢 Resumen del Proyecto
Este proyecto es un sistema de gestión de mantenimiento de vehículos diseñado para **gestores de flotas**.
Originalmente un desafío técnico, ha sido re-arquitectado en una plataforma **SaaS Multi-Tenant** (Software as a Service), permitiendo que múltiples organizaciones ("Tenants") gestionen sus propias flotas en completo aislamiento dentro de la misma infraestructura.

---

## ✨ Características Clave (Transformación SaaS)

### 🔐 Seguridad e Identidad (IAM)
*   **Autenticación JWT**: Autenticación segura basada en tokens sin estado ("stateless").
*   **Control de Acceso Basado en Roles (RBAC)**: Soporte para roles de `ADMIN`, `MANAGER` y `TECNICO`.
*   **Almacenamiento Seguro de Contraseñas**: Encriptación BCrypt para todas las contraseñas de usuario.

### 🌐 Arquitectura Multi-Tenant
*   **Aislamiento de Datos**: Lógica de "Base de Datos Compartida, Esquema Separado" (Shared Database, Separated Schema).
*   **Contexto del Tenant**: Intercepción automática de solicitudes para identificar al tenant desde el usuario autenticado.
*   **Seguridad a Nivel de Fila**: Todas las consultas de datos (Vehículos, Mantenimientos) se filtran automáticamente por `tenant_id` a nivel de repositorio.

### 💻 Frontend Moderno
*   **Contexto de Auth**: Contexto de React para gestionar sesiones de usuario globalmente.
*   **Rutas Protegidas**: Redirección automática para acceso no autenticado.
*   **Dashboard**: Estado de la flota en tiempo real y seguimiento de mantenimiento.
*   **Gestión de Vehículos**: CRUD completo con datos conscientes del tenant.

---

## 🛠️ Stack Tecnológico

### Backend (`maintenance-system`)
*   **Java 17**
*   **Spring Boot 3.3.4**
*   **Spring Security & JWT**
*   **Spring Data JPA (Hibernate)**
*   **Base de Datos H2** (En memoria para Dev/Test)
*   **Docker** (Opcional para contenedorización)

### Frontend (`maintenance-frontend`)
*   **React 18**
*   **TypeScript**
*   **Vite**
*   **TailwindCSS**
*   **Iconos Lucide**
*   **Axios** (Cliente API Centralizado con Interceptores)

---

## 🚀 Ejecución en Paralelo (Los 3 Proyectos)

Para levantar los tres proyectos (Salud, Mantenimiento e HiYappa) simultáneamente sin conflictos de puertos, puedes usar el script automatizado:

### Windows (PowerShell)
```powershell
./levantar-todo.ps1
```

Este script abrirá ventanas de terminal independientes para cada servicio:
*   **Salud**: Frontend (:3000) | Backend (:8081)
*   **Mantenimiento**: Frontend (:5173) | Backend (:8080)
*   **HiYappa**: Fullstack (:3005)

---

## 🚀 Comenzando

### 1. Configuración del Backend
```bash
cd maintenance-system
mvn clean install
mvn spring-boot:run
```
*   El servidor inicia en `http://localhost:8080`
*   **Nota**: La base de datos H2 es volátil. **Reiniciar el servidor restablece todos los datos.**

### 2. Configuración del Frontend
```bash
cd maintenance-frontend
npm install
npm run dev
```
*   La aplicación inicia en `http://localhost:5173`

---

## 🧪 Cómo probar Multi-Tenancy
Hemos sembrado la base de datos con dos tenants distintos para pruebas:

### Opción A: Kavak Demo (Por defecto)
> Contiene vehículos y registros de mantenimiento precargados.
*   **Usuario**: `admin@kavak.com`
*   **Contraseña**: `password`

### Opción B: Uber Fleet (Lienzo en blanco)
> Un tenant completamente vacío para verificar el aislamiento de datos.
*   **Usuario**: `uber@kavak.com`
*   **Contraseña**: `password`

**Pasos de Verificación:**
1.  Inicia sesión como **Admin de Kavak**. Deberías ver 4 vehículos.
2.  Cierra sesión.
3.  Inicia sesión como **Admin de Uber**. Deberías ver **0 vehículos**.
4.  Crea un vehículo como Uber. NO aparecerá en el Dashboard de Kavak.
