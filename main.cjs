const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let currentFilePath = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#ffffff',
    autoHideMenuBar: true
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile('index.html');
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
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
    // Save to existing file
    fs.writeFile(currentFilePath, content, 'utf8', (err) => {
      if (err) {
        event.sender.send('file-saved', { success: false, error: err.message });
        return;
      }
      event.sender.send('file-saved', { success: true, filePath: currentFilePath });
    });
  } else {
    // Save as new file
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

ipcMain.on('get-current-file-path', (event) => {
  event.sender.send('current-file-path', currentFilePath);
});
