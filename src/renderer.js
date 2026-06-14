/**
 * CKEditor 5 Renderer Entry Point
 * This file is bundled by Vite and loaded by index.html
 */

import {
	DecoupledEditor,
	Autosave,
	Essentials,
	Paragraph,
	Autoformat,
	TextTransformation,
	Mention,
	ImageUtils,
	ImageEditing,
	Heading,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	Code,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Indent,
	IndentBlock,
	Alignment,
	Link,
	AutoLink,
	HorizontalLine,
	ImageBlock,
	ImageToolbar,
	ImageInline,
	ImageInsertViaUrl,
	AutoImage,
	CloudServices,
	ImageUpload,
	ImageStyle,
	LinkImage,
	ImageCaption,
	ImageTextAlternative,
	List,
	TodoList,
	Table,
	TableToolbar,
	TableCaption,
	Emoji,
	Fullscreen,
	MediaEmbed,
	PasteFromMarkdownExperimental,
	BlockQuote,
	CodeBlock,
	Style,
	GeneralHtmlSupport,
	PlainTableOutput,
	ShowBlocks,
	HtmlComment,
	BalloonToolbar,
	BlockToolbar
} from 'ckeditor5';

import translations from 'ckeditor5/translations/fr.js';
import 'ckeditor5/ckeditor5.css';
import './style.css';

// AI Integration imports
import { checkOllamaConnection, getAvailableModels } from './ollamaClient.js';
import { AIFeatures } from './aiFeatures.js';

// Grammalecte grammar checking
import { GrammalectePlugin } from './grammalectePlugin.js';

// UI Components
import { createNavbarHTML, initNavbar } from './components/navbar.js';

const LICENSE_KEY = 'GPL';

// Unsaved changes tracking
let isDirty = false;
let lastSavedContent = '';

const editorConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'|',
			'showBlocks',
			'fullscreen',
			'|',
			'grammalecteCheck',
			'|',
			'heading',
			'style',
			'|',
			'fontSize',
			'fontFamily',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'subscript',
			'superscript',
			'code',
			'|',
			'emoji',
			'horizontalLine',
			'link',
			'insertImageViaUrl',
			'mediaEmbed',
			'insertTable',
			'blockQuote',
			'codeBlock',
			'|',
			'alignment',
			'|',
			'bulletedList',
			'numberedList',
			'todoList',
			'outdent',
			'indent'
		],
		shouldNotGroupWhenFull: false
	},
	plugins: [
		Alignment,
		Autoformat,
		AutoImage,
		AutoLink,
		Autosave,
		BalloonToolbar,
		BlockQuote,
		BlockToolbar,
		Bold,
		CloudServices,
		Code,
		CodeBlock,
		Emoji,
		Essentials,
		FontBackgroundColor,
		FontColor,
		FontFamily,
		FontSize,
		Fullscreen,
		GeneralHtmlSupport,
		GrammalectePlugin,
		Heading,
		HorizontalLine,
		HtmlComment,
		ImageBlock,
		ImageCaption,
		ImageEditing,
		ImageInline,
		ImageInsertViaUrl,
		ImageStyle,
		ImageTextAlternative,
		ImageToolbar,
		ImageUpload,
		ImageUtils,
		Indent,
		IndentBlock,
		Italic,
		Link,
		LinkImage,
		List,
		MediaEmbed,
		Mention,
		Paragraph,
		PasteFromMarkdownExperimental,
		PlainTableOutput,
		ShowBlocks,
		Strikethrough,
		Style,
		Subscript,
		Superscript,
		Table,
		TableCaption,
		TableToolbar,
		TextTransformation,
		TodoList,
		Underline
	],
	balloonToolbar: ['bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList'],
	blockToolbar: [
		'fontSize',
		'fontColor',
		'fontBackgroundColor',
		'|',
		'bold',
		'italic',
		'|',
		'link',
		'insertTable',
		'|',
		'bulletedList',
		'numberedList',
		'outdent',
		'indent'
	],
	fontFamily: {
		supportAllValues: true
	},
	fontSize: {
		options: [10, 12, 14, 'default', 18, 20, 22],
		supportAllValues: true
	},
	fullscreen: {
		onEnterCallback: container =>
			container.classList.add(
				'editor-container',
				'editor-container_document-editor',
				'editor-container_include-style',
				'editor-container_include-fullscreen',
				'main-container'
			)
	},
	heading: {
		options: [
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph'
			},
			{
				model: 'heading1',
				view: 'h1',
				title: 'Heading 1',
				class: 'ck-heading_heading1'
			},
			{
				model: 'heading2',
				view: 'h2',
				title: 'Heading 2',
				class: 'ck-heading_heading2'
			},
			{
				model: 'heading3',
				view: 'h3',
				title: 'Heading 3',
				class: 'ck-heading_heading3'
			},
			{
				model: 'heading4',
				view: 'h4',
				title: 'Heading 4',
				class: 'ck-heading_heading4'
			},
			{
				model: 'heading5',
				view: 'h5',
				title: 'Heading 5',
				class: 'ck-heading_heading5'
			},
			{
				model: 'heading6',
				view: 'h6',
				title: 'Heading 6',
				class: 'ck-heading_heading6'
			}
		]
	},
	htmlSupport: {
		allow: [
			{
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			}
		]
	},
	image: {
		toolbar: ['toggleImageCaption', 'imageTextAlternative', '|', 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText']
	},
	language: 'fr',
	licenseKey: LICENSE_KEY,
	link: {
		addTargetToExternalLinks: true,
		defaultProtocol: 'https://',
		decorators: {
			toggleDownloadable: {
				mode: 'manual',
				label: 'Downloadable',
				attributes: {
					download: 'file'
				}
			}
		}
	},
	mention: {
		feeds: [
			{
				marker: '@',
				feed: []
			}
		]
	},
	placeholder: 'Tapez ou collez votre contenu ici !',
	style: {
		definitions: [
			{
				name: 'Article category',
				element: 'h3',
				classes: ['category']
			},
			{
				name: 'Title',
				element: 'h2',
				classes: ['document-title']
			},
			{
				name: 'Subtitle',
				element: 'h3',
				classes: ['document-subtitle']
			},
			{
				name: 'Info box',
				element: 'p',
				classes: ['info-box']
			},
			{
				name: 'CTA Link Primary',
				element: 'a',
				classes: ['button', 'button--green']
			},
			{
				name: 'CTA Link Secondary',
				element: 'a',
				classes: ['button', 'button--black']
			},
			{
				name: 'Marker',
				element: 'span',
				classes: ['marker']
			},
			{
				name: 'Spoiler',
				element: 'span',
				classes: ['spoiler']
			}
		]
	},
	table: {
		contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
	},
	autosave: {
		save: (editor) => {
			const api = window.electronAPI;
			if (!api) return Promise.resolve();
			const content = editor.data.get();
			if (window.currentFilePath) {
				return new Promise(resolve => {
					api.saveFile(content);
					markClean();
					resolve();
				});
			}
			markClean();
			return Promise.resolve();
		},
		waitingTime: 5000
	},
	translations: [translations]
};

// Initialize Navbar component
const navbarContainer = document.getElementById('navbar-container');
if (navbarContainer) {
	navbarContainer.innerHTML = createNavbarHTML();
}
const navbar = initNavbar();

// Track unsaved changes
function markDirty() {
	isDirty = true;
	if (navbar) navbar.setSaveStatus(true);
}

function markClean() {
	isDirty = false;
	if (window.currentEditor) {
		lastSavedContent = window.currentEditor.data.get();
	}
	if (navbar) navbar.setSaveStatus(false);
}

function checkUnsaved() {
	return isDirty;
}

// Initialize CKEditor
DecoupledEditor.create(document.querySelector('#editor'), editorConfig)
	.then(editor => {
		// Attach toolbar and menu bar to the DOM
		document.querySelector('#editor-toolbar').appendChild(editor.ui.view.toolbar.element);
		document.querySelector('#editor-menu-bar').appendChild(editor.ui.view.menuBarView.element);

		// Make editor available globally
		window.currentEditor = editor;

		// Set initial content as "saved"
		lastSavedContent = editor.data.get();

		// Track content changes for unsaved changes
		editor.model.document.on('change:data', () => {
			const currentContent = editor.data.get();
			if (currentContent !== lastSavedContent) {
				markDirty();
			} else {
				markClean();
			}
		});

		// Setup all UI handlers
		setupFileButtons(editor, navbar);
		setupIPCHandlers(editor, navbar);
		setupKeyboardShortcuts(editor, navbar);
		setupUnsavedChangesProtection();

		// Initialize AI Features
		initializeAIFeatures(editor);

		// Setup AI sidebar resize
		setupAISidebarResize();
	})
	.catch(error => {
		console.error('CKEditor 5 initialization error:', error);
	});

/**
 * Setup IPC handlers for file operations (consolidated from index.html)
 */
function setupIPCHandlers(editor, navbar) {
	const api = window.electronAPI;

	// File opened from main process
	api.onFileOpened((data) => {
		if (data.success) {
			editor.data.set(data.content);
			window.currentFilePath = data.filePath;
			const fileName = data.filePath.split('/').pop().split('\\').pop();
			document.title = `WYSIWYG HTML Editor : ${fileName}`;
			if (navbar) navbar.setFilePath(fileName);
			markClean();
		} else {
			alert('Erreur lors de l\'ouverture du fichier : ' + data.error);
		}
	});

	// File saved confirmation from main process
	api.onFileSaved((data) => {
		if (data.success) {
			window.currentFilePath = data.filePath;
			const fileName = data.filePath.split('/').pop().split('\\').pop();
			document.title = `WYSIWYG HTML Editor : ${fileName}`;
			if (navbar) navbar.setFilePath(fileName);
			markClean();
		} else {
			alert('Erreur lors de l\'enregistrement : ' + data.error);
		}
	});

	// Global shortcut: new file
	api.onShortcutNewFile(() => {
		if (checkUnsaved()) {
			if (!confirm('Vous avez des modifications non enregistrées. Voulez-vous continuer ?')) {
				return;
			}
		}
		editor.data.set('');
		window.currentFilePath = null;
		document.title = 'WYSIWYG HTML Editor : Nouveau document';
		if (navbar) navbar.setFilePath('Nouveau fichier');
		markClean();
	});

	// Main process asks if there are unsaved changes before closing
	api.onCheckUnsaved(() => {
		if (checkUnsaved()) {
			const choice = confirm('Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de quitter ?');
			if (choice) {
				// User wants to save first
				const content = editor.data.get();
				if (window.currentFilePath) {
					api.saveFile(content);
				} else {
					api.saveFileAs(content);
				}
				// Close after save completes via the onFileSaved handler
				// For now, close since the save is async
				api.closeWindow();
			} else {
				// User chose "Don't Save" - close without saving
				api.closeWindow();
			}
		} else {
			api.closeWindow();
		}
	});
}

/**
 * Protect against losing unsaved changes
 */
function setupUnsavedChangesProtection() {
	window.addEventListener('beforeunload', (e) => {
		if (checkUnsaved()) {
			e.preventDefault();
			e.returnValue = '';
		}
	});
}

/**
 * Setup click handlers for file operation buttons
 */
function setupFileButtons(editor, navbar) {
	const api = window.electronAPI;

	// New file button
	document.getElementById('new-file').addEventListener('click', () => {
		if (checkUnsaved()) {
			if (!confirm('Vous avez des modifications non enregistrées. Voulez-vous continuer ?')) {
				return;
			}
		}
		editor.data.set('');
		window.currentFilePath = null;
		document.title = 'WYSIWYG HTML Editor : Nouveau document';
		if (navbar) navbar.setFilePath('Nouveau fichier');
		markClean();
	});

	// Open file button
	document.getElementById('open-file').addEventListener('click', () => {
		if (checkUnsaved()) {
			if (!confirm('Vous avez des modifications non enregistrées. Voulez-vous continuer ?')) {
				return;
			}
		}
		api.openFile();
	});

	// Save file button
	document.getElementById('save-file').addEventListener('click', () => {
		const content = editor.data.get();
		if (window.currentFilePath) {
			api.saveFile(content);
		} else {
			api.saveFileAs(content);
		}
	});

	// Save file as button
	document.getElementById('save-file-as').addEventListener('click', () => {
		const content = editor.data.get();
		api.saveFileAs(content);
	});

	// Zoom controls
	const minZoom = 25;
	const maxZoom = 200;
	const zoomStep = 10;
	const editorContainer = document.querySelector('.editor-container__editor');
	const zoomLevelSpan = document.getElementById('zoom-level');

	let currentZoom = parseInt(localStorage.getItem('zoomLevel'), 10) || 100;
	currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom));

	function updateZoom() {
		if (editorContainer) {
			editorContainer.style.transform = `scale(${currentZoom / 100})`;
			editorContainer.style.transformOrigin = 'top center';
		}
		if (zoomLevelSpan) {
			zoomLevelSpan.textContent = `${currentZoom}%`;
		}
		localStorage.setItem('zoomLevel', currentZoom.toString());
	}

	updateZoom();

	document.getElementById('zoom-in').addEventListener('click', () => {
		if (currentZoom < maxZoom) {
			currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
			updateZoom();
		}
	});

	document.getElementById('zoom-out').addEventListener('click', () => {
		if (currentZoom > minZoom) {
			currentZoom = Math.max(currentZoom - zoomStep, minZoom);
			updateZoom();
		}
	});

	document.getElementById('zoom-reset').addEventListener('click', () => {
		currentZoom = 100;
		updateZoom();
	});

	// Export PDF button
	document.getElementById('export-pdf').addEventListener('click', () => {
		const content = editor.data.get();
		api.showPdfExport({ content, margins: { top: 15, right: 15, bottom: 15, left: 15 } });
	});
}

/**
 * Initialize AI Features integration
 */
async function initializeAIFeatures(editor) {
	const statusElement = document.getElementById('ai-status');
	const modelSelect = document.getElementById('ai-model');

	try {
		const isConnected = await checkOllamaConnection();
		if (isConnected && statusElement) {
			statusElement.textContent = 'Connecté';
			statusElement.className = 'ai-status connected';

			const models = await getAvailableModels();
			
			if (modelSelect) {
				if (models.length > 0) {
					modelSelect.innerHTML = models.map(model => 
						`<option value="${model}">${model}</option>`
					).join('');
				} else {
					modelSelect.innerHTML = '<option value="">Aucun modèle trouvé</option>';
					console.warn('No Ollama models found. Make sure to pull a model: ollama pull llama3');
				}
			}
		} else if (statusElement) {
			statusElement.textContent = 'Déconnecté';
			statusElement.className = 'ai-status disconnected';
			if (modelSelect) {
				modelSelect.innerHTML = '<option value="">Ollama non disponible</option>';
			}
		}
	} catch (error) {
		console.warn('Ollama connection failed:', error.message);
		if (statusElement) {
			statusElement.textContent = 'Déconnecté';
			statusElement.className = 'ai-status disconnected';
		}
		if (modelSelect) {
			modelSelect.innerHTML = '<option value="">Erreur de connexion</option>';
		}
	}

	const aiFeatures = new AIFeatures(editor);
	aiFeatures.initialize();
	window.aiFeatures = aiFeatures;
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts(editor, navbar) {
	const api = window.electronAPI;

	document.addEventListener('keydown', (e) => {
		const isCtrl = e.ctrlKey || e.metaKey;

		if (!isCtrl) return;

		switch (true) {
			case e.key === 'n' && !e.shiftKey:
				e.preventDefault();
				if (checkUnsaved()) {
					if (!confirm('Vous avez des modifications non enregistrées. Voulez-vous continuer ?')) {
						return;
					}
				}
				editor.data.set('');
				window.currentFilePath = null;
				document.title = 'WYSIWYG HTML Editor : Nouveau document';
				if (navbar) navbar.setFilePath('Nouveau fichier');
				markClean();
				break;

			case e.key === 'o':
				e.preventDefault();
				if (checkUnsaved()) {
					if (!confirm('Vous avez des modifications non enregistrées. Voulez-vous continuer ?')) {
						return;
					}
				}
				api.openFile();
				break;

			case e.key === 's' && e.shiftKey:
				e.preventDefault();
				api.saveFileAs(editor.data.get());
				break;

			case e.key === 's' && !e.shiftKey:
				e.preventDefault();
				if (window.currentFilePath) {
					api.saveFile(editor.data.get());
				} else {
					api.saveFileAs(editor.data.get());
				}
				break;

			case e.key === 'p':
				e.preventDefault();
				api.showPdfExport({ content: editor.data.get(), margins: { top: 15, right: 15, bottom: 15, left: 15 } });
				break;

			case e.key === '=' || e.key === '+':
				e.preventDefault();
				document.getElementById('zoom-in')?.click();
				break;

			case e.key === '-':
				e.preventDefault();
				document.getElementById('zoom-out')?.click();
				break;

			case e.key === '0':
				e.preventDefault();
				document.getElementById('zoom-reset')?.click();
				break;
		}
	});
}

function setupAISidebarResize() {
	const sidebar = document.getElementById('ai-sidebar');
	const resizeHandle = document.getElementById('ai-sidebar-resize');

	if (!resizeHandle || !sidebar) return;

	let isResizing = false;
	let startX = 0;
	let startWidth = 0;

	resizeHandle.addEventListener('mousedown', (e) => {
		isResizing = true;
		startX = e.clientX;
		startWidth = sidebar.offsetWidth;
		resizeHandle.classList.add('active');
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
		e.preventDefault();
	});

	document.addEventListener('mousemove', (e) => {
		if (!isResizing) return;
		const diff = e.clientX - startX;
		const newWidth = Math.min(1000, Math.max(200, startWidth + diff));
		sidebar.style.width = newWidth + 'px';
	});

	document.addEventListener('mouseup', () => {
		if (!isResizing) return;
		isResizing = false;
		resizeHandle.classList.remove('active');
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	});
}