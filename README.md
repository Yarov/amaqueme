# Amaqueme Blog

Un blog minimalista creado con Astro.js, WordPress GraphQL, y Tailwind CSS para amaqueme.mx

## Características

- 🚀 **Astro.js**: Framework web rápido con carga mínima de JavaScript
- 📝 **WordPress GraphQL**: Gestión de contenidos a través de la API de GraphQL de WordPress
- 🎨 **Tailwind CSS**: Framework CSS utilitario para un diseño moderno y responsive
- 🎯 **Minimalista**: Interfaz limpia y enfocada en el contenido
- 🔍 **SEO optimizado**: Metadatos adecuados para mejor posicionamiento
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos
- 📊 **Analytics con ClickHouse**: Sistema de tracking de visitas y estadísticas en tiempo real

## Requisitos previos

- Node.js (versión 20.15.1 o superior)
- Un sitio WordPress con el plugin [WPGraphQL](https://www.wpgraphql.com/) activo
- ClickHouse Server (opcional, para analytics)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tuusuario/amaqueme.git
   cd amaqueme
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Actualiza la URL de la API GraphQL en `src/lib/wordpress.js`:
   ```javascript
   const WORDPRESS_API_URL = 'https://amaqueme.mx/graphql';
   ```

4. (Opcional) Configura el sistema de analytics:
   ```bash
   # Copia el archivo de ejemplo de variables de entorno
   cp .env.example .env
   
   # Instala ClickHouse (macOS)
   brew install clickhouse
   brew services start clickhouse
   
   # Inicializa el schema de ClickHouse
   yarn init-clickhouse
   ```
   
   Ver [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) para instrucciones detalladas.

## Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El sitio estará disponible en [http://localhost:4321](http://localhost:4321)

## Construcción para producción

Para generar la versión de producción:

```bash
npm run build
```

Los archivos generados se encontrarán en la carpeta `dist/`.

## Despliegue

El sitio puede ser desplegado en cualquier plataforma que soporte sitios estáticos como:

- Netlify
- Vercel
- GitHub Pages
- Cualquier servidor web tradicional

### Despliegue en Netlify

1. Crea una cuenta en [Netlify](https://www.netlify.com/)
2. Crea un nuevo sitio desde Git y selecciona este repositorio
3. Configura los siguientes ajustes:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Haz clic en "Deploy site"

## Personalización

### Colores

El color primario está configurado como `#0aa43e` en el archivo `tailwind.config.mjs`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#0aa43e',
    },
  },
},
```

### Estructura del proyecto

- `/src/pages`: Archivos de páginas (usando el enrutamiento basado en archivos de Astro)
- `/src/components`: Componentes reutilizables
- `/src/layouts`: Layouts de páginas
- `/src/lib`: Utilidades y funciones, incluyendo la integración con WordPress GraphQL
- `/src/middleware.js`: Middleware de Astro para tracking de analytics
- `/src/styles`: Estilos CSS globales
- `/src/scripts`: Scripts JavaScript y de inicialización
- `/src/utils`: Utilidades para analytics y otras funciones
- `/public`: Archivos estáticos (favicon, imágenes, etc.)

## 📊 Sistema de Analytics

Este proyecto incluye un sistema completo de analytics con ClickHouse que rastrea:

- ✅ Visitas a posts y categorías
- ✅ Dispositivos (móvil, desktop, tablet)
- ✅ Navegadores y sistemas operativos
- ✅ Fuentes de tráfico
- ✅ Sesiones únicas
- ✅ Posts más visitados en tiempo real

### Configuración Rápida

```bash
# 1. Instalar ClickHouse
brew install clickhouse
brew services start clickhouse

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Inicializar base de datos
yarn init-clickhouse

# 4. Iniciar aplicación
yarn dev
```

### Ver Estadísticas

- **Dashboard**: Visita `/admin/analytics` para ver el dashboard completo
- **API**: Accede a `/api/analytics.json?type=most-viewed&days=30`
- **Componentes**: Los posts más visitados se muestran automáticamente en la sección "Más leídas"

### Documentación Completa

- [Guía de Instalación Rápida](./ANALYTICS_SETUP.md)
- [Documentación Completa de Analytics](./docs/clickhouse-analytics.md)

## Licencia

MIT
