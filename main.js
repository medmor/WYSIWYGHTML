const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');

let mainWindow;
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

app.whenReady().then(() => {
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
  dialog.showOpenDialog(mainWindow, {
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
      event.sender.send('file-saved', { success: true, filePath: currentFilePath });
    });
  } else {
    dialog.showSaveDialog(mainWindow, {
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
          event.sender.send('file-saved', { success: true, filePath: result.filePath });
        });
      }
    });
  }
});

ipcMain.on('save-file-as', (event, content) => {
  dialog.showSaveDialog(mainWindow, {
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
        event.sender.send('file-saved', { success: true, filePath: result.filePath });
      });
    }
  });
});
