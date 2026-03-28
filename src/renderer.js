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

// UI Components
import { createNavbarHTML, initNavbar } from './components/navbar.js';

const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzU3NzkxOTksImp0aSI6IjViZTE1ZTE5LTg4ZTMtNDhkZS1hZTA3LTQwYWY4NzQwZDVkMSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImI2YmNlNTBmIn0.aMIFTlFgr034oIP2qERovxq9HqHIwWix6NIkrDGKZJhx3NpyzFj6IXf8IZV9ButHksT2nyYZmr4Hz3oEOaW6vA';

const editorConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'|',
			'showBlocks',
			'fullscreen',
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
				feed: [
					/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
				]
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
	translations: [translations]
};

// Initialize Navbar component
const navbarContainer = document.getElementById('navbar-container');
if (navbarContainer) {
	navbarContainer.innerHTML = createNavbarHTML();
}
const navbar = initNavbar({ ipcRenderer: window.ipcRenderer });

// Initialize CKEditor
DecoupledEditor.create(document.querySelector('#editor'), editorConfig)
	.then(editor => {
		// Attach toolbar and menu bar to the DOM
		document.querySelector('#editor-toolbar').appendChild(editor.ui.view.toolbar.element);
		document.querySelector('#editor-menu-bar').appendChild(editor.ui.view.menuBarView.element);

		// Make editor available globally for IPC handlers
		window.currentEditor = editor;

		console.log('CKEditor 5 initialized successfully');

		// Setup button click handlers for file operations
		setupFileButtons(editor, navbar);

		// Initialize AI Features
		initializeAIFeatures(editor);
	})
	.catch(error => {
		console.error('CKEditor 5 initialization error:', error);
	});

/**
 * Setup click handlers for file operation buttons
 */
function setupFileButtons(editor, navbar) {
	const ipcRenderer = window.ipcRenderer;

	// New file button
	document.getElementById('new-file').addEventListener('click', () => {
		editor.data.set('');
		window.currentFilePath = null;
		if (navbar) navbar.setFilePath('Nouveau fichier');
	});

	// Open file button
	document.getElementById('open-file').addEventListener('click', () => {
		ipcRenderer.send('open-file');
	});

	// Save file button
	document.getElementById('save-file').addEventListener('click', () => {
		const content = editor.data.get();
		ipcRenderer.send('save-file', content);
	});

	// Save file as button
	document.getElementById('save-file-as').addEventListener('click', () => {
		const content = editor.data.get();
		ipcRenderer.send('save-file-as', content);
	});

	// Zoom controls
	let currentZoom = 100;
	const minZoom = 25;
	const maxZoom = 200;
	const zoomStep = 10;
	const editorContainer = document.querySelector('.editor-container__editor');
	const zoomLevelSpan = document.getElementById('zoom-level');

	function updateZoom() {
		if (editorContainer) {
			editorContainer.style.transform = `scale(${currentZoom / 100})`;
			editorContainer.style.transformOrigin = 'top center';
		}
		if (zoomLevelSpan) {
			zoomLevelSpan.textContent = `${currentZoom}%`;
		}
	}

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
}

/**
 * Initialize AI Features integration
 */
async function initializeAIFeatures(editor) {
	const statusElement = document.getElementById('ai-status');
	const modelSelect = document.getElementById('ai-model');

	// Check Ollama connection and populate models
	try {
		const isConnected = await checkOllamaConnection();
		if (isConnected && statusElement) {
			statusElement.textContent = 'Connecté';
			statusElement.className = 'ai-status connected';

			// Get available models
			const models = await getAvailableModels();
			console.log('Available models:', models);
			
			if (modelSelect) {
				if (models.length > 0) {
					modelSelect.innerHTML = models.map(model => 
						`<option value="${model}">${model}</option>`
					).join('');
				} else {
					// No models found - show message
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

	// Initialize AI Features class
	const aiFeatures = new AIFeatures(editor);
	aiFeatures.initialize();

	// Make AI features available globally
	window.aiFeatures = aiFeatures;
}