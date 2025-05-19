# Amaqueme Blog

Un blog minimalista creado con Astro.js, WordPress GraphQL, y Tailwind CSS para amaqueme.mx

## Características

- 🚀 **Astro.js**: Framework web rápido con carga mínima de JavaScript
- 📝 **WordPress GraphQL**: Gestión de contenidos a través de la API de GraphQL de WordPress
- 🎨 **Tailwind CSS**: Framework CSS utilitario para un diseño moderno y responsive
- 🎯 **Minimalista**: Interfaz limpia y enfocada en el contenido
- 🔍 **SEO optimizado**: Metadatos adecuados para mejor posicionamiento
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos

## Requisitos previos

- Node.js (versión 16.x o superior)
- Un sitio WordPress con el plugin [WPGraphQL](https://www.wpgraphql.com/) activo

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
- `/src/styles`: Estilos CSS globales
- `/src/scripts`: Scripts JavaScript
- `/public`: Archivos estáticos (favicon, imágenes, etc.)

## Licencia

MIT
