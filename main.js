const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const { grammalecteServer } = require('./grammalecte-server');

let mainWindow;
let previewWindow = null;
let currentFilePath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: true
    },
    backgroundColor: '#ffffff',
    autoHideMenuBar: true
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('index.html');
  }
}

function createPreviewWindow() {
  if (previewWindow && !previewWindow.isDestroyed()) {
    previewWindow.focus();
    return previewWindow;
  }
  
  previewWindow = new BrowserWindow({
    width: 900,
    height: 1100,
    parent: mainWindow,
    title: 'Aperçu - Pagination A4',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#f0f0f0'
  });
  
  previewWindow.loadFile('preview.html');
  
  previewWindow.on('closed', () => {
    previewWindow = null;
    // Notify renderer that preview was closed
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('preview-closed');
    }
  });
  
  return previewWindow;
}

app.whenReady().then(async () => {
  // Load persisted state
  store.loadState();
  currentFilePath = store.get('lastFilePath');
  
  // Start Grammalecte server automatically
  try {
    console.log('[Main] Starting Grammalecte server...');
    await grammalecteServer.start(8085);
    console.log('[Main] Grammalecte server started successfully');
  } catch (err) {
    console.error('[Main] Failed to start Grammalecte server:', err);
  }
  
  createWindow();
  
  // Set spell check languages (French and English)
  const { session } = require('electron');
  session.defaultSession.setSpellCheckerLanguages(['fr', 'en-US']);
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Stop Grammalecte server when app is quitting
app.on('will-quit', () => {
  console.log('[Main] Stopping Grammalecte server...');
  grammalecteServer.stop();
});

// IPC handlers for file operations
ipcMain.on('open-file', (event) => {
  const defaultPath = store.getLastFileDir() || undefined;
  dialog.showOpenDialog(mainWindow, {
    defaultPath,
    properties: ['openFile'],
    filters: [
      { name: 'HTML Files', extensions: ['html', 'htm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          event.sender.send('file-opened', { success: false, error: err.message });
          return;
        }
        currentFilePath = filePath;
        store.set('lastFilePath', filePath);
        event.sender.send('file-opened', { success: true, content: data, filePath: filePath });
      });
    }
  });
});

ipcMain.on('save-file', (event, content) => {
  if (currentFilePath) {
    fs.writeFile(currentFilePath, content, 'utf8', (err) => {
      if (err) {
        event.sender.send('file-saved', { success: false, error: err.message });
        return;
      }
      store.set('lastFilePath', currentFilePath);
      event.sender.send('file-saved', { success: true, filePath: currentFilePath });
    });
  } else {
    const defaultPath = store.getLastFileDir() || undefined;
    dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: [
        { name: 'HTML Files', extensions: ['html', 'htm'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }).then(result => {
      if (!result.canceled && result.filePath) {
        currentFilePath = result.filePath;
        fs.writeFile(result.filePath, content, 'utf8', (err) => {
          if (err) {
            event.sender.send('file-saved', { success: false, error: err.message });
            return;
          }
          store.set('lastFilePath', result.filePath);
          event.sender.send('file-saved', { success: true, filePath: result.filePath });
        });
      }
    });
  }
});

ipcMain.on('save-file-as', (event, content) => {
  const defaultPath = store.getLastFileDir() || undefined;
  dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'HTML Files', extensions: ['html', 'htm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      currentFilePath = result.filePath;
      fs.writeFile(result.filePath, content, 'utf8', (err) => {
        if (err) {
          event.sender.send('file-saved', { success: false, error: err.message });
          return;
        }
        store.set('lastFilePath', result.filePath);
        event.sender.send('file-saved', { success: true, filePath: result.filePath });
      });
    }
  });
});

// PDF export window
let pdfWindow = null;
let pdfMargins = { top: 25, right: 25, bottom: 25, left: 25 }; // Default margins

ipcMain.on('show-pdf-export', (event, data) => {
  // Store margins for later use in PDF export
  if (data.margins) {
    pdfMargins = data.margins;
  }

  // Create a new browser window for PDF export
  pdfWindow = new BrowserWindow({
    width: 800,
    height: 1000,
    title: 'Exporter en PDF',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  pdfWindow.loadFile('print.html');

  // Wait for window to load, then send content
  pdfWindow.webContents.once('did-finish-load', () => {
    console.log('[Main] PDF window finished loading, sending content');
    pdfWindow.webContents.send('print-content', {
      content: data.content,
      styles: data.styles,
      margins: data.margins
    });
  });

  pdfWindow.on('closed', () => {
    pdfWindow = null;
  });
});

// Save to PDF directly
ipcMain.handle('save-to-pdf', async (event) => {
  console.log('[Main] ========== save-to-pdf invoked ==========');
  
  if (!pdfWindow || pdfWindow.isDestroyed()) {
    console.log('[Main] Cannot save - window not available');
    return { success: false, error: 'Window not available' };
  }

  const { dialog } = require('electron');
  
  try {
    const { filePath } = await dialog.showSaveDialog(pdfWindow, {
      title: 'Enregistrer en PDF',
      defaultPath: 'document.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    
    if (!filePath) {
      return { success: false, error: 'Cancelled' };
    }
    
    const pdfData = await pdfWindow.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: {
        top: pdfMargins.top * 0.0393701, // mm to inches
        bottom: pdfMargins.bottom * 0.0393701,
        left: pdfMargins.left * 0.0393701,
        right: pdfMargins.right * 0.0393701,
        marginType: 'custom'
      }
    });
    
    const fs = require('fs');
    fs.writeFileSync(filePath, pdfData);
    console.log('[Main] PDF saved to:', filePath);
    
    return { success: true, filePath };
  } catch (err) {
    console.error('[Main] PDF save error:', err);
    return { success: false, error: err.message };
  }
});

// Show PDF export window
ipcMain.on('show-preview', (event, data) => {
  const win = createPreviewWindow();
  
  // Wait for window to load, then send content
  win.webContents.once('did-finish-load', () => {
    win.webContents.send('preview-content', { 
      content: data.content,
      margins: data.margins
    });
  });
});

// Print from preview window
ipcMain.on('print-from-preview', (event) => {
  if (previewWindow && !previewWindow.isDestroyed()) {
    previewWindow.webContents.print();
  }
});

// Refresh preview content
ipcMain.on('refresh-preview', (event, data) => {
  if (previewWindow && !previewWindow.isDestroyed()) {
    previewWindow.webContents.send('refresh-preview-content', data);
  }
});

// ============================================
// Grammalecte Grammar Checker IPC Handlers
// ============================================

// Start Grammalecte server
ipcMain.handle('grammalecte-start', async (event) => {
  console.log('[Main] grammalecte-start IPC handler called');
  try {
    console.log('[Main] Starting grammalecte server on port 8085...');
    await grammalecteServer.start(8085);
    console.log('[Main] Grammalecte server started successfully');
    return { success: true };
  } catch (err) {
    console.error('[Main] Failed to start Grammalecte:', err);
    return { success: false, error: err.message };
  }
});

// Stop Grammalecte server
ipcMain.handle('grammalecte-stop', async (event) => {
  try {
    grammalecteServer.stop();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Check grammar for text
ipcMain.handle('grammalecte-check', async (event, text, options) => {
  console.log('[Main] grammalecte-check IPC handler called');
  console.log('[Main] Text length:', text?.length || 0);
  console.log('[Main] Text preview:', text?.substring(0, 100));
  try {
    console.log('[Main] Calling grammalecteServer.checkGrammar()...');
    const result = await grammalecteServer.checkGrammar(text, options);
    console.log('[Main] Check result:', JSON.stringify(result, null, 2));
    return { success: true, result };
  } catch (err) {
    console.error('[Main] Grammalecte check failed:', err);
    return { success: false, error: err.message };
  }
});

// Get spelling suggestions for a word
ipcMain.handle('grammalecte-suggest', async (event, word) => {
  try {
    const result = await grammalecteServer.getSuggestions(word);
    return { success: true, result };
  } catch (err) {
    console.error('[Grammalecte] Suggestion failed:', err);
    return { success: false, error: err.message };
  }
});

// Get grammar options
ipcMain.handle('grammalecte-get-options', async (event) => {
  try {
    const result = await grammalecteServer.getOptions();
    return { success: true, result };
  } catch (err) {
    console.error('[Grammalecte] Get options failed:', err);
    return { success: false, error: err.message };
  }
});

// Set grammar options
ipcMain.handle('grammalecte-set-options', async (event, options) => {
  try {
    const result = await grammalecteServer.setOptions(options);
    return { success: true, result };
  } catch (err) {
    console.error('[Grammalecte] Set options failed:', err);
    return { success: false, error: err.message };
  }
});
