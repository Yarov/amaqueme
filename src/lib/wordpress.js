import { request, gql } from 'graphql-request';
import { resolveUrlType } from './urlTypeResolver';

const WORDPRESS_API_URL = 'https://api.amaqueme.mx/graphql';

// Configuración de los headers para las solicitudes a la API
const requestHeaders = {
  'User-Agent': 'AstroClient',
  'Content-Type': 'application/json'
};

// Exportamos la URL y headers para que puedan ser usados por urlTypeResolver
export { WORDPRESS_API_URL, requestHeaders };

export async function getCategories() {
  const query = gql`
    query GetCategories {
      categories(first: 100) {
        nodes {
          id
          name
          slug
          description
        }
      }
    }
  `;

  const result = await request(WORDPRESS_API_URL, query, null, requestHeaders);
  return result.categories.nodes;
}

export async function getAllPosts(page = 1, postsPerPage = 12) {
  console.log(`Obteniendo todos los posts, página: ${page}, posts por página: ${postsPerPage}`);

  // Consulta para obtener posts (limitado a 100)
  const query = gql`
    query GetAllPosts {
      posts(first: 100) {
        nodes {
          id
          title
          slug
          date
          excerpt
          content
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
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  try {
    // Realizar la consulta para obtener los posts
    const result = await request(
      WORDPRESS_API_URL,
      query,
      null,
      requestHeaders
    );

    // Verificar si tenemos resultados
    if (!result.posts || !result.posts.nodes) {
      console.error('No se encontraron posts');
      return {
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          nextPage: null,
          prevPage: null
        }
      };
    }

    // Obtener los posts
    const allPosts = result.posts.nodes || [];

    // Obtener el conteo total de posts
    const totalPosts = allPosts.length;

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    console.log(`Total de posts: ${totalPosts}, Total de páginas: ${totalPages}, Página actual: ${page}`);

    // Obtener los posts para la página actual
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const posts = allPosts.slice(startIndex, endIndex);

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    };
  } catch (error) {
    console.error('Error al obtener todos los posts:', error);
    return {
      posts: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: null,
        prevPage: null
      }
    };
  }
}

export async function getPostsByCategory(categorySlug, page = 1, postsPerPage = 12) {
  console.log(`Obteniendo posts para la categoría: ${categorySlug}, página: ${page}, posts por página: ${postsPerPage}`);

  if (!categorySlug) {
    console.error('getPostsByCategory: categorySlug es requerido');
    return {
      posts: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: null,
        prevPage: null
      }
    };
  }

  // Calcular cuántos posts necesitamos obtener para la página actual
  const postsToFetch = page * postsPerPage;

  // Consulta para obtener posts de una categoría usando paginación basada en cursores
  const query = gql`
    query GetPostsByCategory($categoryName: String!, $first: Int!) {
      posts(where: {categoryName: $categoryName}, first: $first) {
        nodes {
          id
          title
          slug
          date
          excerpt
          content
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
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      # Consulta adicional para obtener la categoría y su conteo de posts
      categories(where: {slug: [$categoryName]}) {
        nodes {
          name
          slug
          count
        }
      }
    }
  `;

  try {
    // Realizar la consulta para obtener los posts de la categoría para la página actual
    const result = await request(
      WORDPRESS_API_URL,
      query,
      { categoryName: categorySlug, first: postsToFetch },
      requestHeaders
    );

    // Verificar si tenemos resultados
    if (!result.posts || !result.posts.nodes) {
      console.error(`No se encontraron posts para la categoría ${categorySlug}`);
      return {
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          nextPage: null,
          prevPage: null
        }
      };
    }

    // Obtener los posts de la categoría
    const allPosts = result.posts.nodes || [];

    // Obtener información de paginación de la API
    const hasNextPage = result.posts.pageInfo?.hasNextPage || false;
    const endCursor = result.posts.pageInfo?.endCursor || null;

    // Obtener el conteo total de posts de la categoría
    let totalPosts = allPosts.length; // Por defecto, usamos lo que tenemos

    // Intentar obtener el conteo real de la categoría
    if (result.categories && result.categories.nodes && result.categories.nodes.length > 0) {
      const categoryInfo = result.categories.nodes[0];
      if (categoryInfo && typeof categoryInfo.count === 'number') {
        totalPosts = categoryInfo.count;
        console.log(`Conteo real de posts para la categoría ${categorySlug}: ${totalPosts}`);
      }
    }

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    // Obtener los posts para la página actual
    // Si estamos en la página 1, tomamos los primeros postsPerPage posts
    // Si estamos en otra página, tomamos los últimos postsPerPage posts
    let posts;
    if (page === 1) {
      posts = allPosts.slice(0, postsPerPage);
    } else {
      // Tomamos los últimos postsPerPage posts (que corresponden a la página actual)
      posts = allPosts.slice(-postsPerPage);
    }

    console.log(`Categoría ${categorySlug}: Total de posts: ${totalPosts}, Total de páginas: ${totalPages}, Página actual: ${page}, HasNextPage: ${hasNextPage}`);

    // Si estamos intentando acceder a una página que está más allá de los posts que tenemos
    // pero sabemos que hay más posts (por el conteo de la categoría)
    if (posts.length === 0 && page > 1 && (page - 1) * postsPerPage < totalPosts) {
      console.warn(`Intentando acceder a la página ${page} pero solo tenemos ${allPosts.length} posts cargados. Hay ${totalPosts} posts en total en la categoría.`);
    }

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    };
  } catch (error) {
    console.error(`Error al obtener posts para la categoría ${categorySlug}:`, error);
    return {
      posts: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: null,
        prevPage: null
      }
    };
  }
}

export async function getPostBySlug(slug) {
  console.log(`Obteniendo post con slug: ${slug}`);

  if (!slug) {
    console.error('getPostBySlug: slug es requerido');
    return null;
  }

  const query = gql`
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        title
        slug
        date
        content
        excerpt
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
    const result = await request(WORDPRESS_API_URL, query, { slug }, requestHeaders);

    if (result?.post) {
      return result.post;
    }

    console.log(`No se encontró ningún post con slug: ${slug}`);
    return null;
  } catch (error) {
    console.error(`Error al obtener post con slug ${slug}:`, error);
    return null;
  }
}

export async function getPost(slug) {
  // Esta función es un alias para getPostBySlug para mantener compatibilidad
  return await getPostBySlug(slug);
}

export async function getAllCategories() {
  const query = gql`
    query GetAllCategories {
      categories(first: 100) {
        nodes {
          id
          name
          slug
          count
        }
      }
    }
  `;

  const result = await request(WORDPRESS_API_URL, query, null, requestHeaders);
  return result.categories.nodes;
}

export async function getContentBySlug(slug) {
  console.log(`[getContentBySlug] Esta función está obsoleta. Usando urlTypeResolver...`);
  return await resolveUrlType(slug);
}

export async function getFeaturedPostsWithImages() {
  const query = gql`
    query GetFeaturedPostsWithImages {
      posts(first: 5, where: { orderby: { field: DATE, order: DESC } }) {
        nodes {
          id
          title
          slug
          date
          excerpt
          content
          featuredImage {
            node {
              id
              sourceUrl(size: LARGE)
              altText
              mediaDetails {
                width
                height
              }
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
    }
  `;

  try {
    const result = await request(WORDPRESS_API_URL, query, null, requestHeaders);
    return result.posts.nodes;
  } catch (error) {
    console.error("Error fetching featured posts with images:", error);
    return [];
  }
}

export async function getMenuItems() {

  const query = gql`
    query MenuQuery {
      menu(id: "dGVybToy") {
        menuItems(first: 100) {
          nodes {
            id
            label
            path
            parentId
            connectedNode {
              node {
                ... on Page {
                  slug
                  isPostsPage
                }
                ... on Category {
                  slug
                  uri
                }
                ... on Post {
                  slug
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const result = await request(WORDPRESS_API_URL, query, null, requestHeaders);
    const nodes = result.menu.menuItems.nodes || [];
    console.log(result);

    // Crear un mapa para acceder rápidamente a los items por su ID
    const itemsById = new Map(nodes.map(item => [item.id, item]));

    // Normalizar las URLs para que sean compatibles con nuestra estructura
    const normalizeUrl = (item) => {
      // Si no hay información del nodo conectado, usar la ruta original
      if (!item.connectedNode?.node) {
        return item.path || '/';
      }

      const node = item.connectedNode.node;

      // Detectar el tipo de nodo y formatear la URL adecuadamente
      if (node.isPostsPage) {
        // Si es la página de posts, usar la ruta raíz
        return '/';
      } else if (node.slug) {
        // Si tiene slug, usarlo directamente
        return `/${node.slug}`;
      }

      // Si todo lo demás falla, usar la ruta original
      return item.path || '/';
    };

    // Función para construir la jerarquía recursivamente
    const buildHierarchy = (parentId = null) => {
      return nodes
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          path: normalizeUrl(item),
          childItems: {
            nodes: buildHierarchy(item.id)
          }
        }));
    };

    return buildHierarchy();
  } catch (error) {
    console.error('Error fetching menu items:', error);
    console.error('Error details:', error.message, error.stack);
    return [];
  }
}
