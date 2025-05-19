export function getReadingTime(content) {
  const words = content.split(' ').length;
  const minutes = Math.ceil(words / 200);
  return minutes;
}

export function getPostImage(post) {
  return post.featuredImage?.node || {
    url: '',
    alt: ''
  };
}

export function getPostExcerpt(post) {
  return post.excerpt || post.content?.substring(0, 150) + '...';
}

export function getPostContent(post) {
  return post.content || '';
}

export function getPostSEO(post) {
  return {
    title: post.title || '',
    description: getPostExcerpt(post),
    image: getPostImage(post)?.url || ''
  };
}

export function getPostSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: getPostImage(post)?.url || '',
    datePublished: post.date,
    dateModified: post.modified || post.date
  };
}

export function getPostShareLinks(post) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  return [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      icon: '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>'
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${url}&text=${post.title}`,
      icon: '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>'
    }
  ];
}

export function getPostComments(post) {
  return post.comments?.nodes || [];
}

export function getPostAuthor(post) {
  return post.author?.node || {};
}

export function getPostCategories(post) {
  return post.categories?.nodes || [];
}

export function getPostTags(post) {
  return post.tags?.nodes || [];
}

export function getPostDate(post) {
  return post.date || new Date().toISOString();
}

export function getPostRelatedPosts(post) {
  // Esta función debería implementarse con lógica real para obtener posts relacionados
  // Por ahora, devolvemos un array vacío
  return [];
}

export function getPostCanonicalUrl(post) {
  return typeof window !== 'undefined' ? window.location.href : '';
}

export function getPostAlternateUrls(post) {
  return [];
}

export function getPostOpenGraph(post) {
  return {
    title: post.title,
    description: getPostExcerpt(post),
    image: getPostImage(post)?.url || ''
  };
}

export function getPostTwitterCard(post) {
  return {
    title: post.title,
    description: getPostExcerpt(post),
    image: getPostImage(post)?.url || ''
  };
}

export function getPostSchemaType(post) {
  return 'Article';
}

export function getPostSchemaContext(post) {
  return 'https://schema.org';
}

export function getPostSchemaGraph(post) {
  return {};
}

export function getPaginationData({ currentPage, totalPages, pageParam = 'page', category = null }) {
  // Construir la base de la URL
  let baseUrl = '';
  if (category) {
    baseUrl = `/${category}`;
  }

  // Construir objeto de datos de paginación con parámetros de consulta
  return {
    prev: currentPage > 1 ? `${baseUrl}?${pageParam}=${currentPage - 1}` : null,
    next: currentPage < totalPages ? `${baseUrl}?${pageParam}=${currentPage + 1}` : null,
    currentPage,
    totalPages
  };
}
