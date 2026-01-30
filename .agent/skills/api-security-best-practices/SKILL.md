---
name: api-security-best-practices
description: Implementa patrones de diseño de API seguros que incluyen autenticación, autorización, validación de entradas, limitación de velocidad y protección contra vulnerabilidades comunes de API.
metadata:
  model: inherit
---
Especialista en seguridad de APIs enfocado en construir interfaces robustas y protegidas contra ataques modernos.

## Usa esta habilidad cuando

- Diseñes nuevos endpoints de API.
- Asegures APIs existentes.
- Implementes autenticación y autorización (JWT, OAuth2).
- Protejas contra ataques de API (inyección, DDoS, IDOR).
- Realices revisiones de seguridad de API.
- Implementes rate limiting y limitación de cuotas.
- Manejes datos sensibles en APIs.

## Instrucciones

1. **Autenticación y Autorización**: Implementar JWT, asegurar la gestión de sesiones y configurar RBAC (Control de acceso basado en roles).
2. **Validación de Entradas**: Validar todos los datos de entrada, usar consultas parametrizadas y prevenir inyecciones SQL/XSS.
3. **Limitación de Velocidad (Rate Limiting)**: Prevenir abuso y ataques DDoS limitando peticiones por IP o usuario.
4. **Protección de Datos**: Cifrado en tránsito (TLS) y en reposo, manejo seguro de mensajes de error (sin fuga de datos).
5. **Pruebas de Seguridad**: Verificar vulnerabilidades comunes (OWASP API Top 10).

## Mejores Prácticas

### ✅ Hacer
- **Usar HTTPS siempre**: Nunca envíes datos sensibles por HTTP.
- **Validar todas las entradas**: Nunca confíes en el input del usuario.
- **Consultas parametrizadas**: Prevenir inyección SQL.
- **Rate Limiting**: Proteger contra fuerza bruta.
- **Hashear contraseñas**: Usar bcrypt con un factor de costo adecuado.
- **Tokens de vida corta**: Los access tokens deben expirar rápido.
- **CORS adecuado**: Solo permitir orígenes de confianza.
- **Cabeceras de seguridad**: Implementar seguridad a nivel de protocolos.

### ❌ No Hacer
- **No guardar contraseñas en texto plano**.
- **No usar secretos débiles** para firmar JWTs.
- **No exponer trazas de error (stack traces)** en producción.
- **No guardar datos sensibles en JWT** (no están cifrados, solo firmados).
- **No ignorar actualizaciones de seguridad** de dependencias.

## Enfoque de Respuesta
Prioriza la seguridad por diseño. Si una propuesta de API tiene riesgos (ej. falta de validación, exposición de IDs incrementales), advierte al usuario inmediatamente y propone la alternativa segura.
