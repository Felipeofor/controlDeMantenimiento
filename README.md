# Kavak - Sistema de Control de Mantenimiento (South Cone)

Este proyecto representa una solución de nivel senior para la gestión de flota de vehículos usados de Kavak, priorizando la **mantenibilidad**, **explicabilidad** y **performance**.

## 🏗️ Arquitectura y Diseño

### Decisiones Técnicas
- **Separación de Responsabilidades**: Arquitectura en capas clara (`Controller` -> `Service` -> `Repository` -> `Domain`).
- **Domain Driven Alignment**: El modelo de datos refleja el lenguaje del negocio (Patente, Kilometraje, Mantenimiento).
- **API First**: Uso estricto de DTOs para evitar el leak de entidades JPA al frontend y permitir evoluciones de contrato independientes.
- **Optimización de I/O**: Implementación de disponibilidad pre-calculada en el DTO de vehículos para evitar el problema de N+1 queries desde la UI.

### 🛡️ Reglas de Negocio Implementadas
- **Máquina de Estados**: Las transiciones de mantenimiento están validadas para prevenir flujos imposibles (ej. no se puede saltar de PENDIENTE a COMPLETADO directamente).
- **Cálculo de Disponibilidad**: Un vehículo se marca automáticamente como **NO DISPONIBLE** si tiene alguna intervención `PENDIENTE` o `EN_PROCESO`.
- **Integridad Financiera**: El costo total de mantenimiento se calcula exclusivamente sobre tareas `COMPLETADO` con un `costoFinal` verificado.

## 🚀 Cómo Ejecutar (Quick Start)

### Opción A: Docker (Recomendada)
Para levantar todo el ecosistema (PostgreSQL + API) en un solo paso:
```bash
docker-compose up --build
```
> [!NOTE]
> El backend estará disponible en `http://localhost:8080` y la DB en el puerto `5432`.

### Opción B: Manual
**Backend:**
```bash
cd maintenance-system
./mvnw clean install
./mvnw spring-boot:run
```
**Frontend:**
```bash
cd maintenance-frontend
npm install
npm run dev
```

## 🧪 Calidad y Testing
Se incluyeron tests unitarios críticos que validan la lógica central sin dependencia de DB externa:
- `VehicleServiceTest`: Validación de disponibilidad y sumatoria de costos.
- `MaintenanceServiceTest`: Validación de transiciones de estado y excepciones de negocio.

Ejecutar tests:
```bash
./mvnw test
```

## 📝 Documentación de API
Una vez iniciada la aplicación, puedes acceder a la documentación interactiva en:
👉 `http://localhost:8080/swagger-ui/index.html`

## 💭 Supuestos y Criterios
1. **Unicidad de Patente**: Se asume el formato estándar regional para validaciones por regex.
2. **Cascada de Datos**: Al eliminar un vehículo, se eliminan sus mantenimientos asociados para mantener la integridad referencial.
3. **Escalabilidad**: El diseño soporta fácilmente la adición de autenticación (Spring Security) y auditoría avanzada.
