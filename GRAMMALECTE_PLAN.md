# Plan: Grammalecte Integration with CKEditor 5

Integrate Grammalecte French grammar checker into the Electron + CKEditor 5 WYSIWYG editor using a local Python server for text analysis and CKEditor markers for error highlighting.

## Steps

### Phase 1: Backend Setup (Grammalecte Server)

1. **Download and setup Grammalecte CLI & Server package**
   - Download `Grammalecte-fr-v2.3.0.zip` from grammalecte.net
   - Extract to project directory (e.g., `grammalecte/`)
   - Verify Python 3.7+ is available
   - *depends on nothing*

2. **Create Grammalecte server wrapper module**
   - Create `grammalecte-server.js` in project root
   - Spawn Python server process using Node.js `child_process`
   - Default port: 8080 (configurable)
   - Handle server lifecycle (start/stop with app)
   - *parallel with step 3*

3. **Add IPC handlers in main.js for grammar checking**
   - Add `grammalecte-check` handler: receives text, sends to Python server, returns errors
   - Add `grammalecte-suggestions` handler: gets spelling suggestions for a word
   - Add `grammalecte-format` handler: applies text formatting corrections
   - *parallel with step 2*

### Phase 2: Frontend Integration (CKEditor 5)

4. **Create Grammalecte service module in src/**
   - Create `src/grammalecteService.js`
   - Function `checkText(text)`: sends text to IPC, returns error array
   - Function `getSuggestions(word)`: gets spelling suggestions
   - Function `applyCorrection(errorId, suggestion)`: applies fix
   - *depends on Phase 1*

5. **Add error highlighting using CKEditor markers**
   - Create `src/grammalecteMarkers.js`
   - Use CKEditor's `Style` plugin (already configured) for error types:
     - `grammar-error`: red underline for grammar errors
     - `spelling-error`: red wavy underline for spelling errors
     - `typo-error`: blue underline for typography
   - Map error positions from Grammalecte to CKEditor model positions
   - Store error metadata in marker data for context menu
   - *depends on step 4*

6. **Add context menu for error corrections**
   - Create `src/grammalecteContextMenu.js`
   - Show context menu on right-click over error markers
   - Display suggestions from Grammalecte
   - Apply selected correction to editor content
   - Update markers after correction
   - *depends on step 5*

### Phase 3: UI & User Workflow

7. **Add Grammalecte toolbar button and menu**
   - Add "Vérifier la grammaire" button to toolbar
   - Add keyboard shortcut (Ctrl+Shift+G or F7)
   - Show check status indicator (checking/complete/error count)
   - *depends on Phase 2*

8. **Add Grammalecte options panel**
   - Create options dialog for Grammalecte settings
   - Toggle grammar/spelling/typography checks
   - Select dictionary variant (Classique/Réforme 1990/Toutes variantes)
   - Store preferences in `store.js`
   - *depends on step 7*

9. **Implement real-time checking (optional)**
   - Debounced check on content change (500ms delay)
   - Only check visible paragraphs for performance
   - Clear markers on text change in checked regions
   - *depends on step 8*

### Phase 4: Testing & Polish

10. **Add error handling and edge cases**
    - Handle server not running gracefully
    - Handle large documents (chunk text into paragraphs)
    - Handle network errors with retry logic
    - Handle overlapping errors (Grammalecte limitation)
    - *depends on Phase 3*

11. **Write documentation and user guide**
    - Add README section for Grammalecte integration
    - Document keyboard shortcuts
    - Document configuration options
    - Add troubleshooting guide
    - *depends on step 10*

## Relevant Files

- `main.js` — Add IPC handlers for Grammalecte communication (lines 17-71 for spellcheck config)
- `src/renderer.js` — Initialize Grammalecte service, add toolbar button (lines 1-500 for editor config)
- `src/style.css` — Add CSS for error markers and context menu
- `store.js` — Store Grammalecte preferences
- `grammalecte-server.js` — **NEW** Node.js wrapper for Python server
- `src/grammalecteService.js` — **NEW** Frontend service for IPC communication
- `src/grammalecteMarkers.js` — **NEW** CKEditor marker management
- `src/grammalecteContextMenu.js` — **NEW** Context menu for corrections

## Verification

1. **Backend verification**
   - Run `python grammalecte-server.py` manually and test with curl
   - Verify IPC handlers return correct error format
   - Test with malformed input (empty, very long, special characters)

2. **Frontend verification**
   - Type French text with intentional errors
   - Click "Vérifier la grammaire" button
   - Verify errors are highlighted with correct colors
   - Right-click on error, verify context menu appears
   - Select suggestion, verify text is corrected
   - Verify markers update after correction

3. **Integration verification**
   - Test with real French document (sample provided)
   - Verify performance on 10+ page document
   - Test all error types: grammar, spelling, typography
   - Test dictionary variants
   - Test with server restart mid-session

4. **User acceptance**
   - Native French speaker tests the integration
   - Verify all error types are detected correctly
   - Verify suggestions are appropriate
   - Verify no false positives overwhelm user

## Decisions

- **Architecture**: Local Python server (not WebExtension API) because:
  - Electron has full Node.js access
  - Better performance (no browser extension dependency)
  - Full control over server lifecycle
  - Can use CLI/Server package directly

- **Error highlighting**: CKEditor markers (not native spellcheck) because:
  - Grammalecte provides grammar + spelling + typography
  - Need custom styling for different error types
  - Need context menu with suggestions
  - Native spellcheck only handles spelling

- **Real-time checking**: Optional (default off) because:
  - Performance impact on large documents
  - Grammalecte server may not handle rapid requests
  - User may prefer manual checking

- **Scope**: French only (no English) because:
  - Grammalecte is French-specific
  - Native spellcheck already handles English
  - Can combine both: Grammalecte for French, native for English

## Further Considerations

1. **Should we bundle Python with the app or require users to install it?**
   - Option A: Bundle Python (larger app size, guaranteed to work)
   - Option B: Require Python 3.7+ (smaller app, may fail if not installed)
   - Recommendation: Option B for development, Option A for production release

2. **Should we support both Grammalecte and native spellcheck simultaneously?**
   - Option A: Grammalecte only (simpler, consistent)
   - Option B: Both (Grammalecte for French, native for English)
   - Recommendation: Option B for better user experience

3. **Should we add a Grammalecte panel showing all errors in a list?**
   - Option A: Markers only (minimal UI)
   - Option B: Add sidebar panel with error list (like VS Code problems panel)
   - Recommendation: Start with Option A, add Option B in future iteration