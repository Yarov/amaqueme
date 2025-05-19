/**
 * Calcula el tiempo de lectura aproximado para un contenido
 * @param {string} content - El contenido HTML del post
 * @param {number} wordsPerMinute - Palabras por minuto que lee una persona promedio
 * @returns {number} Tiempo de lectura en minutos
 */
export function getReadingTime(content, wordsPerMinute = 200) {
  if (!content) return 0;
  
  // Eliminar etiquetas HTML
  const text = content.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Contar palabras (dividir por espacios en blanco)
  const wordCount = text.trim().split(/\s+/).length;
  
  // Calcular tiempo de lectura y redondear al minuto superior
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Retornar al menos 1 minuto
  return readingTime < 1 ? 1 : readingTime;
}

/**
 * Formatea el tiempo de lectura para mostrarlo al usuario
 * @param {number} minutes - Tiempo de lectura en minutos
 * @returns {string} Texto formateado para mostrar
 */
export function formatReadingTime(minutes) {
  if (minutes === 1) {
    return '1 minuto de lectura';
  }
  return `${minutes} minutos de lectura`;
}