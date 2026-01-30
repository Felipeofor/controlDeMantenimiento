---
description: Cómo gestionar entornos separados (Desa, Test, Prod)
---

# Gestión de Entornos en Argentina Black

Para trabajar sin afectar a los usuarios reales, hemos configurado una estructura de 3 niveles.

## 1. Ramas de Git
- **main**: Producción (Lo que ven los clientes).
- **test**: Pruebas finales (Pre-producción).
- **desa**: Desarrollo diario y nuevas funciones.

## 2. Bases de Datos (Supabase)
Te recomiendo crear **3 proyectos diferentes** en Supabase para una separación total:
1. `argentina-black-prod`
2. `argentina-black-test`
3. `argentina-black-desa`

## 3. Archivos de Configuración (.env)
He creado 3 archivos en la raíz del proyecto:
- `.env`: Para Producción.
- `.env.test`: Para la rama Test.
- `.env.desa`: Para la rama Desarrollo.

**IMPORTANTE:** Debes completar los campos `TU_URL_DE_...` y `TU_KEY_DE_...` en cada uno con las credenciales del proyecto de Supabase correspondiente.

## 4. Despliegue (Vercel / Netlify / Otros)
Si usas un servicio de despliegue automático:
1. Conecta la rama `main` al sitio de producción.
2. Conecta la rama `test` a un subdominio (ej: `test.argblack.com`).
3. Conecta la rama `desa` a otro (ej: `dev.argblack.com`).

En la configuración de cada sitio, asegúrate de poner las variables de entorno correctas.

## 5. Comandos de Construcción
- `npm run build`: Genera la versión de Producción.
- `npm run build:test`: Genera la versión para Test (usa .env.test).
- `npm run build:desa`: Genera la versión para Desa (usa .env.desa).
