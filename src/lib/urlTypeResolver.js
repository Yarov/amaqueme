/**
 * Utilidad para determinar el tipo de URL de forma simple y directa
 */
import { gql, request } from 'graphql-request';
import { WORDPRESS_API_URL, requestHeaders } from './wordpress';

// Caché para evitar consultas repetidas
const cache = {
  categories: null,
  pages: null,
  posts: null
};

/**
 * Verifica si un slug corresponde a una categoría
 * @param {string} slug - El slug a verificar
 * @returns {Promise<Object|null>} - Datos de la categoría o null si no existe
 */
export async function getCategoryBySlug(slug) {
  // Normalizar el slug
  const normalizedSlug = slug.toLowerCase().trim();
  
  // Verificar primero en el caché
  if (cache.categories) {
    const cachedCategory = cache.categories.find(c => 
      c.slug.toLowerCase() === normalizedSlug ||
      (c.uri && c.uri.replace(/^\/|\/$/g, '').toLowerCase() === normalizedSlug)
    );
    
    if (cachedCategory) {
      return cachedCategory;
    }
  }

  // Consulta directa por slug
  const query = gql`
    query GetCategoryBySlug($slug: ID!) {
      category(id: $slug, idType: SLUG) {
        id
        name
        slug
        uri
      }
    }
  `;

  try {
    const result = await request(WORDPRESS_API_URL, query, { slug: normalizedSlug }, requestHeaders);
    
    if (result?.category) {
      // Guardar en caché para futuras consultas
      if (!cache.categories) {
        cache.categories = [];
      }
      
      // Evitar duplicados
      if (!cache.categories.some(c => c.id === result.category.id)) {
        cache.categories.push(result.category);
      }
      
      return result.category;
    }
    
    return null;
  } catch (error) {
    console.error(`Error verificando categoría para slug '${slug}':`, error);
    return null;
  }
}

/**
 * Verifica si un slug corresponde a una página
 * @param {string} slug - El slug a verificar
 * @returns {Promise<Object|null>} - Datos de la página o null si no existe
 */
export async function getPageBySlug(slug) {
  // Normalizar el slug
  const normalizedSlug = slug.toLowerCase().trim();
  
  // Verificar primero en el caché
  if (cache.pages) {
    const cachedPage = cache.pages.find(p => 
      p.slug.toLowerCase() === normalizedSlug ||
      (p.uri && p.uri.replace(/^\/|\/$/g, '').toLowerCase() === normalizedSlug)
    );
    
    if (cachedPage) {
      return cachedPage;
    }
  }

  // Consulta directa por slug
  const query = gql`
    query GetPageBySlug($slug: ID!) {
      page(id: $slug, idType: URI) {
        id
        title
        slug
        uri
      }
    }
  `;

  try {
    const result = await request(WORDPRESS_API_URL, query, { slug: normalizedSlug }, requestHeaders);
    
    if (result?.page) {
      // Guardar en caché para futuras consultas
      if (!cache.pages) {
        cache.pages = [];
      }
      
      // Evitar duplicados
      if (!cache.pages.some(p => p.id === result.page.id)) {
        cache.pages.push(result.page);
      }
      
      return result.page;
    }
    
    return null;
  } catch (error) {
    console.error(`Error verificando página para slug '${slug}':`, error);
    return null;
  }
}

/**
 * Verifica si un slug corresponde a un post
 * @param {string} slug - El slug a verificar
 * @returns {Promise<Object|null>} - Datos del post o null si no existe
 */
export async function getPostBySlug(slug) {
  // Normalizar el slug
  const normalizedSlug = slug.toLowerCase().trim();
  
  // Verificar primero en el caché
  if (cache.posts) {
    const cachedPost = cache.posts.find(p => 
      p.slug.toLowerCase() === normalizedSlug ||
      (p.uri && p.uri.replace(/^\/|\/$/g, '').toLowerCase() === normalizedSlug)
    );
    
    if (cachedPost) {
      return cachedPost;
    }
  }

  // Consulta directa por slug con contenido completo
  const query = gql`
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        title
        slug
        uri
        content
        excerpt
        date
        featuredImage {
          node {
            id
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  `;

  try {
    const result = await request(WORDPRESS_API_URL, query, { slug: normalizedSlug }, requestHeaders);
    
    if (result?.post) {
      // Guardar en caché para futuras consultas
      if (!cache.posts) {
        cache.posts = [];
      }
      
      // Evitar duplicados
      if (!cache.posts.some(p => p.id === result.post.id)) {
        cache.posts.push(result.post);
      }
      
      return result.post;
    }
    
    return null;
  } catch (error) {
    console.error(`Error verificando post para slug '${slug}':`, error);
    return null;
  }
}

/**
 * Determina el tipo de URL consultando directamente por el slug
 * @param {string} slug - El slug a verificar
 * @returns {Promise<{type: string, data: Object}>} - Tipo y datos del contenido
 */
export async function resolveUrlType(slug) {
  console.log(`[resolveUrlType] Resolviendo tipo para: '${slug}'`);
  
  if (!slug) {
    return { type: 'home', data: null };
  }
  
  // Mapa de categorías especiales que sabemos que existen pero podrían no aparecer en consultas normales
  const specialCategories = {
    'seguridad': { id: 'dGVybTo5', name: 'Seguridad', slug: 'seguridad', uri: '/seguridad/' },
    'sociedad': { id: 'dGVybToxMg==', name: 'Sociedad', slug: 'sociedad', uri: '/sociedad/' },
    'cultura': { id: 'dGVybToyNg==', name: 'Cultura', slug: 'cultura', uri: '/cultura/' },
    'educacion': { id: 'dGVybToxNw==', name: 'Educación', slug: 'educacion', uri: '/educacion/' }
  };
  
  // Normalizar el slug
  const normalizedSlug = slug.toLowerCase().trim();
  
  // Verificar si es una categoría especial conocida
  if (specialCategories[normalizedSlug]) {
    console.log(`[resolveUrlType] '${slug}' es una CATEGORÍA ESPECIAL: ${specialCategories[normalizedSlug].name}`);
    return { type: 'category', data: specialCategories[normalizedSlug] };
  }
  
  // 1. Verificar si es una categoría
  const category = await getCategoryBySlug(normalizedSlug);
  if (category) {
    console.log(`[resolveUrlType] '${slug}' es una CATEGORÍA: ${category.name}`);
    return { type: 'category', data: category };
  }
  
  // 2. Verificar si es una página
  const page = await getPageBySlug(normalizedSlug);
  if (page) {
    console.log(`[resolveUrlType] '${slug}' es una PÁGINA: ${page.title}`);
    return { type: 'page', data: page };
  }
  
  // 3. Verificar si es un post
  const post = await getPostBySlug(normalizedSlug);
  if (post) {
    console.log(`[resolveUrlType] '${slug}' es un POST: ${post.title}`);
    return { type: 'post', data: post };
  }
  
  // Intento adicional: buscar por URI en lugar de slug
  try {
    const uriQuery = gql`
      query GetContentByURI($uri: String!) {
        nodeByUri(uri: $uri) {
          ... on Category {
            id
            name
            slug
            uri
            __typename
          }
          ... on Page {
            id
            title
            slug
            uri
            __typename
          }
          ... on Post {
            id
            title
            slug
            uri
            content
            excerpt
            date
            featuredImage {
              node {
                id
                sourceUrl
                altText
              }
            }
            categories {
              nodes {
                name
                slug
              }
            }
            __typename
          }
        }
      }
    `;
    
    // Asegurarse de que la URI comience con /
    let uri = normalizedSlug;
    if (!uri.startsWith('/')) {
      uri = '/' + uri;
    }
    // Asegurarse de que termine con /
    if (!uri.endsWith('/')) {
      uri = uri + '/';
    }
    
    const result = await request(WORDPRESS_API_URL, uriQuery, { uri }, requestHeaders);
    
    if (result?.nodeByUri) {
      const node = result.nodeByUri;
      
      if (node.__typename === 'Category') {
        console.log(`[resolveUrlType] '${slug}' es una CATEGORÍA (por URI): ${node.name}`);
        return { type: 'category', data: node };
      } else if (node.__typename === 'Page') {
        console.log(`[resolveUrlType] '${slug}' es una PÁGINA (por URI): ${node.title}`);
        return { type: 'page', data: node };
      } else if (node.__typename === 'Post') {
        console.log(`[resolveUrlType] '${slug}' es un POST (por URI): ${node.title}`);
        return { type: 'post', data: node };
      }
    }
  } catch (error) {
    console.error(`[resolveUrlType] Error en búsqueda por URI para '${slug}':`, error);
  }
  
  // Si llegamos aquí, no pudimos determinar el tipo
  console.log(`[resolveUrlType] No se pudo determinar el tipo para: '${slug}'`);
  return { type: 'unknown', data: { slug } };
}
