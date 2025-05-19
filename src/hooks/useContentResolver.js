/**
 * Hook para resolver y manejar diferentes tipos de contenido basado en un slug
 */
import { getPostsByCategory } from '../lib/wordpress';
import { resolveUrlType } from '../lib/urlTypeResolver';
import { registerCategoryVisit } from '../utils/userPreferences';

/**
 * Resuelve el contenido basado en un slug y maneja la paginación
 * @param {string} slug - El slug de la URL
 * @returns {Promise<Object>} - Objeto con el contenido resuelto y metadatos
 */
export async function useContentResolver(slug, pageParam = 1) {
  // Analizar el slug para detectar si es una URL de paginación
  let currentPage = parseInt(pageParam) || 1;
  let basePath = slug || '';
  let categorySlug = '';

  // Usamos el categorySlug tal cual, ya que la paginación ahora usa parámetros de consulta
  categorySlug = basePath;
  
  console.log(`[useContentResolver] Resolviendo contenido para slug: '${slug}', página: ${currentPage}`);

  // Determinar el tipo de contenido usando el nuevo resolvedor
  const content = await resolveUrlType(basePath);
  console.log(`[useContentResolver] Tipo de contenido resuelto para '${basePath}':`, content.type);
  
  // Si no se pudo determinar el tipo, usar 'page' como fallback
  if (content.type === 'unknown') {
    console.log(`[useContentResolver] Usando 'page' como fallback para '${basePath}'`);
    content.type = 'page';
  }

  // Objeto para almacenar el resultado
  const result = {
    type: content.type,
    data: content.data || {},
    meta: {
      title: '',
      posts: [],
      pagination: null,
      featuredImage: null
    }
  };

  // Procesar según el tipo de contenido
  switch (content.type) {
    case 'post':
      result.meta.title = content.data.title || 'Artículo';
      result.meta.featuredImage = content.data.featuredImage?.node || {
        sourceUrl: '',
        altText: ''
      };
      break;

    case 'category':
      // Verificar si tenemos datos de categoría
      if (!content.data) {
        throw new Error('Category data not found');
      }
      
      // Registrar la visita a esta categoría en el cliente
      if (typeof window !== 'undefined') {
        try {
          registerCategoryVisit(content.data.slug);
          console.log(`[useContentResolver] Visita registrada a la categoría: ${content.data.slug}`);
        } catch (error) {
          console.error('[useContentResolver] Error al registrar visita a categoría:', error);
        }
      }
      
      // Obtener posts para esta categoría con paginación
      console.log(`[useContentResolver] Obteniendo posts para categoría ${content.data.slug}, página ${currentPage}`);
      const postsData = await getPostsByCategory(content.data.slug || '', currentPage);
      
      // Procesar los datos de posts
      let posts = [], pagination = null;
      
      if (Array.isArray(postsData)) {
        posts = postsData;
        const totalPosts = posts.length;
        const totalPages = Math.ceil(totalPosts / 9);
        pagination = {
          currentPage,
          totalPages,
          totalPosts,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          prevPage: currentPage > 1 ? currentPage - 1 : null
        };
      } else if (postsData && typeof postsData === 'object') {
        posts = postsData.posts || [];
        pagination = postsData.pagination || null;
      }
      
      // Configurar la paginación con formato de parámetros de consulta
      if (pagination) {
        result.meta.pagination = {
          prev: pagination.hasPreviousPage ? `/${content.data.slug}?page=${pagination.prevPage}` : null,
          next: pagination.hasNextPage ? `/${content.data.slug}?page=${pagination.nextPage}` : null,
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages
        };
        console.log(`[useContentResolver] Paginación configurada: Página ${pagination.currentPage} de ${pagination.totalPages}`);
      } else {
        result.meta.pagination = null;
        console.log(`[useContentResolver] No hay datos de paginación disponibles para ${content.data.slug}`);
      }
      
      // Normalizar y dividir los posts
      result.meta.posts = Array.isArray(posts) ? posts : [];
      result.meta.featuredPosts = result.meta.posts.slice(0, 3);
      result.meta.regularPosts = result.meta.posts.slice(3);
      result.meta.title = `Categoría: ${content.data.name || 'Categoría'}`;
      break;

    case 'page':
      result.meta.title = `Página: ${content.data.title || content.data.slug || 'Página'}`;
      break;

    default:
      throw new Error('Tipo de contenido no soportado');
  }

  return result;
}
