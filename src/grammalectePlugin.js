/**
 * Grammalecte Plugin for CKEditor 5
 * Provides French grammar checking with visual markers and suggestions
 */

import { Plugin, Command, ButtonView } from 'ckeditor5';
import { grammalecteService } from './grammalecteService.js';

const ERROR_TYPES = {
	spelling: {
		className: 'grammalecte-spelling-error',
		color: '#ff0000',
		title: "Faute d'orthographe"
	},
	grammar: {
		className: 'grammalecte-grammar-error',
		color: '#ff9900',
		title: 'Erreur grammaticale'
	},
	typo: {
		className: 'grammalecte-typo-error',
		color: '#9933ff',
		title: 'Typographie'
	}
};

export class GrammalectePlugin extends Plugin {
	static get pluginName() {
		return 'GrammalectePlugin';
	}

	constructor(editor) {
		super(editor);
		this._errors = new Map();
		this._isChecking = false;
		this._tooltipElement = null;
		this._clickHandler = null;
		this._debounceTimer = null;
	}

	init() {
		const editor = this.editor;

		editor.commands.add('grammalecteCheck', new GrammalecteCheckCommand(editor));

		this._addToolbarButton();
		this._addStyles();
		this._setupMarkerConversion();

		editor.once('ready', () => {
			this._setupClickHandler();
			this._setupAutoCheck();
			this._initialCheck();
		});
	}

	_setupMarkerConversion() {
		const editor = this.editor;

		editor.conversion.for('editingDowncast').markerToHighlight({
			model: 'grammalecte-error',
			view: (data) => {
				const markerName = data.markerName;
				const errorData = this._errors.get(markerName) || {};
				const errorType = this._getErrorType(errorData.type || 'typo');

				return {
					classes: [errorType.className, 'grammalecte-error'],
					attributes: {
						'data-error-id': markerName,
						'data-error-message': errorData.message || '',
						title: errorType.title
					}
				};
			},
			converterPriority: 'high'
		});
	}

	_addToolbarButton() {
		const editor = this.editor;

		editor.ui.componentFactory.add('grammalecteCheck', locale => {
			const command = editor.commands.get('grammalecteCheck');

			const view = new ButtonView(locale);

			view.set({
				label: 'Vérifier la grammaire',
				icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"/><path d="M7.5 10a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/><path d="m16.5 16.5-3-3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
				tooltip: true,
				isToggleable: true
			});

			view.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');

			view.on('execute', () => {
				editor.execute('grammalecteCheck');
				editor.editing.view.focus();
			});

			return view;
		});
	}

	async _initialCheck() {
		const editor = this.editor;
		await new Promise(resolve => setTimeout(resolve, 100));
		const content = editor.getData();
		if (content && content.trim().length > 0) {
			this.checkGrammar().catch(err => {
				console.error('[Plugin] Initial check failed:', err);
			});
		}
	}

	_setupAutoCheck() {
		const editor = this.editor;
		const DEBOUNCE_DELAY = 800;

		editor.model.document.on('change:data', () => {
			if (this._debounceTimer) {
				clearTimeout(this._debounceTimer);
			}

			this._debounceTimer = setTimeout(() => {
				if (!editor.isReadOnly) {
					this.checkGrammar().catch(err => {
						console.error('[Plugin] Auto check failed:', err);
					});
				}
			}, DEBOUNCE_DELAY);
		});
	}

	_setupClickHandler() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		this.listenTo(viewDocument, 'click', (evt, data) => {
			const domEvent = data.domEvent;
			if (!domEvent || !domEvent.target) {
				return;
			}

			const domElement = domEvent.target;

			let errorElement = domElement;
			for (const errorType of Object.values(ERROR_TYPES)) {
				if (errorElement.classList && errorElement.classList.contains(errorType.className)) {
					this._showSuggestions(errorElement);
					evt.stop();
					return;
				}
			}

			let parent = domElement.parentElement;
			while (parent && parent !== editor.ui.view.element) {
				for (const errorType of Object.values(ERROR_TYPES)) {
					if (parent.classList && parent.classList.contains(errorType.className)) {
						this._showSuggestions(parent);
						evt.stop();
						return;
					}
				}
				parent = parent.parentElement;
			}

			this._hideTooltip();
		});
	}

	_showSuggestions(domElement) {
		this._hideTooltip();

		const errorInfo = this._getErrorForElement(domElement);
		if (!errorInfo) {
			return;
		}

		const tooltip = document.createElement('div');
		tooltip.className = 'grammalecte-error-tooltip';
		tooltip.innerHTML = `
			<div class="error-message">${errorInfo.message}</div>
			${errorInfo.suggestions && errorInfo.suggestions.length > 0 ? `
				<div class="suggestions">
					<strong>Suggestions:</strong>
					${errorInfo.suggestions.map(s => 
						`<div class="suggestion-item" data-suggestion="${s}">${s}</div>`
					).join('')}
				</div>
			` : ''}
		`;

		const rect = domElement.getBoundingClientRect();
		tooltip.style.left = `${rect.left}px`;
		tooltip.style.top = `${rect.bottom + 5}px`;

		tooltip.querySelectorAll('.suggestion-item').forEach(item => {
			item.addEventListener('click', (evt) => {
				evt.preventDefault();
				const suggestion = item.getAttribute('data-suggestion');
				this._applySuggestion(errorInfo, suggestion);
				this._hideTooltip();
			});
		});

		document.body.appendChild(tooltip);
		this._tooltipElement = tooltip;

		setTimeout(() => {
			document.addEventListener('click', this._clickHandler = (e) => {
				if (!tooltip.contains(e.target)) {
					this._hideTooltip();
				}
			});
		}, 0);
	}

	_hideTooltip() {
		if (this._tooltipElement) {
			this._tooltipElement.remove();
			this._tooltipElement = null;
		}
		if (this._clickHandler) {
			document.removeEventListener('click', this._clickHandler);
			this._clickHandler = null;
		}
	}

	_getErrorForElement(domElement) {
		let element = domElement;
		while (element) {
			const errorId = element.getAttribute?.('data-error-id');
			if (errorId && this._errors.has(errorId)) {
				return this._errors.get(errorId);
			}
			element = element.parentElement;
		}
		return null;
	}

	_applySuggestion(errorInfo, suggestion) {
		const editor = this.editor;

		editor.model.change(writer => {
			writer.setSelection(errorInfo.range);
			editor.execute('insertText', { text: suggestion });
		});

		this._clearErrors();
	}

	_addStyles() {
		const styleId = 'grammalecte-styles';
		if (document.getElementById(styleId)) {
			return;
		}

		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = `
			.grammalecte-spelling-error {
				background-color: rgba(255, 0, 0, 0.2);
				border-bottom: 2px wavy #ff0000;
				cursor: pointer;
			}
			.grammalecte-grammar-error {
				background-color: rgba(255, 153, 0, 0.2);
				border-bottom: 2px wavy #ff9900;
				cursor: pointer;
			}
			.grammalecte-typo-error {
				background-color: rgba(153, 51, 255, 0.2);
				border-bottom: 2px wavy #9933ff;
				cursor: pointer;
			}
			.grammalecte-error-tooltip {
				position: absolute;
				background: #333;
				color: white;
				padding: 8px 12px;
				border-radius: 4px;
				font-size: 12px;
				max-width: 300px;
				z-index: 10000;
				box-shadow: 0 2px 8px rgba(0,0,0,0.3);
			}
			.grammalecte-error-tooltip .error-message {
				margin-bottom: 8px;
			}
			.grammalecte-error-tooltip .suggestions {
				border-top: 1px solid #555;
				padding-top: 8px;
			}
			.grammalecte-error-tooltip .suggestion-item {
				cursor: pointer;
				padding: 4px 8px;
				margin: 2px 0;
				background: #444;
				border-radius: 3px;
			}
			.grammalecte-error-tooltip .suggestion-item:hover {
				background: #555;
			}
		`;
		document.head.appendChild(style);
	}

	_getPlainText() {
		const editor = this.editor;
		const model = editor.model;
		const root = model.document.getRoot();

		const range = model.createRangeIn(root);
		const walker = range.getWalker({ ignoreElementEnd: true });

		const blockElements = new Set(['paragraph', 'heading1', 'heading2', 'heading3',
			'heading4', 'heading5', 'heading6', 'blockQuote', 'listItem', 'codeBlock']);

		let text = '';
		let inWidget = false;
		let currentBlockId = null;
		let lastBlockId = null;

		for (const value of walker) {
			const item = value.item;

			if (value.type === 'elementStart') {
				if (item.is('element') && item.getAttribute('contenteditable') === 'false') {
					inWidget = true;
					continue;
				}

				if (blockElements.has(item.name)) {
					currentBlockId = item.id || `${item.name}-${text.length}`;
					if (lastBlockId !== null && currentBlockId !== lastBlockId) {
						text += '\n';
					}
					lastBlockId = currentBlockId;
				}
			}

			if (value.type === 'elementEnd') {
				if (item.is('element') && item.getAttribute('contenteditable') === 'false') {
					inWidget = false;
					continue;
				}
			}

			if (inWidget) {
				continue;
			}

			if (item.name === 'softBreak') {
				text += '\n';
				continue;
			}

			if (item.is('$textProxy')) {
				text += item.data;
			}
		}

		return text;
	}

	async checkGrammar() {
		if (this._isChecking) {
			return;
		}

		this._isChecking = true;

		try {
			const editor = this.editor;
			const plainText = this._getPlainText();

			this._clearErrors();

			const result = await grammalecteService.checkGrammar(plainText);

			if (result.success && result.errors && result.errors.length > 0) {
				await this._addErrorMarkers(result.errors);
			}

			return result;
		} catch (error) {
			console.error('[Plugin] Grammar check failed:', error);
			throw error;
		} finally {
			this._isChecking = false;
		}
	}

	async _addErrorMarkers(errors) {
		const editor = this.editor;
		const model = editor.model;

		let addedCount = 0;

		for (const error of errors) {
			try {
				const range = this._findTextRange(error.start, error.end);

				if (range) {
					const errorId = `grammalecte-error:${Date.now()}-${addedCount}`;

					this._errors.set(errorId, {
						range: range.clone(),
						message: error.message,
						suggestions: error.suggestions || [],
						type: error.type || 'typo',
						id: errorId
					});

					editor.model.change(writer => {
						writer.addMarker(errorId, {
							range: range,
							usingOperation: false,
							affectsData: false
						});
					});
					addedCount++;
				}
			} catch (e) {
				console.error('[Plugin] Failed to add marker:', e);
			}
		}
	}

	_getErrorType(type) {
		const normalizedType = type.toLowerCase();
		if (normalizedType.includes('spell') || normalizedType.includes('orth')) {
			return ERROR_TYPES.spelling;
		}
		if (normalizedType.includes('grammar') || normalizedType.includes('gramm')) {
			return ERROR_TYPES.grammar;
		}
		return ERROR_TYPES.typo;
	}

	_clearErrors() {
		const editor = this.editor;

		editor.model.change(writer => {
			for (const [id] of this._errors) {
				try {
					writer.removeMarker(id);
				} catch (e) {
					// Ignore errors when removing markers
				}
			}
		});

		this._errors.clear();
	}

	_findTextRange(startOffset, endOffset) {
		const editor = this.editor;
		const model = editor.model;
		const root = model.document.getRoot();

		const entireRange = model.createRangeIn(root);
		const walker = entireRange.getWalker({ ignoreElementEnd: true });

		const blockElements = new Set(['paragraph', 'heading1', 'heading2', 'heading3',
			'heading4', 'heading5', 'heading6', 'blockQuote', 'listItem', 'codeBlock']);

		let currentCharOffset = 0;
		let startPosition = null;
		let endPosition = null;
		let inWidget = false;
		let currentBlockId = null;
		let lastBlockId = null;

		for (const value of walker) {
			const item = value.item;

			if (value.type === 'elementStart') {
				if (item.is('element') && item.getAttribute('contenteditable') === 'false') {
					inWidget = true;
					continue;
				}

				if (blockElements.has(item.name)) {
					currentBlockId = item.id || `${item.name}-${currentCharOffset}`;
					if (lastBlockId !== null && currentBlockId !== lastBlockId) {
						currentCharOffset += 1;
					}
					lastBlockId = currentBlockId;
				}
			}

			if (value.type === 'elementEnd') {
				if (item.is('element') && item.getAttribute('contenteditable') === 'false') {
					inWidget = false;
					continue;
				}
			}

			if (inWidget) {
				continue;
			}

			if (item.name === 'softBreak') {
				currentCharOffset += 1;
				continue;
			}

			if (item.is('$textProxy')) {
				const textLength = item.data.length;
				const itemStart = currentCharOffset;
				const itemEnd = currentCharOffset + textLength;

				if (startPosition === null && startOffset >= itemStart && startOffset < itemEnd) {
					startPosition = value.previousPosition.getShiftedBy(startOffset - itemStart);
				}

				if (startPosition !== null && endPosition === null && endOffset >= itemStart && endOffset <= itemEnd) {
					endPosition = value.previousPosition.getShiftedBy(endOffset - itemStart);
					break;
				}

				currentCharOffset = itemEnd;
			}
		}

		if (startPosition && endPosition) {
			return model.createRange(startPosition, endPosition);
		}

		return null;
	}

	replaceWithError(range, suggestion) {
		const editor = this.editor;

		editor.model.change(writer => {
			writer.setSelection(range);
			editor.execute('insertText', { text: suggestion });
		});

		this._clearErrors();
	}
}

export class GrammalecteCheckCommand extends Command {
	constructor(editor) {
		super(editor);
		this.set('value', false);
	}

	execute() {
		const plugin = this.editor.plugins.get('GrammalectePlugin');
		plugin.checkGrammar();
	}

	refresh() {
		this.isEnabled = true;
	}
}