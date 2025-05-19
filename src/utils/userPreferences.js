/**
 * Utilidades para gestionar las preferencias del usuario, como categorías visitadas
 * Diseñado para funcionar tanto en el cliente como en el servidor
 */

// Clave para almacenar las categorías visitadas en localStorage
const VISITED_CATEGORIES_KEY = 'amaqueme_visited_categories';

// Verificar si estamos en el navegador
const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Registra una visita a una categoría
 * @param {string} categorySlug - Slug de la categoría visitada
 */
export function registerCategoryVisit(categorySlug) {
  if (!categorySlug || !isBrowser()) return;
  
  try {
    // Obtener categorías visitadas del localStorage
    const visitedCategories = getVisitedCategories();
    
    // Actualizar el contador de visitas para esta categoría
    if (visitedCategories[categorySlug]) {
      visitedCategories[categorySlug].count += 1;
      visitedCategories[categorySlug].lastVisit = new Date().toISOString();
    } else {
      visitedCategories[categorySlug] = {
        count: 1,
        lastVisit: new Date().toISOString()
      };
    }
    
    // Guardar en localStorage
    localStorage.setItem(VISITED_CATEGORIES_KEY, JSON.stringify(visitedCategories));
  } catch (error) {
    console.error('Error al registrar visita a categoría:', error);
  }
}

/**
 * Obtiene las categorías visitadas del localStorage
 * @returns {Object} Objeto con las categorías visitadas y sus contadores
 */
export function getVisitedCategories() {
  if (!isBrowser()) return {};
  
  try {
    const stored = localStorage.getItem(VISITED_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error al obtener categorías visitadas:', error);
    return {};
  }
}

/**
 * Obtiene las categorías más visitadas, ordenadas por número de visitas
 * @param {number} limit - Número máximo de categorías a devolver
 * @returns {Array} Array de slugs de categorías ordenados por visitas
 */
export function getMostVisitedCategories(limit = 3) {
  if (!isBrowser()) return [];
  
  const visitedCategories = getVisitedCategories();
  
  // Convertir a array y ordenar por número de visitas (descendente)
  const categoriesArray = Object.entries(visitedCategories)
    .map(([slug, data]) => ({
      slug,
      count: data.count,
      lastVisit: new Date(data.lastVisit)
    }))
    .sort((a, b) => b.count - a.count || b.lastVisit - a.lastVisit);
  
  // Devolver solo los slugs, limitados al número especificado
  return categoriesArray.slice(0, limit).map(item => item.slug);
}

/**
 * Obtiene la categoría más visitada o una categoría por defecto
 * @param {string} defaultCategory - Categoría por defecto si no hay categorías visitadas
 * @returns {string} Slug de la categoría más visitada o la categoría por defecto
 */
export function getMostVisitedCategory(defaultCategory = 'laberinto') {
  if (!isBrowser()) return defaultCategory;
  
  const categories = getMostVisitedCategories(1);
  return categories.length > 0 ? categories[0] : defaultCategory;
}

/**
 * Limpia el historial de categorías visitadas
 */
export function clearVisitedCategories() {
  if (!isBrowser()) return;
  localStorage.removeItem(VISITED_CATEGORIES_KEY);
}
