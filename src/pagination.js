/**
 * PaginationManager - Handles A4 pagination preview using Paged.js
 * 
 * This module provides:
 * - Preview mode with paginated A4 pages (in separate window)
 * - PDF export functionality
 * - Page break management
 */

import './pagination.css';

// Use window.ipcRenderer exposed by preload script instead of importing electron
const ipcRenderer = window.ipcRenderer;

/**
 * Margin presets for page layout
 * @type {Object.<string, {top: number, right: number, bottom: number, left: number, label: string}>}
 */
const MARGIN_PRESETS = {
	normal: { top: 25, right: 20, bottom: 30, left: 20, label: 'Normal' },
	big: { top: 35, right: 30, bottom: 40, left: 30, label: 'Grandes' },
	narrow: { top: 15, right: 12, bottom: 20, left: 12, label: 'Étroites' },
	custom: { top: 25, right: 20, bottom: 30, left: 20, label: 'Personnalisées' }
};

/**
 * @typedef {Object} PaginationOptions
 * @property {boolean} [showPageNumbers] - Whether to show page numbers
 * @property {Function} [onPageChange] - Callback when page changes
 */

class PaginationManager {
	constructor() {
		/** @type {boolean} */
		this.isActive = false;
		/** @type {Map<string, Function>} */
		this.eventHandlers = new Map();
		/** @type {string} */
		this.currentMarginPreset = 'normal';
		/** @type {Object} */
		this.customMargins = { top: 25, right: 20, bottom: 30, left: 20 };
	}

	/**
	 * Initialize the pagination manager
	 * @param {import('./renderer.js').EditorInstance} editor - CKEditor instance
	 * @param {PaginationOptions} options - Configuration options
	 */
	init(editor, options = {}) {
		this.editor = editor;
		this.options = {
			showPageNumbers: true,
			...options
		};
		
		// Listen for preview window close event from main process
		if (ipcRenderer) {
			ipcRenderer.on('preview-closed', () => {
				this.isActive = false;
				this._emit('preview-disabled');
			});
		}
	}

	/**
	 * Enable preview mode - opens separate window with paginated content
	 * @returns {Promise<void>}
	 */
	async enablePreview() {
		if (this.isActive) {
			console.warn('[PaginationManager] Preview already active');
			return;
		}

		try {
			// Get content from editor
			const content = this.getContentForPrint();
			
			// Process page breaks
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = content;
			this._processPageBreaks(tempDiv);
			const processedContent = tempDiv.innerHTML;
			
			// Get pagination styles with current margins
			const styles = this._getPaginationStyles();
			const margins = this.getMargins();
			
			// Send content to main process to open in separate window
			ipcRenderer.send('show-preview', { 
				content: processedContent,
				styles: styles,
				marginPreset: this.currentMarginPreset,
				margins: margins
			});
			
			this.isActive = true;
			this._emit('preview-enabled');
		} catch (error) {
			console.error('[PaginationManager] Failed to enable preview:', error);
		}
	}

	/**
	 * Disable preview mode
	 */
	disablePreview() {
		// Preview is in separate window, just reset state
		this.isActive = false;
		this._emit('preview-disabled');
	}

	/**
	 * Toggle preview mode
	 * @returns {Promise<boolean>} - New preview state
	 */
	async togglePreview() {
		if (this.isActive) {
			this.disablePreview();
			return false;
		} else {
			await this.enablePreview();
			return true;
		}
	}

	/**
	 * Get clean HTML content from editor for printing
	 * @returns {string} - Clean HTML content
	 */
	getContentForPrint() {
		if (!this.editor) {
			console.error('[PaginationManager] No editor instance');
			return '';
		}

		// Get the full HTML content
		const content = this.editor.data.get();
		
		// Create a temporary container to process content
		const temp = document.createElement('div');
		temp.innerHTML = content;
		
		// Remove any editor-specific classes or attributes
		this._cleanContent(temp);
		
		return temp.innerHTML;
	}

	/**
	 * Insert a page break at the current cursor position
	 */
	insertPageBreak() {
		if (!this.editor) {
			console.error('[PaginationManager] No editor instance');
			return;
		}

		// Insert page break element
		const pageBreakHtml = '<div class="page-break" style="break-before: page; page-break-before: always;"></div>';
		
		this.editor.model.change(writer => {
			const viewFragment = this.editor.data.processor.toView(pageBreakHtml);
			const modelFragment = this.editor.data.toModel(viewFragment);
			this.editor.model.insertContent(modelFragment);
		});
	}

	/**
	 * Get current page count (only available in preview mode)
	 * @returns {number} - Number of pages
	 */
	getPageCount() {
		if (!this.isActive || !this.previewContainer) {
			return 0;
		}
		
		const pages = this.previewContainer.querySelectorAll('.pagedjs_page');
		return pages.length;
	}

	/**
	 * Register event handler
	 * @param {string} event - Event name
	 * @param {Function} callback - Event handler
	 */
	on(event, callback) {
		this.eventHandlers.set(event, callback);
	}

	/**
	 * Remove event handler
	 * @param {string} event - Event name
	 */
	off(event) {
		this.eventHandlers.delete(event);
	}

	// Private methods

	/**
	 * Emit event to registered handlers
	 * @param {string} event - Event name
	 * @param {*} [data] - Event data
	 */
	_emit(event, data) {
		const handler = this.eventHandlers.get(event);
		if (handler) {
			handler(data);
		}
	}

	/**
	 * Process page break markers in content
	 * @param {HTMLElement} container - Content container
	 */
	_processPageBreaks(container) {
		// Find elements with data-page-break attribute
		const breakElements = container.querySelectorAll('[data-page-break="before"]');
		breakElements.forEach(el => {
			el.classList.add('page-break');
		});

		const breakAfterElements = container.querySelectorAll('[data-page-break="after"]');
		breakAfterElements.forEach(el => {
			el.classList.add('page-break-after');
		});
	}

	/**
	 * Clean content for print
	 * @param {HTMLElement} container - Content container
	 */
	_cleanContent(container) {
		// Remove contenteditable attributes
		container.querySelectorAll('[contenteditable]').forEach(el => {
			el.removeAttribute('contenteditable');
		});

		// Remove editor-specific classes
		const editorClasses = ['ck-editor', 'ck-content', 'ck-blurred', 'ck-focused'];
		container.querySelectorAll('[class]').forEach(el => {
			editorClasses.forEach(cls => {
				if (el.classList.contains(cls)) {
					el.classList.remove(cls);
				}
			});
		});

		// Remove empty paragraphs at the end
		const paragraphs = container.querySelectorAll('p');
		for (let i = paragraphs.length - 1; i >= 0; i--) {
			if (paragraphs[i].innerHTML.trim() === '' || paragraphs[i].innerHTML === '<br>') {
				paragraphs[i].remove();
			} else {
				break;
			}
		}
	}

	/**
	 * Get pagination styles for paged.js
	 * Note: @page rules are handled separately in preview.html to allow dynamic margin updates
	 * @returns {string} - CSS styles for pagination
	 */
	_getPaginationStyles() {
		const margins = this.getMargins();
		const marginTop = margins.top;
		
		return `
@page :first {
	margin-top: ${marginTop + 5}mm;
}

.page-break {
	break-before: page;
	page-break-before: always;
}

.page-break-after {
	break-after: page;
	page-break-after: always;
}

.avoid-break {
	break-inside: avoid;
	page-break-inside: avoid;
}

p, li, h1, h2, h3, h4, h5, h6 {
	orphans: 3;
	widows: 3;
}

table, img, pre, code {
	break-inside: avoid;
}

img {
	max-width: 100%;
}

pre, code {
	white-space: pre-wrap;
	word-wrap: break-word;
}
`;
	}

	/**
	 * Get available margin presets
	 * @returns {Object} - Margin presets
	 */
	getMarginPresets() {
		return MARGIN_PRESETS;
	}

	/**
	 * Get current margin preset name
	 * @returns {string} - Current preset name
	 */
	getCurrentMarginPreset() {
		return this.currentMarginPreset;
	}

	/**
	 * Set margin preset
	 * @param {string} preset - Preset name ('normal', 'big', 'narrow', 'custom')
	 * @param {Object} [customMargins] - Custom margins (required if preset is 'custom')
	 * @returns {boolean} - Success
	 */
	setMarginPreset(preset, customMargins = null) {
		if (!MARGIN_PRESETS[preset]) {
			console.error('[PaginationManager] Invalid margin preset:', preset);
			return false;
		}

		this.currentMarginPreset = preset;
		
		if (preset === 'custom' && customMargins) {
			this.customMargins = {
				top: customMargins.top ?? 25,
				right: customMargins.right ?? 20,
				bottom: customMargins.bottom ?? 30,
				left: customMargins.left ?? 20
			};
		}

		this._emit('margin-changed', { preset, margins: this.getMargins() });
		
		// Refresh preview if active
		if (this.isActive) {
			this.refreshPreview();
		}

		return true;
	}

	/**
	 * Refresh the preview window with current content and margins
	 */
	refreshPreview() {
		if (!this.isActive) {
			return;
		}

		try {
			const content = this.getContentForPrint();
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = content;
			this._processPageBreaks(tempDiv);
			const processedContent = tempDiv.innerHTML;
			const margins = this.getMargins();
			const styles = this._getPaginationStyles();

			ipcRenderer.send('refresh-preview', {
				content: processedContent,
				styles: styles,
				margins: margins
			});
		} catch (error) {
			console.error('[PaginationManager] Failed to refresh preview:', error);
		}
	}
	/**
	 * Get current margins in mm
	 * @returns {Object} - Margins { top, right, bottom, left }
	 */
	getMargins() {
		if (this.currentMarginPreset === 'custom') {
			return this.customMargins;
		}
		const preset = MARGIN_PRESETS[this.currentMarginPreset];
		return {
			top: preset.top,
			right: preset.right,
			bottom: preset.bottom,
			left: preset.left
		};
	}
}

// Export singleton instance
export const paginationManager = new PaginationManager();
export default PaginationManager;