---
name: firecrawl-scraper
description: Scraping profundo, capturas de pantalla, parseo de PDF y rastreo de sitios web utilizando la API de Firecrawl.
---

# Firecrawl Scraper

## Resumen
Extracción profunda de contenido web, capturas de pantalla, parseo de documentos PDF y crawling de sitios web optimizado para LLMs utilizando la API de Firecrawl.

## Cuándo usarlo
- Cuando necesites extracción de contenido estructurado de páginas web complejas.
- Cuando se requiera interacción con la página (clics, scroll, etc.) antes de extraer datos.
- Cuando necesites convertir contenido web a Markdown limpio para RAG o LLMs.
- Para scraping masivo de múltiples URLs de forma eficiente.

## Instalación
```bash
npx skills add -g BenedictKing/firecrawl-scraper
```

## Guía Paso a Paso
1. Instala la habilidad usando el comando anterior.
2. Configura tu API Key de Firecrawl en las variables de entorno.
3. Utilízalo de forma natural en las conversaciones con el asistente.

## Mejores Prácticas
- Configura las claves de API mediante variables de entorno (`FIRECRAWL_API_KEY`).
- Utiliza los parámetros de crawling para limitar la profundidad y evitar consumo innecesivo.

## Problemas Comunes
- **Errores de Red**: Verifica la conectividad y que la URL sea accesible públicamente.
- **Límites de API**: Revisa tu cuota en el dashboard de Firecrawl si recibes errores 429.

## Habilidades Relacionadas
- `ai-engineer`, `seo-fundamentals`, `data-scientist`
