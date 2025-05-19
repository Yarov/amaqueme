/**
 * Utilidad para manejar el modo oscuro
 * 
 * Este script maneja la configuración y cambio entre modos claro y oscuro
 * utilizando localStorage para persistir la preferencia del usuario.
 */

// Función para configurar el modo oscuro en todo el sitio
export function setupDarkMode() {
  // Comprobar si debe estar en modo oscuro basado en:
  // 1. Preferencia guardada en localStorage
  // 2. Preferencia del sistema si no hay configuración guardada
  const isDarkMode = 
    localStorage.getItem('darkMode') === 'true' || 
    (
      !localStorage.getItem('darkMode') && 
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  
  // Aplicar el modo oscuro si es necesario
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    document.getElementById('dark-mode-toggle')?.setAttribute('aria-checked', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('dark-mode-toggle')?.setAttribute('aria-checked', 'false');
  }
  
  // Escuchar cambios en la preferencia del sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (!localStorage.getItem('darkMode')) {
      // Solo cambiar automáticamente si el usuario no ha establecido una preferencia
      if (event.matches) {
        document.documentElement.classList.add('dark');
        document.getElementById('dark-mode-toggle')?.setAttribute('aria-checked', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('dark-mode-toggle')?.setAttribute('aria-checked', 'false');
      }
    }
  });
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
