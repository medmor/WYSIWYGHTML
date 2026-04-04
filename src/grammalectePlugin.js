/**
 * Grammalecte Plugin for CKEditor 5
 * Provides French grammar checking with visual markers and suggestions
 */

import { Plugin, Command, ButtonView } from 'ckeditor5';
import { grammalecteService } from './grammalecteService.js';

// Error type colors and styles
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

/**
 * Grammalecte Plugin
 * Integrates French grammar checking into CKEditor 5
 */
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
	}

	/**
	 * Initialize the plugin
	 */
	init() {
		const editor = this.editor;

		// Define the Grammalecte command
		editor.commands.add('grammalecteCheck', new GrammalecteCheckCommand(editor));

		// Add toolbar button
		this._addToolbarButton();

		// Add styles for error markers
		this._addStyles();

		// Setup marker downcast conversion for each error type
		this._setupMarkerConversion();

		// Setup click handler for error suggestions (after editor is ready)
		editor.once('ready', () => {
			this._setupClickHandler();
		});

	}

	/**
	 * Setup downcast conversion for grammar error markers
	 */
	_setupMarkerConversion() {
		const editor = this.editor;
		const plugin = this;

		// Use markerToHighlight which handles markers with namespaced names
		// CKEditor 5 uses colon separator for namespaced events:
		// - model: 'grammalecte-error' listens for 'addMarker:grammalecte-error' events
		// - This catches markers named 'grammalecte-error', 'grammalecte-error:123', 'grammalecte-error:type:id', etc.
		// - IMPORTANT: Marker names MUST use colon after the model name (e.g., 'grammalecte-error:test-123')
		editor.conversion.for('editingDowncast').markerToHighlight({
			model: 'grammalecte-error',
			view: (data) => {
				// data.markerName contains the full marker name
				const markerName = data.markerName;
				const errorData = plugin._errors.get(markerName) || {};
				const errorType = plugin._getErrorType(errorData.type || 'typo');

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

	/**
	 * Add toolbar button for grammar checking
	 */
	_addToolbarButton() {
		const editor = this.editor;

		editor.ui.componentFactory.add('grammalecteCheck', locale => {
			const command = editor.commands.get('grammalecteCheck');

			// Create button using ButtonView
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

	/**
	 * Setup click handler for error markers
	 */
	_setupClickHandler() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// Listen for clicks on the editing view
		this.listenTo(viewDocument, 'click', (evt, data) => {
			// Get the DOM target from the native DOM event
			const domEvent = data.domEvent;
			if (!domEvent || !domEvent.target) {
				return;
			}

			const domElement = domEvent.target;

			// Check if clicked on an error marker or within an error marker
			let errorElement = domElement;
			for (const errorType of Object.values(ERROR_TYPES)) {
				if (errorElement.classList && errorElement.classList.contains(errorType.className)) {
					this._showSuggestions(errorElement);
					evt.stop();
					return;
				}
			}

			// Check parent elements for error markers (in case clicking on a child element)
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

			// Hide tooltip if clicking elsewhere
			this._hideTooltip();
		});
	}

	/**
	 * Show suggestions tooltip for an error
	 */
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

		// Position tooltip near the error
		const rect = domElement.getBoundingClientRect();
		tooltip.style.left = `${rect.left}px`;
		tooltip.style.top = `${rect.bottom + 5}px`;

		// Add click handlers for suggestions
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

		// Close tooltip when clicking outside
		setTimeout(() => {
			document.addEventListener('click', this._clickHandler = (e) => {
				if (!tooltip.contains(e.target)) {
					this._hideTooltip();
				}
			});
		}, 0);
	}

	/**
	 * Hide the suggestions tooltip
	 */
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

	/**
	 * Get error info for a DOM element
	 */
	_getErrorForElement(domElement) {
		// Find the error by checking data-error-id attribute
		let element = domElement;
		
		// Walk up the DOM tree to find an element with data-error-id
		while (element) {
			const errorId = element.getAttribute?.('data-error-id');
			if (errorId && this._errors.has(errorId)) {
				return this._errors.get(errorId);
			}
			element = element.parentElement;
		}
		
		return null;
	}

	/**
	 * Apply a suggestion to fix an error
	 */
	_applySuggestion(errorInfo, suggestion) {
		const editor = this.editor;

		editor.model.change(writer => {
			writer.setSelection(errorInfo.range);
			editor.execute('insertText', { text: suggestion });
		});

		// Clear all errors after applying a fix
		this._clearErrors();
	}

	/**
	 * Add CSS styles for error markers
	 */
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

	/**
	 * Extract plain text from the CKEditor model
	 * This ensures character offsets match between what we send to Grammalecte
	 * and what we use to find positions in the model
	 * @returns {string} Plain text content
	 */
	_getPlainText() {
		const editor = this.editor;
		const model = editor.model;
		const root = model.document.getRoot();
		
		// Create a range covering the entire document
		const range = model.createRangeIn(root);
		const walker = range.getWalker({ ignoreElementEnd: true });
		
		let text = '';
		for (const value of walker) {
			if (value.item.is('$textProxy')) {
				text += value.item.data;
			}
		}
		
		return text;
	}

	/**
	 * Check text for grammar errors
	 */
	async checkGrammar() {
		if (this._isChecking) {
			return;
		}

		this._isChecking = true;

		try {
			const editor = this.editor;
			
			// Get plain text from model (not HTML) - offsets will match model positions
			const plainText = this._getPlainText();

			// Clear previous errors
			this._clearErrors();

			// Check grammar with plain text
			const result = await grammalecteService.checkGrammar(plainText);

			if (result.success && result.errors && result.errors.length > 0) {
				await this._addErrorMarkers(result.errors);
			}

			return result;
		} catch (error) {
			console.error('Grammar check failed:', error);
			throw error;
		} finally {
			this._isChecking = false;
		}
	}

	/**
	 * Add error markers to the editor
	 */
	async _addErrorMarkers(errors) {
		const editor = this.editor;
		const model = editor.model;
		
		let addedCount = 0;
		
		for (const error of errors) {
			try {
				const range = this._findTextRange(error.start, error.end);
				
				if (range) {
					// Use COLON separator for CKEditor namespaced marker matching
					const errorId = `grammalecte-error:${Date.now()}-${addedCount}`;
					
					// Store error info BEFORE adding marker so the conversion can access it
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
				console.error('Failed to add marker:', e);
			}
		}
	}



	/**
	 * Get error type configuration
	 */
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

	/**
	 * Clear all error markers
	 */
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

	/**
	 * Find a range in the model based on character offsets
	 * Converts character positions from Grammalecte to CKEditor model positions
	 * @param {number} startOffset - Start character offset
	 * @param {number} endOffset - End character offset
	 * @returns {Range|null} - Model range or null if not found
	 */
	_findTextRange(startOffset, endOffset) {
		const editor = this.editor;
		const model = editor.model;
		const root = model.document.getRoot();

		// Create a range covering the entire document content, then get walker from it
		const entireRange = model.createRangeIn(root);
		const walker = entireRange.getWalker({ ignoreElementEnd: true });
		
		let currentCharOffset = 0;
		let startPosition = null;
		let endPosition = null;

		for (const value of walker) {
			const item = value.item;
			
			if (item.is('$textProxy')) {
				const textLength = item.data.length;
				const itemStart = currentCharOffset;
				const itemEnd = currentCharOffset + textLength;

				// Check if start position is within this text segment
				if (startPosition === null && startOffset >= itemStart && startOffset < itemEnd) {
					startPosition = value.previousPosition.getShiftedBy(startOffset - itemStart);
				}

				// Check if end position is within this text segment
				if (startPosition !== null && endPosition === null && endOffset >= itemStart && endOffset <= itemEnd) {
					endPosition = value.previousPosition.getShiftedBy(endOffset - itemStart);
					break;
				}

				currentCharOffset = itemEnd;
			}
		}

		// If we found both positions, create and return the range
		if (startPosition && endPosition) {
			return model.createRange(startPosition, endPosition);
		}

		console.warn('Could not create range for offsets:', startOffset, endOffset);
		return null;
	}

	/**
	 * Replace error text with suggestion
	 */
	replaceWithError(range, suggestion) {
		const editor = this.editor;

		editor.model.change(writer => {
			writer.setSelection(range);
			editor.execute('insertText', { text: suggestion });
		});

		// Clear errors after replacement
		this._clearErrors();
	}
}

/**
 * Command to trigger grammar check
 */
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