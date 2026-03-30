# WYSIWYG HTML Editor

A WYSIWYG (What You See Is What You Get) HTML editor built with Electron and CKEditor 5.

## Features

- **CKEditor 5** — Professional WYSIWYG editing (loaded from CDN)
- **French interface** — Full French UI
- **Rich text formatting** — Bold, italic, links, lists, headings, tables, images, etc.
- **Undo/Redo** — Full history management
- **File operations** — New, Open, Save, Save As
- **Cross-platform** — Works on Linux, Windows, and macOS

## Quick Start

```bash
npm install
npm start
```

That's it. No build step required for development.

## Usage

| Action | Button |
|--------|--------|
| New file | Nouveau |
| Open file | Ouvrir |
| Save | Enregistrer |
| Save As | Enregistrer sous |

## Project Structure

```
WYSIWYGHTML/
├── main.js        # Electron main process (file operations)
├── index.html     # Editor UI
├── src/
│   ├── editor.js  # CKEditor 5 initialization
│   └── style.css  # Application styles
├── package.json
└── README.md
```

## Build for Distribution

```bash
npm install electron-builder --save-dev
npm run build
```

This creates portable Linux AppImage and deb packages in `dist/`.

## CKEditor 5

CKEditor 5 is loaded from CDN (`cdn.ckeditor.com`). For offline use or more customization, consider installing via npm:

```bash
npm install ckeditor5
```

