import { extractFirstImage } from './extractFirstImage';

/**
 * Obtiene la mejor imagen disponible para un post
 * @param {Object} post - El objeto post de WordPress
 * @param {string} defaultImage - Imagen por defecto si no se encuentra ninguna
 * @returns {Object} Objeto con la URL de la imagen y el texto alternativo
 */
export function getPostImage(post, defaultImage = '/placeholder-image.svg') {
  // Verificar que post sea un objeto válido
  if (!post || typeof post !== 'object') {
    console.warn('getPostImage: post no es un objeto válido', post);
    return {
      url: defaultImage,
      alt: 'Imagen por defecto'
    };
  }

  try {
    // Si hay una imagen destacada, usarla
    if (post.featuredImage && post.featuredImage.node && post.featuredImage.node.sourceUrl) {
      return {
        url: post.featuredImage.node.sourceUrl,
        alt: post.featuredImage.node.altText || post.title || 'Imagen destacada'
      };
    }
    
    // Si no hay imagen destacada pero hay contenido, extraer la primera imagen
    if (post.content) {
      const firstImageUrl = extractFirstImage(post.content, defaultImage);
      return {
        url: firstImageUrl,
        alt: post.title || 'Imagen del artículo'
      };
    }
  } catch (error) {
    console.error('Error al procesar la imagen del post:', error);
  }
  
  // Si no hay ni imagen destacada ni contenido con imágenes, usar la imagen por defecto
  return {
    url: defaultImage,
    alt: (post.title || 'Imagen por defecto')
  };
}