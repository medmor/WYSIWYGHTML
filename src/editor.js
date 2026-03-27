/**
 * WYSIWYG HTML Editor - CKEditor 5 Integration
 * Uses CKEditor 5 Classic Editor with Essentials plugin
 */

// CKEditor 5 CDN script is loaded via index.html
// This script runs after the CDN script loads

document.addEventListener('DOMContentLoaded', () => {
  // Wait for CKEditor to be available
  const checkEditor = () => {
    if (typeof ClassicEditor !== 'undefined') {
      initializeEditor();
    } else {
      setTimeout(checkEditor, 100);
    }
  };
  
  checkEditor();
});

function initializeEditor() {
  const editorElement = document.querySelector('#editor');
  
  // Initialize CKEditor 5 - use the built-in plugins array from ClassicEditor
  ClassicEditor
    .create(editorElement, {
      toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'undo',
        'redo'
      ],
      licenseKey: 'GPL'
    })
    .then(editor => {
      console.log('Editor initialized successfully!');
      window.editor = editor;
      
      // Expose editor methods to global scope for buttons
      setupButtonHandlers();
    })
    .catch(error => {
      console.error('Editor initialization failed:', error);
    });
}

// Button handlers
function setupButtonHandlers() {
  // New file button
  document.getElementById('new-file')?.addEventListener('click', () => {
    if (window.editor) {
      window.editor.setData('');
      currentFilePath = null;
      updateFilePathDisplay(null);
      console.log('New file created');
    }
  });
  
  // Open file button
  document.getElementById('open-file')?.addEventListener('click', () => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('open-file');
    
    ipcRenderer.once('file-opened', (event, result) => {
      if (result.success) {
        if (window.editor) {
          window.editor.setData(result.content);
          updateFilePathDisplay(result.filePath);
          currentFilePath = result.filePath;
          console.log('File opened:', result.filePath);
        }
      } else {
        alert('Error opening file: ' + result.error);
      }
    });
  });
  
  // Save file button
  document.getElementById('save-file')?.addEventListener('click', () => {
    if (!window.editor) return;
    
    const content = window.editor.getData();
    const { ipcRenderer } = require('electron');
    
    if (currentFilePath) {
      // Save to existing file
      ipcRenderer.send('save-file', content);
      
      ipcRenderer.once('file-saved', (event, result) => {
        if (result.success) {
          updateFilePathDisplay(result.filePath);
          console.log('File saved:', result.filePath);
          alert('File saved successfully!');
        } else {
          alert('Error saving file: ' + result.error);
        }
      });
    } else {
      // No file open, prompt for save location
      saveAs();
    }
  });
  
  // Save As button
  function saveAs() {
    if (!window.editor) return;
    
    const content = window.editor.getData();
    const { ipcRenderer } = require('electron');
    
    ipcRenderer.send('save-file', content);
    
    ipcRenderer.once('file-saved', (event, result) => {
      if (result.success) {
        currentFilePath = result.filePath;
        updateFilePathDisplay(result.filePath);
        console.log('File saved as:', result.filePath);
        alert('File saved successfully!');
      } else {
        alert('Error saving file: ' + result.error);
      }
    });
  }
  
  document.getElementById('save-file-as')?.addEventListener('click', saveAs);
}

// Update file path display
function updateFilePathDisplay(filePath) {
  const pathElement = document.getElementById('current-file-path');
  if (pathElement) {
    pathElement.textContent = filePath ? 'Opened: ' + filePath : 'No file open';
  }
}

// Store current file path
let currentFilePath = null;
