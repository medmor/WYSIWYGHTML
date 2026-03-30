const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const store = require('./store');

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

app.whenReady().then(() => {
  // Load persisted state
  store.loadState();
  currentFilePath = store.get('lastFilePath');
  
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
