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

// Export to PDF
ipcMain.on('export-pdf', async (event, content) => {
  const defaultPath = store.getLastFileDir() || undefined;
  const pdfPath = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!pdfPath.canceled && pdfPath.filePath) {
    try {
      // Create a temporary HTML file with print styles
      const tempHtmlPath = path.join(app.getPath('temp'), 'print-preview.html');
      const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print Preview</title>
  <style>
    @page {
      size: A4;
      margin: 25mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
    }
    ${content}
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
      
      fs.writeFileSync(tempHtmlPath, printHtml, 'utf8');
      
      // Load the content and print to PDF
      await mainWindow.loadFile(tempHtmlPath);
      
      const pdfData = await mainWindow.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: false,
        margins: {
          top: 25,
          bottom: 25,
          left: 25,
          right: 25
        }
      });

      fs.writeFileSync(pdfPath.filePath, pdfData);
      
      // Reload the editor
      mainWindow.loadFile('index.html');
      
      event.sender.send('pdf-exported', { success: true, filePath: pdfPath.filePath });
    } catch (error) {
      event.sender.send('pdf-exported', { success: false, error: error.message });
    }
  }
});

// Show preview in separate window
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
