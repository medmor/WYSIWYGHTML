/**
 * Navbar Component
 * Handles the top menu bar with file operations, zoom controls, and theme toggle
 */

/**
 * Creates the navbar HTML structure
 * @returns {string} HTML string for the navbar
 */
export function createNavbarHTML() {
  return `
  <!-- Navbar with DaisyUI -->
  <div class="navbar bg-base-200 border-b border-base-300 px-4 gap-2">
    <!-- File actions -->
    <div class="navbar-start">
      <div class="join">
        <button id="new-file" class="btn btn-ghost btn-sm join-item">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Nouveau
        </button>
        <button id="open-file" class="btn btn-ghost btn-sm join-item">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
          Ouvrir
        </button>
        <button id="save-file" class="btn btn-ghost btn-sm join-item">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Enregistrer
        </button>
        <button id="save-file-as" class="btn btn-ghost btn-sm join-item">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Enregistrer sous
        </button>
      </div>
    </div>
    
    <!-- Zoom controls and actions -->
    <div class="navbar-end gap-2">
      <!-- Preview and Export buttons -->
      <div class="join">
        <button id="preview-toggle" class="btn btn-ghost btn-sm join-item" title="Aperçu pagination A4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Aperçu
        </button>
        <div class="dropdown dropdown-bottom dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-sm join-item" title="Marges de page">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            <span id="current-margin-label">Normal</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
            <li><a data-margin="normal" class="margin-option">Normal (25mm)</a></li>
            <li><a data-margin="big" class="margin-option">Grandes (35mm)</a></li>
            <li><a data-margin="narrow" class="margin-option">Étroites (15mm)</a></li>
            <li class="border-t border-base-300 mt-1 pt-1">
              <a data-margin="custom" class="margin-option">Personnalisées</a>
            </li>
          </ul>
        </div>
        <button id="export-pdf" class="btn btn-ghost btn-sm join-item" title="Exporter en PDF">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          PDF
        </button>
      </div>
      
      <div class="join">
        <button id="zoom-out" class="btn btn-ghost btn-sm join-item" title="Zoom arrière">−</button>
        <span id="zoom-level" class="btn btn-ghost btn-sm join-item pointer-events-none min-w-16">100%</span>
        <button id="zoom-in" class="btn btn-ghost btn-sm join-item" title="Zoom avant">+</button>
        <button id="zoom-reset" class="btn btn-ghost btn-sm join-item" title="Réinitialiser">⟲</button>
      </div>
      
      <!-- Theme toggle -->
      <label class="swap swap-rotate btn btn-ghost btn-circle">
        <input type="checkbox" id="theme-toggle" />
        <svg class="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,0,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
        <svg class="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Z"/></svg>
      </label>
      
      <button id="toggle-ai-sidebar" class="btn btn-primary btn-sm gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        AI
      </button>
    </div>
  </div>`;
}

/**
 * Initializes navbar functionality
 * @param {Object} options - Configuration options
 * @param {Object} options.ipcRenderer - Electron IPC renderer for file operations
 */
export function initNavbar(options = {}) {
  const { ipcRenderer } = options;
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Load saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.checked = savedTheme === 'dark';
    
    // Toggle theme on checkbox change
    themeToggle.addEventListener('change', () => {
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
  
  // Return public API for navbar
  return {
  };
}