/**
 * AI Features Module
 * Provides AI-powered features for the CKEditor 5 WYSIWYG editor
 */

import {
	checkOllamaConnection,
	getAvailableModels,
	fetchOllamaResponse,
	generateCompletion,
	fixGrammarAndStyle,
	generateContent,
	DEFAULT_MODEL
} from './ollamaClient.js';

/**
 * AI Features Manager
 * Handles AI sidebar interactions and editor integration
 */
export class AIFeatures {
	constructor(editor) {
		this.editor = editor;
		this.isConnected = false;
		this.selectedModel = DEFAULT_MODEL;
		this.availableModels = [];
		this.sidebarElement = null;
		this.outputElement = null;
		this.promptElement = null;
		this.statusElement = null;
	}

	/**
	 * Initialize AI features
	 */
	async initialize() {
		await this.checkConnection();
		await this.loadModels();
		this.setupEventListeners();
	}

	/**
	 * Check Ollama connection status
	 */
	async checkConnection() {
		this.isConnected = await checkOllamaConnection();
		this.updateConnectionStatus();
		return this.isConnected;
	}

	/**
	 * Load available models from Ollama
	 */
	async loadModels() {
		if (this.isConnected) {
			this.availableModels = await getAvailableModels();
			this.updateModelSelector();
		}
	}

	/**
	 * Update connection status display
	 */
	updateConnectionStatus() {
		if (this.statusElement) {
			if (this.isConnected) {
				this.statusElement.textContent = `Connected (${this.selectedModel})`;
				this.statusElement.className = 'ai-status connected';
			} else {
				this.statusElement.textContent = 'Disconnected - Is Ollama running?';
				this.statusElement.className = 'ai-status disconnected';
			}
		}
	}

	/**
	 * Update model selector dropdown
	 */
	updateModelSelector() {
		const selector = document.getElementById('ai-model');
		if (selector && this.availableModels.length > 0) {
			selector.innerHTML = this.availableModels
				.map(model => `<option value="${model}">${model}</option>`)
				.join('');
			selector.disabled = false;
			selector.value = this.selectedModel;
			// Enable action buttons now that models are loaded
			this.enableActionButtons(true);
		}
	}

	/**
	 * Enable/disable action buttons
	 * @param {boolean} enable - Enable or disable buttons
	 */
	enableActionButtons(enable) {
		const buttonIds = ['ai-generate', 'ai-fix-grammar', 'ai-complete'];
		buttonIds.forEach(id => {
			const btn = document.getElementById(id);
			if (btn) {
				btn.disabled = !enable;
			}
		});
	}

	/**
	 * Setup event listeners for AI sidebar
	 */
	setupEventListeners() {
		// Generate button
		const generateBtn = document.getElementById('ai-generate');
		if (generateBtn) {
			generateBtn.addEventListener('click', () => this.handleGenerate());
		}

		// Fix grammar button
		const fixGrammarBtn = document.getElementById('ai-fix-grammar');
		if (fixGrammarBtn) {
			fixGrammarBtn.addEventListener('click', () => this.handleFixGrammar());
		}

		// Complete button
		const completeBtn = document.getElementById('ai-complete');
		if (completeBtn) {
			completeBtn.addEventListener('click', () => this.handleComplete());
		}

		// Insert button
		const insertBtn = document.getElementById('ai-insert');
		if (insertBtn) {
			insertBtn.addEventListener('click', () => this.handleInsert());
		}

		// Model selector
		const modelSelect = document.getElementById('ai-model');
		if (modelSelect) {
			modelSelect.addEventListener('change', (e) => {
				this.selectedModel = e.target.value;
				this.updateConnectionStatus();
			});
		}
	}

	/**
	 * Get selected text from editor
	 * @returns {string} Selected text
	 */
	getSelectedText() {
		const model = this.editor.model;
		const selection = model.document.selection;
		
		if (selection.isCollapsed) {
			return '';
		}

		const range = selection.getFirstRange();
		let text = '';
		
		for (const item of range.getItems()) {
			if (item.is('$textProxy')) {
				text += item.data;
			}
		}
		
		return text;
	}

	/**
	 * Insert text at cursor position
	 * @param {string} text - Text to insert
	 */
	insertText(text) {
		const model = this.editor.model;
		
		model.change(writer => {
			const selection = model.document.selection;
			const position = selection.getFirstPosition();
			
			// If there's a selection, replace it
			if (!selection.isCollapsed) {
				const range = selection.getFirstRange();
				writer.remove(range);
			}
			
			writer.insertText(text, position);
		});
	}

	/**
	 * Replace selected text with new text
	 * @param {string} text - Replacement text
	 */
	replaceSelectedText(text) {
		const model = this.editor.model;
		const selection = model.document.selection;
		
		model.change(writer => {
			if (!selection.isCollapsed) {
				const range = selection.getFirstRange();
				writer.remove(range);
				writer.insertText(text, range.start);
			}
		});
	}

	/**
	 * Handle generate button click
	 */
	async handleGenerate() {
		const prompt = this.promptElement?.value || document.getElementById('ai-prompt')?.value;
		
		if (!prompt?.trim()) {
			this.showError('Please enter a prompt');
			return;
		}

		if (!this.isConnected) {
			this.showError('Not connected to Ollama. Please check if Ollama is running.');
			return;
		}

		this.showLoading(true);
		this.clearOutput();

		try {
			const selectedText = this.getSelectedText();
			const response = await generateContent(prompt, selectedText, {
				model: this.selectedModel
			});
			
			this.showOutput(response);
		} catch (error) {
			this.showError(`Error: ${error.message}`);
		} finally {
			this.showLoading(false);
		}
	}

	/**
	 * Handle fix grammar button click
	 */
	async handleFixGrammar() {
		const selectedText = this.getSelectedText();
		
		if (!selectedText) {
			this.showError('Please select some text to fix');
			return;
		}

		if (!this.isConnected) {
			this.showError('Not connected to Ollama. Please check if Ollama is running.');
			return;
		}

		this.showLoading(true);
		this.clearOutput();

		try {
			const response = await fixGrammarAndStyle(selectedText, {
				model: this.selectedModel
			});
			
			this.showOutput(response);
		} catch (error) {
			this.showError(`Error: ${error.message}`);
		} finally {
			this.showLoading(false);
		}
	}

	/**
	 * Handle complete button click
	 */
	async handleComplete() {
		const selectedText = this.getSelectedText();
		
		if (!selectedText) {
			this.showError('Please select some text to complete');
			return;
		}

		if (!this.isConnected) {
			this.showError('Not connected to Ollama. Please check if Ollama is running.');
			return;
		}

		this.showLoading(true);
		this.clearOutput();

		try {
			const response = await generateCompletion(selectedText, {
				model: this.selectedModel
			});
			
			this.showOutput(response);
		} catch (error) {
			this.showError(`Error: ${error.message}`);
		} finally {
			this.showLoading(false);
		}
	}

	/**
	 * Handle clear button click
	 */
	handleClear() {
		this.clearPrompt();
		this.clearOutput();
	}

	/**
	 * Handle insert button click
	 */
	handleInsert() {
		const output = this.outputElement?.textContent || document.getElementById('ai-output')?.textContent;
		
		if (!output) {
			this.showError('No content to insert');
			return;
		}

		const selectedText = this.getSelectedText();
		
		if (selectedText) {
			// Replace selected text
			this.replaceSelectedText(output);
		} else {
			// Insert at cursor
			this.insertText(output);
		}
	}

	/**
	 * Refresh connection to Ollama
	 */
	async refreshConnection() {
		this.showLoading(true);
		await this.checkConnection();
		await this.loadModels();
		this.showLoading(false);
	}

	/**
	 * Show output in sidebar
	 * @param {string} text - Output text
	 */
	showOutput(text) {
		const output = this.outputElement || document.getElementById('ai-output');
		if (output) {
			output.innerHTML = text;
			output.className = 'ai-output success';
		}
	}

	/**
	 * Show error message
	 * @param {string} message - Error message
	 */
	showError(message) {
		const output = this.outputElement || document.getElementById('ai-output');
		if (output) {
			output.textContent = message;
			output.className = 'ai-output error';
		}
	}

	/**
	 * Clear output area
	 */
	clearOutput() {
		const output = this.outputElement || document.getElementById('ai-output');
		if (output) {
			output.textContent = '';
			output.className = 'ai-output';
		}
	}

	/**
	 * Clear prompt input
	 */
	clearPrompt() {
		const prompt = this.promptElement || document.getElementById('ai-prompt');
		if (prompt) {
			prompt.value = '';
		}
	}

	/**
	 * Show/hide loading indicator
	 * @param {boolean} show - Show loading state
	 */
	showLoading(show) {
		const loading = document.getElementById('ai-loading');
		if (loading) {
			loading.style.display = show ? 'block' : 'none';
		}

		const buttons = ['ai-generate', 'ai-fix-grammar', 'ai-complete', 'ai-insert'];
		buttons.forEach(id => {
			const btn = document.getElementById(id);
			if (btn) {
				btn.disabled = show;
			}
		});
	}
}

export default AIFeatures;