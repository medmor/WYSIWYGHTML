# WYSIWYG HTML Editor

A WYSIWYG (What You See Is What You Get) HTML editor built with Electron, CKEditor 5, and Vite.

## Features

- **CKEditor 5 Decoupled Editor** - Professional WYSIWYG editing experience
- **French language support** - Full French interface
- **Rich Text Formatting** - Bold, italic, link, lists, headings, tables, images, etc.
- **Undo/Redo** - Full history management
- **File Operations** - Open, Save, Save As, New file
- **Modern UI** - Clean and intuitive interface
- **Cross-platform** - Works on Linux, Windows, and macOS

## Installation

```bash
npm install
```

## Usage

### Development Mode (with Vite dev server)

```bash
npm run dev
```

Then in another terminal:
```bash
npm start
```

### Production Build

```bash
# Build the app
npm run build

# Start the app
npm start
```

## Project Structure

```
WYSIWYGHTML/
├── main.js           # Electron main process
├── index.html        # Editor UI
├── package.json      # Project dependencies
├── vite.config.js    # Vite configuration
├── src/
│   ├── main.js       # CKEditor 5 initialization (Decoupled Editor)
│   └── style.css     # Application styles
└── README.md         # This file
```

## CKEditor 5 Integration

This project uses CKEditor 5 via npm with a custom Decoupled Editor build that includes:

- **Essentials plugin** - Core features (bold, italic, link, lists, undo/redo)
- **French language** - Full French interface
- **Document editor** - Full-featured editor with toolbar and menu bar
- **Plugins included**: Heading, Font, Table, Image, Media, Code Block, Block Quote, Source Editing, and more

## Customization

### Adding More Plugins

Edit `src/main.js` to add more CKEditor 5 plugins:

```javascript
// Import additional plugins
import { /* plugin name */ } from 'ckeditor5';

// Add to plugins array
plugins: [/* existing plugins */, /* new plugin */],

// Add to toolbar
toolbar: { items: ['/* existing items */', /* new item */] }
```

### Changing the Theme

Edit `src/style.css` to customize the appearance.

## License

This project uses CKEditor 5 with a trial license key. For production use, obtain a proper license from [CKEditor](https://ckeditor.com/).

## Building for Production

To create a distributable app:

1. Install `electron-builder`:
```bash
npm install electron-builder --save-dev
```

2. Add to `package.json`:
```json
"build": {
  "appId": "com.yourapp.wysiwyg",
  "mac": {
    "target": "dmg"
  },
  "linux": {
    "target": "AppImage",
    "category": "TextEditor"
  },
  "win": {
    "target": "nsis"
  }
}
```

3. Build:
```bash
npx electron-builder
```

## Troubleshooting

### Editor not loading
- Check browser console for errors
- Ensure all dependencies are installed
- Verify license key is valid

### File operations not working
- Ensure `nodeIntegration: true` in main.js
- Check file system permissions

## Development

- Run `npm run dev` to start Vite dev server
- Run `npm start` to launch Electron app
- Changes to `src/main.js` and `src/style.css` will hot-reload
