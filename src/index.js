/**
 * Archivo principal del proyecto Amaqueme
 */

// Función de inicio
function iniciar() {
  console.log("¡Proyecto Amaqueme iniciado correctamente!");
  return true;
}

// Función de ejemplo
function saludar(nombre) {
  return `Hola, ${nombre}! Bienvenido al proyecto Amaqueme.`;
}

// Exportar funciones
module.exports = {
  iniciar,
  saludar
};
