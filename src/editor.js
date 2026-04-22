/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NoDgNARATAdAjHeFIFYoGYDsWCcUFQo4BsxADCCmcVGVDgCxzZnoOMpwcMMrHIQAZgCdk6MMDhgpM6WDIBdSAFN0AIxC8cEBUA==
 */

const {
	DecoupledEditor,
	Autosave,
	Essentials,
	Paragraph,
	Autoformat,
	TextTransformation,
	Mention,
	ImageUtils,
	ImageEditing,
	ImageBlock,
	ImageToolbar,
	ImageInline,
	ImageInsertViaUrl,
	AutoImage,
	CloudServices,
	ImageUpload,
	ImageStyle,
	ImageCaption,
	ImageTextAlternative,
	Emoji,
	Fullscreen,
	MediaEmbed,
	Markdown,
	PasteFromMarkdownExperimental,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Code,
	Subscript,
	Superscript,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Highlight,
	Heading,
	Link,
	AutoLink,
	BlockQuote,
	HorizontalLine,
	CodeBlock,
	Indent,
	IndentBlock,
	Alignment,
	Style,
	GeneralHtmlSupport,
	List,
	TodoList,
	Table,
	TableToolbar,
	PlainTableOutput,
	TableCaption,
	ShowBlocks,
	HtmlComment,
	TextPartLanguage,
	Title,
	BalloonToolbar,
	BlockToolbar
} = window.CKEDITOR;

const LICENSE_KEY = 'GPL';

const editorConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'|',
			'showBlocks',
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
			'|',
			'link',
			'insertTable',
			'highlight',
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
		Highlight,
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
	initialData:
		'<h2>Congratulations on setting up CKEditor 5! 🎉</h2>\n<p>\n\tYou\'ve successfully created a CKEditor 5 project. This powerful text editor\n\twill enhance your application, enabling rich text editing capabilities that\n\tare customizable and easy to use.\n</p>\n<h3>What\'s next?</h3>\n<ol>\n\t<li>\n\t\t<strong>Integrate into your app</strong>: time to bring the editing into\n\t\tyour application. Take the code you created and add to your application.\n\t</li>\n\t<li>\n\t\t<strong>Explore features:</strong> Experiment with different plugins and\n\t\ttoolbar options to discover what works best for your needs.\n\t</li>\n\t<li>\n\t\t<strong>Customize your editor:</strong> Tailor the editor\'s\n\t\tconfiguration to match your application\'s style and requirements. Or\n\t\teven write your plugin!\n\t</li>\n</ol>\n<p>\n\tKeep experimenting, and don\'t hesitate to push the boundaries of what you\n\tcan achieve with CKEditor 5. Your feedback is invaluable to us as we strive\n\tto improve and evolve. Happy editing!\n</p>\n<h3>Helpful resources</h3>\n<ul>\n\t<li>📝 <a href="https://portal.ckeditor.com/checkout?plan=free">Trial sign up</a>,</li>\n\t<li>📕 <a href="https://ckeditor.com/docs/ckeditor5/latest/installation/index.html">Documentation</a>,</li>\n\t<li>⭐️ <a href="https://github.com/ckeditor/ckeditor5">GitHub</a> (star us if you can!),</li>\n\t<li>🏠 <a href="https://ckeditor.com">CKEditor Homepage</a>,</li>\n\t<li>🧑‍💻 <a href="https://ckeditor.com/ckeditor-5/demo/">CKEditor 5 Demos</a>,</li>\n</ul>\n<h3>Need help?</h3>\n<p>\n\tSee this text, but the editor is not starting up? Check the browser\'s\n\tconsole for clues and guidance. It may be related to an incorrect license\n\tkey if you use premium features or another feature-related requirement. If\n\tyou cannot make it work, file a GitHub issue, and we will help as soon as\n\tpossible!\n</p>\n',
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
	placeholder: 'Type or paste your content here!',
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
	}
};

DecoupledEditor.create(document.querySelector('#editor'), editorConfig).then(editor => {
	document.querySelector('#editor-toolbar').appendChild(editor.ui.view.toolbar.element);
	document.querySelector('#editor-menu-bar').appendChild(editor.ui.view.menuBarView.element);

	// Store editor instance for global access
	window.currentEditor = editor;

	// Setup button event listeners
	setupButtonListeners();

	return editor;
});

// Setup button event listeners
function setupButtonListeners() {
	// New file button
	document.getElementById('new-file').addEventListener('click', () => {
		if (window.currentEditor) {
			window.currentEditor.data.set('<h2>Nouveau document</h2>\n<p>Commencez à taper votre contenu ici...</p>');
		}
		document.getElementById('current-file-path').textContent = 'Nouveau document';
		window.currentFilePath = null;
	});

	// Open file button
	document.getElementById('open-file').addEventListener('click', () => {
		window.ipcRenderer.send('open-file');
	});

	// Save file button
	document.getElementById('save-file').addEventListener('click', () => {
		if (window.currentEditor) {
			const content = window.currentEditor.data.get();
			if (window.currentFilePath) {
				window.ipcRenderer.send('save-file', content);
			} else {
				window.ipcRenderer.send('save-file-as', content);
			}
		}
	});

	// Save as button
	document.getElementById('save-file-as').addEventListener('click', () => {
		if (window.currentEditor) {
			const content = window.currentEditor.data.get();
			window.ipcRenderer.send('save-file-as', content);
		}
	});
}

// Global variable to track current file path
window.currentFilePath = null;

// AI Sidebar toggle functionality
function setupAISidebarToggle() {
	const sidebar = document.getElementById('ai-sidebar');
	const resizeHandle = document.getElementById('ai-sidebar-resize');

	console.log('[AI Sidebar Resize] sidebar:', sidebar, 'resizeHandle:', resizeHandle);

	if (resizeHandle && sidebar) {
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
			console.log('[AI Sidebar Resize] mousedown - startX:', startX, 'startWidth:', startWidth);
		});

		document.addEventListener('mousemove', (e) => {
			if (!isResizing) return;
			const diff = e.clientX - startX;
			const newWidth = Math.min(600, Math.max(200, startWidth + diff));
			sidebar.style.width = newWidth + 'px';
			console.log('[AI Sidebar Resize] mousemove - diff:', diff, 'newWidth:', newWidth, 'sidebar.style.width:', sidebar.style.width, 'actual offsetWidth:', sidebar.offsetWidth);
		});

		document.addEventListener('mouseup', () => {
			if (!isResizing) return;
			isResizing = false;
			resizeHandle.classList.remove('active');
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			console.log('[AI Sidebar Resize] mouseup - final width:', sidebar.offsetWidth);
		});
	} else {
		console.log('[AI Sidebar Resize] Missing element - sidebar:', !!sidebar, 'resizeHandle:', !!resizeHandle);
	}
}

// Call AI sidebar setup after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	setupAISidebarToggle();
});
