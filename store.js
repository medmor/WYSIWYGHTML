const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// Store file path in user data directory
const storePath = path.join(app.getPath('userData'), 'app-state.json');

let state = {
  lastFilePath: null,
  lastZoom: 100,
  theme: 'light'
};

/**
 * Load state from disk
 */
function loadState() {
  try {
    if (fs.existsSync(storePath)) {
      const data = fs.readFileSync(storePath, 'utf8');
      state = { ...state, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error loading state:', err);
  }
  return state;
}

/**
 * Save state to disk
 */
function saveState() {
  try {
    fs.writeFileSync(storePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

/**
 * Get a state value
 * @param {string} key - State key
 * @returns {*} State value
 */
function get(key) {
  return state[key];
}

/**
 * Set a state value
 * @param {string} key - State key
 * @param {*} value - State value
 */
function set(key, value) {
  state[key] = value;
  saveState();
}

/**
 * Get last file directory (for dialogs)
 * @returns {string|null} Last file directory or null
 */
function getLastFileDir() {
  if (state.lastFilePath) {
    return path.dirname(state.lastFilePath);
  }
  return null;
}

module.exports = {
  loadState,
  saveState,
  get,
  set,
  getLastFileDir
};