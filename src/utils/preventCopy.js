/**
 * Script para prevenir la copia de contenido del sitio
 * Deshabilita el comando de copiar (Ctrl+C/Cmd+C) y el menú contextual del clic derecho
 */

export function setupCopyProtection() {
  // Prevenir el comando de copiar (Ctrl+C/Cmd+C)
  document.addEventListener('keydown', function(event) {
    // Permitir copiar en campos de formulario
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return true;
    }
    
    // Prevenir Ctrl+C, Cmd+C
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      return false;
    }
  });

  // Prevenir el menú contextual (clic derecho)
  document.addEventListener('contextmenu', function(event) {
    // Permitir el menú contextual en campos de formulario
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return true;
    }
    
    event.preventDefault();
    return false;
  });

  // Prevenir la selección de texto
  document.addEventListener('selectstart', function(event) {
    // Permitir selección en campos de formulario
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return true;
    }
    
    event.preventDefault();
    return false;
  });

  // Deshabilitar el comando de copiar del navegador
  document.addEventListener('copy', function(event) {
    // Permitir copiar en campos de formulario
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return true;
    }
    
    event.preventDefault();
    return false;
  });

  console.log('Protección contra copia activada');
}
