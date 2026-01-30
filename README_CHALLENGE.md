# Car Maintenance System - Kavak Challenge

## Descripción
Este proyecto resuelve el "Business Case - Producto South Cone" propuesto por Kavak. Se trata de un sistema de control de flota y mantenimiento automotor que permite gestionar el estado de los vehículos y sus intervenciones técnicas.

## Decisiones de Diseño & Arquitectura

### Backend (Java/Spring Boot)
- **Arquitectura en Capas**: Se utilizó un diseño clásico de 3 capas (`Controller`, `Service`, `Repository`) más una capa de `Domain` para las entidades. Esto garantiza una separación clara de responsabilidades.
- **Modelo de Dominio**:
  - `Vehicle`: Entidad central que contiene la información estática y el kilometraje.
  - `Maintenance`: Relacionado con `Vehicle`, maneja estados dinámicos y costos.
- **Reglas de Negocio (Core)**:
  - **Transiciones de Estado**: Implementadas en `MaintenanceService` con validación estricta (ej. no se puede pasar de PENDIENTE a COMPLETADO sin pasar por EN_PROCESO).
  - **Disponibilidad**: Un vehículo se marca como "No Disponible" automáticamente si tiene mantenimientos activos.
  - **Costo Total**: Se calcula proactivamente sumando solo los mantenimientos en estado `COMPLETADO` que poseen un `costoFinal`.
- **Integridad de Datos**: Se utiliza `Column(unique = true)` para las patentes y validaciones JPA/Hibernate.

### Frontend (React/Vite)
- **Estética Kavak**: Se aplicó un "Design System" premium inspirado en la web de Kavak:
  - Paleta de colores Dark Mode (Negro, Superficies oscuras, Blanco).
  - Tipografía limpia y tracking ajustado.
  - Micro-animaciones usando Framer Motion y transiciones CSS fluidas.
- **UX**: Navegación ágil entre el dashboard de flota y los detalles de cada vehículo.

## Cómo Ejecutar

### Requisitos
- Java 17 o superior.
- Node.js 18 o superior.
- PostgreSQL (opcional para ejecución rápida usando H2 o modificando `application.properties`).

### Backend
1. Ir a la carpeta `maintenance-system`.
2. Ejecutar `./mvnw compile` (o `mvn compile`).
3. Ejecutar `./mvnw spring-boot:run`.
4. La API estará en `http://localhost:8080`.

### Frontend
1. Ir a la carpeta `maintenance-frontend`.
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.
4. Abrir `http://localhost:5173`.

## Supuestos Realizados
- El costo final se ingresa solo al momento de transicionar a `COMPLETADO`.
- Un vehículo puede tener múltiples mantenimientos pero solo los estados `PENDIENTE` y `EN_PROCESO` bloquean la disponibilidad.
- El kilometraje se actualiza manualmente por el operador.
