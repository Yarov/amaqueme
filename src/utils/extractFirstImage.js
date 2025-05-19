/**
 * Extrae la URL de la primera imagen que se encuentra en el contenido HTML
 * @param {string} content - El contenido HTML del post
 * @param {string} defaultImage - URL de imagen por defecto si no se encuentra ninguna
 * @returns {string} La URL de la imagen o la imagen por defecto
 */
export function extractFirstImage(content, defaultImage = '/placeholder-image.svg') {
  try {
    // Verificar que el contenido sea una cadena válida
    if (!content || typeof content !== 'string') {
      console.warn('extractFirstImage: contenido no válido', content);
      return defaultImage;
    }

    // Intentamos diferentes métodos para encontrar imágenes
    
    // 1. Buscar cualquier etiqueta img y extraer su src
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = content.match(imgRegex);
    if (match && match[1] && isValidImageUrl(match[1])) {
      return match[1];
    }

    // 2. Buscar imágenes en bloques específicos de WordPress
    const wpBlockImgRegex = /<figure class="wp-block-image[^>]*>.*?<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const wpMatch = content.match(wpBlockImgRegex);
    if (wpMatch && wpMatch[1] && isValidImageUrl(wpMatch[1])) {
      return wpMatch[1];
    }

    // 3. Buscar URLs de imágenes en estilos de fondo
    const bgImgRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/i;
    const bgMatch = content.match(bgImgRegex);
    if (bgMatch && bgMatch[1] && isValidImageUrl(bgMatch[1])) {
      return bgMatch[1];
    }

    // 4. Buscar imágenes dentro de <picture>
    const pictureRegex = /<picture[^>]*>.*?<img[^>]+src=["']([^"']+)["'][^>]*>/is;
    const pictureMatch = content.match(pictureRegex);
    if (pictureMatch && pictureMatch[1] && isValidImageUrl(pictureMatch[1])) {
      return pictureMatch[1];
    }
    
    // 5. Buscar etiquetas srcset y extraer la primera URL
    const srcsetRegex = /srcset=["']([^"'\s,]+)[^"']*/i;
    const srcsetMatch = content.match(srcsetRegex);
    if (srcsetMatch && srcsetMatch[1] && isValidImageUrl(srcsetMatch[1])) {
      return srcsetMatch[1];
    }

    // 6. Búsqueda más agresiva para cualquier URL que parezca una imagen
    const urlRegex = /https?:\/\/\S+\.(jpe?g|png|gif|webp|svg)/i;
    const urlMatch = content.match(urlRegex);
    if (urlMatch && urlMatch[0] && isValidImageUrl(urlMatch[0])) {
      return urlMatch[0];
    }

    // Si no se encuentra ninguna imagen, devolver la imagen por defecto
    return defaultImage;
  } catch (error) {
    console.error('Error al extraer imagen del contenido:', error);
    return defaultImage;
  }
}

/**
 * Verifica si una URL parece ser una imagen válida
 * @param {string} url - La URL a verificar
 * @returns {boolean} - true si parece una URL de imagen válida
 */
function isValidImageUrl(url) {
  if (!url) return false;
  
  // Verificar si la URL tiene una extensión de imagen común
  if (/\.(jpe?g|png|gif|webp|svg|avif|bmp|tiff?)$/i.test(url)) {
    return true;
  }
  
  // Verificar si es una URL de WordPress que incluye parámetros de tamaño
  if (/wp-content\/uploads\/.*\?(?:size|w|h|fit)=/i.test(url)) {
    return true;
  }
  
  // Verificar si es una URL de un CDN de imágenes
  if (/(?:cloudinary\.com|imgix\.net|res\.cloudinary\.com|images\.unsplash\.com)/i.test(url)) {
    return true;
  }
  
  return false;
}