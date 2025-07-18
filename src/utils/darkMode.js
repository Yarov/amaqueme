/**
 * Utilidad para manejar el modo oscuro
 * 
 * Este script maneja la configuración y cambio entre modos claro y oscuro
 * utilizando localStorage para persistir la preferencia del usuario.
 */

// Función para configurar el modo oscuro en todo el sitio
export function setupDarkMode() {
  // Comprobar si debe estar en modo oscuro basado únicamente en la preferencia guardada
  // Siempre usar modo claro por defecto
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Si no hay preferencia guardada, establecer explícitamente el modo claro
  if (!localStorage.getItem('darkMode')) {
    localStorage.setItem('darkMode', 'false');
  }
  
  // Aplicar el modo oscuro si es necesario, o asegurar el modo claro
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    document.getElementById('dark-mode-toggle')?.setAttribute('aria-checked', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('dark-mode-toggle')?.setAttribute('aria-checked', 'false');
  }
  
  // Ya no escuchamos cambios en la preferencia del sistema
  // El modo siempre será el que el usuario haya seleccionado explícitamente
  // o claro por defecto
}

// Función para cambiar entre modos claro y oscuro
export function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark.toString());
  
  // Actualizar el estado del botón
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.setAttribute('aria-checked', isDark.toString());
  }
  
  return isDark;
}
