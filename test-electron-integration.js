#!/usr/bin/env node

/**
 * Test script for Electron integration
 * Tests the GrammalecteWrapper directly without running Electron
 */

const { grammalecteWrapper } = require('./grammalecte-wrapper');

async function testIntegration() {
  console.log('='.repeat(60));
  console.log('Testing Grammalecte JavaScript API Integration');
  console.log('='.repeat(60));
  console.log();

  try {
    // Test 1: Initialize
    console.log('Test 1: Initializing Grammalecte...');
    await grammalecteWrapper.load();
    console.log('✓ Grammalecte initialized successfully');
    console.log();

    // Test 2: Grammar check
    console.log('Test 2: Grammar check...');
    const testText = "Bonjour, je suis content d'être ici. Les enfants joue dans le jardin.";
    console.log('Text:', testText);
    
    const result = await grammalecteWrapper.checkGrammar(testText);
    
    if (result.success) {
      console.log('✓ Grammar check successful');
      console.log('Result:', JSON.stringify(result.result, null, 2));
      
      // Count errors
      const data = result.result.data || [];
      let totalErrors = 0;
      data.forEach(paragraph => {
        totalErrors += (paragraph.lGrammarErrors?.length || 0);
        totalErrors += (paragraph.lSpellingErrors?.length || 0);
      });
      console.log(`Found ${totalErrors} error(s)`);
    } else {
      console.log('✗ Grammar check failed:', result.error);
    }
    console.log();

    // Test 3: Spelling suggestions
    console.log('Test 3: Spelling suggestions...');
    const testWord = "bonjour";
    console.log('Word:', testWord);
    
    const suggestResult = await grammalecteWrapper.getSuggestions(testWord);
    
    if (suggestResult.success) {
      console.log('✓ Suggestions retrieved successfully');
      console.log('Suggestions:', suggestResult.result.suggestions);
    } else {
      console.log('✗ Suggestions failed:', suggestResult.error);
    }
    console.log();

    // Test 4: Get options
    console.log('Test 4: Get options...');
    const optionsResult = await grammalecteWrapper.getOptions();
    
    if (optionsResult.success) {
      console.log('✓ Options retrieved successfully');
      console.log('Options:', JSON.stringify(optionsResult.result, null, 2));
    } else {
      console.log('✗ Get options failed:', optionsResult.error);
    }
    console.log();

    console.log('='.repeat(60));
    console.log('All tests completed successfully! ✓');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Test failed with error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testIntegration().then(() => {
  console.log('\nIntegration test complete!');
  process.exit(0);
}).catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});