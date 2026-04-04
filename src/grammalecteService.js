/**
 * Grammalecte Service Module
 * Provides French grammar checking integration via IPC with the main process
 */

/**
 * Grammalecte Service
 * Handles communication with the Grammalecte Python server through the main process
 */
export class GrammalecteService {
	constructor() {
		this.isServerRunning = false;
		this.checkInProgress = false;
	}

	/**
	 * Invoke an IPC handler with proper error handling
	 * @param {string} channel - The IPC channel name
	 * @param {...any} args - Arguments to pass
	 * @returns {Promise<any>}
	 */
	async invoke(channel, ...args) {
		if (!window.ipcRenderer) {
			throw new Error('IPC renderer not available');
		}
		return window.ipcRenderer.invoke(channel, ...args);
	}

	/**
	 * Start the Grammalecte server
	 * @returns {Promise<{success: boolean, message: string}>}
	 */
	async startServer() {
		try {
			const result = await this.invoke('grammalecte-start');
			this.isServerRunning = result.success;
			return result;
		} catch (error) {
			console.error('[GrammalecteService] Failed to start server:', error);
			return { success: false, message: error.message };
		}
	}

	/**
	 * Stop the Grammalecte server
	 * @returns {Promise<{success: boolean, message: string}>}
	 */
	async stopServer() {
		try {
			const result = await this.invoke('grammalecte-stop');
			this.isServerRunning = false;
			return result;
		} catch (error) {
			console.error('Failed to stop Grammalecte server:', error);
			return { success: false, message: error.message };
		}
	}

	/**
	 * Check if the server is running
	 * @returns {boolean}
	 */
	getServerStatus() {
		return this.isServerRunning;
	}

	/**
	 * Check text for grammar errors
	 * @param {string} text - The text to check
	 * @param {Object} options - Optional grammar checking options
	 * @returns {Promise<{success: boolean, errors: Array, message?: string}>}
	 */
	async checkGrammar(text, options = {}) {
		if (this.checkInProgress) {
			return { success: false, errors: [], message: 'A grammar check is already in progress' };
		}

		this.checkInProgress = true;

		try {
			// Ensure server is running
			if (!this.isServerRunning) {
				const startResult = await this.startServer();
				if (!startResult.success) {
					return { success: false, errors: [], message: startResult.message };
				}
			}

			const result = await this.invoke('grammalecte-check', text, options);
			
			// Transform the Grammalecte response to extract errors
			// Pass original text to calculate correct offsets across paragraphs
			const errors = this._extractErrors(result, text);
			
			return { 
				success: result.success, 
				errors: errors,
				rawResult: result.result 
			};
		} catch (error) {
			console.error('[GrammalecteService] Grammar check failed:', error);
			return { success: false, errors: [], message: error.message };
		} finally {
			this.checkInProgress = false;
		}
	}

	/**
	 * Extract and normalize errors from Grammalecte response
	 * Grammalecte splits text by newlines into paragraphs, and each paragraph's
	 * error offsets are relative to that paragraph (starting from 0).
	 * The iParagraph field (1-indexed) tells us which paragraph has errors.
	 * @private
	 * @param {Object} result - The Grammalecte result object
	 * @param {string} originalText - The original text that was checked
	 * @returns {Array} Array of error objects with absolute offsets
	 */
	_extractErrors(result, originalText) {
		if (!result.success || !result.result?.data) {
			return [];
		}

		// Normalize line endings to match Grammalecte's processing
		const normalizedText = originalText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
		
		// Split into paragraphs (matching Grammalecte's getParagraph logic)
		const allParagraphs = normalizedText.split('\n');
		
		// Build a map: paragraph index (1-indexed) -> start position in original text
		const paragraphStarts = new Map();
		let offset = 0;
		
		for (let i = 0; i < allParagraphs.length; i++) {
			// Grammalecte uses 1-indexed paragraph numbers
			paragraphStarts.set(i + 1, offset);
			offset += allParagraphs[i].length + 1; // +1 for the newline
		}
		
		const errors = [];
		
		// Process each result - it only contains paragraphs with errors
		for (const paragraph of result.result.data) {
			// iParagraph tells us which paragraph this is (1-indexed)
			const paragraphIndex = paragraph.iParagraph;
			const paragraphStart = paragraphStarts.get(paragraphIndex);
			
			if (paragraphStart === undefined) {
				continue;
			}
			
			if (paragraph.lGrammarErrors) {
				for (const err of paragraph.lGrammarErrors) {
					const absStart = err.nStart + paragraphStart;
					const absEnd = err.nEnd + paragraphStart;
					
					errors.push({
						start: absStart,
						end: absEnd,
						message: err.sMessage,
						suggestions: err.aSuggestions || [],
						type: err.sType,
						ruleId: err.sRuleId,
						lineId: err.sLineId
					});
				}
			}
			
			if (paragraph.lSpellingErrors) {
				for (const err of paragraph.lSpellingErrors) {
					const absStart = err.nStart + paragraphStart;
					const absEnd = err.nEnd + paragraphStart;
					
					errors.push({
						start: absStart,
						end: absEnd,
						message: err.sMessage || 'Spelling error',
						suggestions: err.aSuggestions || [],
						type: 'spelling',
						ruleId: err.sRuleId
					});
				}
			}
		}
		
		return errors;
	}

	/**
	 * Get spelling suggestions for a word
	 * @param {string} word - The word to get suggestions for
	 * @returns {Promise<{success: boolean, suggestions: Array, message?: string}>}
	 */
	async getSuggestions(word) {
		try {
			// Ensure server is running
			if (!this.isServerRunning) {
				const startResult = await this.startServer();
				if (!startResult.success) {
					return { success: false, suggestions: [], message: startResult.message };
				}
			}

			const result = await this.invoke('grammalecte-suggest', word);
			return result;
		} catch (error) {
			console.error('Failed to get suggestions:', error);
			return { success: false, suggestions: [], message: error.message };
		}
	}

	/**
	 * Get available grammar options
	 * @returns {Promise<{success: boolean, options: Object, message?: string}>}
	 */
	async getOptions() {
		try {
			const result = await this.invoke('grammalecte-get-options');
			return result;
		} catch (error) {
			console.error('Failed to get options:', error);
			return { success: false, options: {}, message: error.message };
		}
	}

	/**
	 * Set grammar options
	 * @param {Object} options - The options to set
	 * @returns {Promise<{success: boolean, message?: string}>}
	 */
	async setOptions(options) {
		try {
			const result = await this.invoke('grammalecte-set-options', options);
			return result;
		} catch (error) {
			console.error('Failed to set options:', error);
			return { success: false, message: error.message };
		}
	}

	/**
	 * Parse grammar errors from Grammalecte response
	 * @param {Array} errors - Raw errors from Grammalecte
	 * @returns {Array} Parsed errors with position and message
	 */
	parseErrors(errors) {
		if (!errors || !Array.isArray(errors)) {
			return [];
		}

		return errors.map(error => ({
			start: error.nStart || 0,
			end: error.nEnd || 0,
			message: error.sMessage || '',
			type: error.sType || 'unknown',
			suggestions: error.aSuggestions || [],
			url: error.sURL || null,
			ruleId: error.sRuleId || ''
		}));
	}

	/**
	 * Format error message for display
	 * @param {Object} error - Parsed error object
	 * @returns {string} Formatted message
	 */
	formatErrorMessage(error) {
		let message = error.message;
		if (error.suggestions && error.suggestions.length > 0) {
			message += `\nSuggestions: ${error.suggestions.join(', ')}`;
		}
		return message;
	}
}

// Export singleton instance
export const grammalecteService = new GrammalecteService();