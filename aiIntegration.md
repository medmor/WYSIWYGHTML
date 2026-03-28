# Ollama AI Integration Plan for WYSIWYG HTML Editor

## Overview

Add an AI-powered sidebar panel that connects to Ollama (running locally at `localhost:11434`) to provide smart completions, grammar/style correction, and content generation directly within the CKEditor 5 interface.

## Features

- **Smart completions** - Auto-complete sentences and paragraphs as you type
- **Grammar & style correction** - Fix grammar, spelling, and improve writing style
- **Content generation** - Generate new content based on user prompts
- **Context-aware suggestions** - AI responses based on selected text and prompts

## Implementation Steps

### 1. Add AI Sidebar UI to `index.html`
- Create a sidebar panel next to the editor (similar to CKEditor's existing sidebar structure)
- Add input field for user prompts and output display area
- Include action buttons: "Generate", "Fix Grammar", "Complete", "Clear"

### 2. Create Ollama API Client Module (`src/ollamaClient.js`)
- Implement `fetchOllamaResponse(prompt, model)` function
- Handle connection to `http://localhost:11434/api/generate`
- Support error handling for connection failures
- Default model: `llama3` (can be adjusted)

### 3. Add AI Functionality Module (`src/aiFeatures.js`)
- Implement content generation from prompt
- Grammar/style correction wrapper
- Smart text completion
- Context-aware suggestions (selected text + prompt)

### 4. Integrate with CKEditor 5
- Add sidebar toggle button to editor toolbar
- Connect AI features to editor's selected text
- Insert AI-generated content back into editor

### 5. Add Configuration (Optional Future Enhancement)
- Store Ollama URL and model preference in localStorage
- Settings panel for advanced users

## File Changes

### Modified Files
- `index.html` — Add AI sidebar UI structure
- `src/editor.js` — Add AI sidebar toggle and integration
- `src/style.css` — Add sidebar styling

### New Files
- `src/ollamaClient.js` — New file for Ollama API client
- `src/aiFeatures.js` — New file for AI functionality

## Verification Steps

1. Start Ollama locally and verify it's running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Launch the app:
   ```bash
   npm start
   ```

3. Test AI sidebar:
   - Click AI sidebar button in toolbar
   - Enter prompt like "Write a short paragraph about HTML"
   - Verify response appears in sidebar
   - Click "Insert" to add to editor

4. Test grammar correction on selected text
5. Test smart completion on partial text

## Decisions

- **Ollama URL**: Default to `localhost:11434` (standard Ollama default)
- **Default model**: `llama3` (lightweight, good for text generation)
- **UI approach**: Sidebar panel (non-intrusive, similar to CKEditor's existing AI feature)
- **Connection**: Direct HTTP calls (no additional dependencies needed)

## Future Enhancements

1. Model selection dropdown (to switch between `llama3`, `mistral`, `codellama`, etc.)
2. Streaming responses (shows text as it's generated) vs wait for complete response
3. Quick Actions menu with preset prompts (e.g., "Summarize", "Translate", "Expand")
4. Configuration settings for Ollama URL and model preference
5. History of AI interactions
6. Multiple AI providers support (OpenAI, Anthropic, etc.)
