const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	openFile: () => ipcRenderer.send('open-file'),
	saveFile: (content) => ipcRenderer.send('save-file', content),
	saveFileAs: (content) => ipcRenderer.send('save-file-as', content),
	showPdfExport: (data) => ipcRenderer.send('show-pdf-export', data),
	closeWindow: () => ipcRenderer.send('close-window'),
	cancelClose: () => ipcRenderer.send('cancel-close'),

	onFileOpened: (callback) => {
		ipcRenderer.on('file-opened', (event, data) => callback(data));
	},
	onFileSaved: (callback) => {
		ipcRenderer.on('file-saved', (event, data) => callback(data));
	},
	onShortcutNewFile: (callback) => {
		ipcRenderer.on('shortcut-new-file', () => callback());
	},
	onCheckUnsaved: (callback) => {
		ipcRenderer.on('check-unsaved', () => callback());
	},
	onPrintContent: (callback) => {
		ipcRenderer.on('print-content', (event, data) => callback(data));
	},

	grammalecteStart: () => ipcRenderer.invoke('grammalecte-start'),
	grammalecteStop: () => ipcRenderer.invoke('grammalecte-stop'),
	grammalecteCheck: (text, options) => ipcRenderer.invoke('grammalecte-check', text, options),
	grammalecteSuggest: (word) => ipcRenderer.invoke('grammalecte-suggest', word),
	grammalecteGetOptions: () => ipcRenderer.invoke('grammalecte-get-options'),
	grammalecteSetOptions: (options) => ipcRenderer.invoke('grammalecte-set-options', options),

	saveToPdf: (margins) => ipcRenderer.invoke('save-to-pdf', margins)
});