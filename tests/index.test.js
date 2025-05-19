/**
 * Tests para las funciones principales
 */

const { iniciar, saludar } = require('../src/index');

// Test para la función iniciar
console.log("Probando función iniciar...");
const resultadoIniciar = iniciar();
console.assert(resultadoIniciar === true, "La función iniciar debería retornar true");

// Test para la función saludar
console.log("Probando función saludar...");
const resultadoSaludar = saludar("Usuario");
console.assert(resultadoSaludar === "Hola, Usuario! Bienvenido al proyecto Amaqueme.", 
  "La función saludar no devolvió el mensaje esperado");

console.log("¡Todas las pruebas completadas!");
