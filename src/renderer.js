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
	Markdown,
	PasteFromMarkdownExperimental,
	BlockQuote,
	CodeBlock,
	Style,
	GeneralHtmlSupport,
	PlainTableOutput,
	ShowBlocks,
	HtmlComment,
	TextPartLanguage,
	Title,
	BalloonToolbar,
	BlockToolbar
} from 'ckeditor5';

import translations from 'ckeditor5/translations/fr.js';

import 'ckeditor5/ckeditor5.css';

import './style.css';

const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzU3NzkxOTksImp0aSI6IjViZTE1ZTE5LTg4ZTMtNDhkZS1hZTA3LTQwYWY4NzQwZDVkMSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImI2YmNlNTBmIn0.aMIFTlFgr034oIP2qERovxq9HqHIwWix6NIkrDGKZJhx3NpyzFj6IXf8IZV9ButHksT2nyYZmr4Hz3oEOaW6vA';

const editorConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'|',
			'showBlocks',
			'textPartLanguage',
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
		Markdown,
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
		TextPartLanguage,
		TextTransformation,
		Title,
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
		setupFileButtons(editor);
	})
	.catch(error => {
		console.error('CKEditor 5 initialization error:', error);
	});

/**
 * Setup click handlers for file operation buttons
 */
function setupFileButtons(editor) {
	const ipcRenderer = window.ipcRenderer;

	// New file button
	document.getElementById('new-file').addEventListener('click', () => {
		editor.data.set('');
		window.currentFilePath = null;
		document.getElementById('current-file-path').textContent = 'Nouveau fichier';
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
}