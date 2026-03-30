/**
 * Ollama API Client
 * Handles communication with local Ollama instance at localhost:11434
 */

const OLLAMA_DEFAULT_URL = 'http://localhost:11434';
export const DEFAULT_MODEL = 'llama3';

/**
 * Check if Ollama is running and accessible
 * @param {string} baseUrl - Ollama server URL
 * @returns {Promise<boolean>} - True if Ollama is running
 */
export async function checkOllamaConnection(baseUrl = OLLAMA_DEFAULT_URL) {
	try {
		const response = await fetch(`${baseUrl}/api/tags`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		return response.ok;
	} catch (error) {
		console.error('Ollama connection check failed:', error);
		return false;
	}
}

/**
 * Get list of available models from Ollama
 * @param {string} baseUrl - Ollama server URL
 * @returns {Promise<Array<string>>} - List of available model names
 */
export async function getAvailableModels(baseUrl = OLLAMA_DEFAULT_URL) {
	try {
		const response = await fetch(`${baseUrl}/api/tags`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const data = await response.json();
		
		// Extract model names from the response
		const modelNames = (data.models || []).map(model => model.name);
		return modelNames;
	} catch (error) {
		console.error('Failed to get available models:', error);
		return [];
	}
}

/**
 * Send a prompt to Ollama and get a response
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Configuration options
 * @param {string} options.model - Model to use (default: llama3)
 * @param {string} options.baseUrl - Ollama server URL
 * @param {string} options.system - System prompt to set context
 * @param {number} options.maxTokens - Maximum tokens to generate
 * @param {function} options.onToken - Callback for streaming tokens
 * @returns {Promise<string>} - The generated response
 */
export async function fetchOllamaResponse(prompt, options = {}) {
	const {
		model = DEFAULT_MODEL,
		baseUrl = OLLAMA_DEFAULT_URL,
		system = null,
		maxTokens = 2048,
		onToken = null
	} = options;

	const requestBody = {
		model,
		prompt,
		stream: !!onToken,
		options: {
			num_predict: maxTokens,
			temperature: 0.7
		}
	};

	if (system) {
		requestBody.system = system;
	}

	try {
		const response = await fetch(`${baseUrl}/api/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
		}

		if (onToken) {
			// Streaming mode
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let fullResponse = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk.split('\n').filter(line => line.trim());

				for (const line of lines) {
					try {
						const json = JSON.parse(line);
						if (json.response) {
							fullResponse += json.response;
							onToken(json.response, fullResponse);
						}
					} catch (e) {
						// Skip invalid JSON lines
					}
				}
			}

			return fullResponse;
		} else {
			// Non-streaming mode
			const data = await response.json();
			return data.response || '';
		}
	} catch (error) {
		console.error('Ollama API request failed:', error);
		throw error;
	}
}

/**
 * Generate completion for given text
 * @param {string} text - Context text to complete
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Completed text
 */
export async function generateCompletion(text, options = {}) {
	const systemPrompt = `You are a helpful writing assistant. Complete the given text naturally and coherently. Only provide the completion, not the entire text. Keep completions concise and relevant.`;
	
	const prompt = `Complete this text: "${text}"`;
	
	return fetchOllamaResponse(prompt, {
		...options,
		system: systemPrompt
	});
}

/**
 * Fix grammar and improve style of given text
 * @param {string} text - Text to correct
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Corrected text
 */
export async function fixGrammarAndStyle(text, options = {}) {
	const systemPrompt = `You are a professional editor. Fix grammar, spelling, and improve writing style. Only output the corrected text, no explanations.`;
	
	const prompt = `Fix the grammar and style of this text: "${text}"`;
	
	return fetchOllamaResponse(prompt, {
		...options,
		system: systemPrompt
	});
}

/**
 * Generate content based on a prompt
 * @param {string} userPrompt - User's content request
 * @param {string} context - Optional context (e.g., selected text)
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Generated content
 */
export async function generateContent(userPrompt, context = '', options = {}) {
	const systemPrompt = `You are a helpful writing assistant for an HTML editor. Generate high-quality, well-formatted content based on user requests. Be concise and relevant.`;
	
	let prompt = userPrompt;
	if (context) {
		prompt = `Context: "${context}"\n\nRequest: ${userPrompt}`;
	}
	
	return fetchOllamaResponse(prompt, {
		...options,
		system: systemPrompt
	});
}

export default {
	checkOllamaConnection,
	getAvailableModels,
	fetchOllamaResponse,
	generateCompletion,
	fixGrammarAndStyle,
	generateContent,
	OLLAMA_DEFAULT_URL,
	DEFAULT_MODEL
};