/**
 * Grammalecte JavaScript API Wrapper
 * Provides direct access to Grammalecte grammar checking without server
 */

// Load Map prototype extensions first (required by Grammalecte)
require('./grammalecte-wrapper/grammalecte/graphspell/map_extensions.js');

const { GrammarChecker } = require('./grammalecte-wrapper/api.js');

class GrammalecteWrapper {
  constructor() {
    this.checker = null;
    this.isLoaded = false;
  }

  /**
   * Initialize the grammar checker
   * @returns {Promise<void>}
   */
  async load() {
    if (this.isLoaded) {
      return;
    }

    try {
      console.log('[GrammalecteWrapper] Initializing GrammarChecker...');
      this.checker = new GrammarChecker(null, "fr", "Javascript");
      
      console.log('[GrammalecteWrapper] Loading Grammalecte...');
      this.checker.load(["Grammalecte"]);
      
      this.isLoaded = true;
      console.log('[GrammalecteWrapper] ✓ Grammalecte loaded successfully');
    } catch (error) {
      console.error('[GrammalecteWrapper] Failed to load:', error);
      throw error;
    }
  }

  /**
   * Ensure the checker is loaded before operations
   * @private
   */
  async ensureLoaded() {
    if (!this.isLoaded) {
      await this.load();
    }
  }

  /**
   * Check grammar for the given text
   * @param {string} text - Text to check
   * @param {object} options - Grammar checking options (optional)
   * @returns {Promise<object>} - Grammar check results
   */
  async checkGrammar(text, options = null) {
    await this.ensureLoaded();

    try {
      console.log('[GrammalecteWrapper] Checking grammar for text length:', text.length);
      
      // Use the gramma method from GrammarChecker
      const results = this.checker.gramma(text);
      
      console.log('[GrammalecteWrapper] Grammar check completed, found', results.length, 'issues');
      
      // Transform results to match the expected format
      // Grammalecte returns an array of paragraph results
      const transformedResults = this._transformResults(results, text);
      
      return {
        success: true,
        result: transformedResults
      };
    } catch (error) {
      console.error('[GrammalecteWrapper] Grammar check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Transform Grammalecte results to match the expected API format
   * @private
   * @param {Array} results - Raw results from GrammarChecker.gramma()
   * @param {string} originalText - Original text that was checked
   * @returns {object} - Transformed results in expected format
   */
  _transformResults(results, originalText) {
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
    
    // Transform results into the expected format
    // The results array contains objects with nStart, nEnd, sMessage, etc.
    // We need to group them by paragraph
    const data = [];
    
    // Group errors by paragraph
    const paragraphErrors = new Map();
    
    for (const error of results) {
      // Find which paragraph this error belongs to
      let paragraphIndex = 1;
      let paragraphStart = 0;
      
      for (let i = allParagraphs.length - 1; i >= 0; i--) {
        const start = paragraphStarts.get(i + 1);
        if (error.nStart >= start) {
          paragraphIndex = i + 1;
          paragraphStart = start;
          break;
        }
      }
      
      if (!paragraphErrors.has(paragraphIndex)) {
        paragraphErrors.set(paragraphIndex, {
          iParagraph: paragraphIndex,
          lGrammarErrors: [],
          lSpellingErrors: []
        });
      }
      
      const paragraph = paragraphErrors.get(paragraphIndex);
      
      // Adjust offsets to be relative to paragraph start
      const relativeStart = error.nStart - paragraphStart;
      const relativeEnd = error.nEnd - paragraphStart;
      
      // Determine if this is a grammar or spelling error
      const errorType = error.sType || 'grammar';
      
      const errorObj = {
        nStart: relativeStart,
        nEnd: relativeEnd,
        sMessage: error.sMessage,
        aSuggestions: error.aSuggestions || [],
        sType: errorType,
        sRuleId: error.sRuleId,
        sLineId: error.sLineId
      };
      
      if (errorType === 'spelling') {
        paragraph.lSpellingErrors.push(errorObj);
      } else {
        paragraph.lGrammarErrors.push(errorObj);
      }
    }
    
    // Convert map to array
    for (const paragraph of paragraphErrors.values()) {
      data.push(paragraph);
    }
    
    return { data };
  }

  /**
   * Get spelling suggestions for a word
   * @param {string} word - Word to get suggestions for
   * @returns {Promise<object>} - Suggestions object
   */
  async getSuggestions(word) {
    await this.ensureLoaded();

    try {
      console.log('[GrammalecteWrapper] Getting suggestions for:', word);
      
      // Use the suggest method from GrammarChecker
      const suggestions = this.checker.suggest(word, 5);
      
      return {
        success: true,
        result: {
          word: word,
          suggestions: suggestions || []
        }
      };
    } catch (error) {
      console.error('[GrammalecteWrapper] Get suggestions failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a word is spelled correctly
   * @param {string} word - Word to check
   * @returns {Promise<boolean>} - True if word is valid
   */
  async isValidWord(word) {
    await this.ensureLoaded();

    try {
      return this.checker.spell(word);
    } catch (error) {
      console.error('[GrammalecteWrapper] Spell check failed:', error);
      return false;
    }
  }

  /**
   * Get available grammar options
   * Note: The JavaScript API doesn't have a direct method for this,
   * so we return default options
   * @returns {Promise<object>} - Options with labels
   */
  async getOptions() {
    await this.ensureLoaded();

    // Return default options
    // The JavaScript API uses gc_options module for options management
    return {
      success: true,
      result: {
        // Default Grammalecte options
        "typo": true,
        "apos": true,
        "esp": true,
        "tab": true,
        "nbsp": true,
        "tu": true,
        "num": true,
        "unit": true,
        "conf": true,
        "ocr": true
      }
    };
  }

  /**
   * Set grammar options
   * Note: The JavaScript API manages options internally
   * @param {object} options - Options to set
   * @returns {Promise<object>} - Updated options
   */
  async setOptions(options) {
    await this.ensureLoaded();

    try {
      // The JavaScript API uses gc_options module
      // For now, we'll just return success
      // In a full implementation, we would call gc_options.setOptions()
      return {
        success: true,
        result: options
      };
    } catch (error) {
      console.error('[GrammalecteWrapper] Set options failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const grammalecteWrapper = new GrammalecteWrapper();

module.exports = {
  GrammalecteWrapper,
  grammalecteWrapper
};