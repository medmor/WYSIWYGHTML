#!/usr/bin/env node

// Test script for Grammalecte JavaScript API

// Load Map prototype extensions first
require('./grammalecte-wrapper/grammalecte/graphspell/map_extensions.js');

const { GrammarChecker } = require('./grammalecte-wrapper/api.js');

console.log('Testing Grammalecte JavaScript API...\n');

try {
    // Initialize grammar checker
    console.log('Initializing GrammarChecker...');
    const checker = new GrammarChecker(null, "fr", "Javascript");
    
    // Load grammar checker
    console.log('Loading Grammalecte...');
    checker.load(["Grammalecte"]);
    
    console.log('✓ GrammarChecker initialized successfully\n');
    
    // Test grammar checking
    const testText = "C'est un teste simple avec des erreurs.";
    console.log(`Testing grammar check on: "${testText}"`);
    
    const results = checker.gramma(testText);
    
    console.log('✓ Grammar check completed\n');
    console.log('Results:', JSON.stringify(results, null, 2));
    
    // Test spell checking
    console.log('\n--- Testing spell checking ---');
    const spellResult = checker.spell("teste");
    console.log(`Is "teste" valid? ${spellResult}`);
    
    const suggestions = checker.suggest("teste", 5);
    console.log(`Suggestions for "teste":`, suggestions);
    
    console.log('\n✓ All tests passed!');
    
} catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}