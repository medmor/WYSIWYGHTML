/**
 * Grammalecte Server Wrapper
 * Manages the Python Grammalecte server as a child process
 * and provides HTTP client methods for grammar checking
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

class GrammalecteServer {
  constructor() {
    this.process = null;
    this.port = 8085; // Default port for Grammalecte server
    this.host = 'localhost';
    this.isRunning = false;
    this.startupPromise = null;
  }

  /**
   * Start the Grammalecte Python server
   * @param {number} port - Port to run the server on (default: 8085)
   * @returns {Promise<boolean>} - Resolves when server is ready
   */
  start(port = 8085) {
    if (this.isRunning) {
      return Promise.resolve(true);
    }

    if (this.startupPromise) {
      return this.startupPromise;
    }

    this.port = port;
    const serverPath = path.join(__dirname, 'grammalecte-server.py');
    
    this.startupPromise = new Promise((resolve, reject) => {
      try {
        // Spawn the Python server process with a detached process group
        this.process = spawn('python3', [serverPath, '--port', String(port), '--host', this.host], {
          cwd: __dirname,
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: true  // Create a new process group for clean termination
        });

        this.process.stdout.on('data', (data) => {
          console.log(`[Grammalecte] ${data.toString().trim()}`);
        });

        this.process.stderr.on('data', (data) => {
          console.error(`[Grammalecte Error] ${data.toString().trim()}`);
        });

        this.process.on('error', (err) => {
          console.error('[Grammalecte] Failed to start server:', err);
          this.isRunning = false;
          this.startupPromise = null;
          reject(err);
        });

        this.process.on('close', (code) => {
          console.log(`[Grammalecte] Server process exited with code ${code}`);
          this.isRunning = false;
          this.startupPromise = null;
        });

        // Wait for server to be ready
        this.waitForReady()
          .then(() => {
            this.isRunning = true;
            resolve(true);
          })
          .catch((err) => {
            this.startupPromise = null;
            reject(err);
          });

      } catch (err) {
        this.startupPromise = null;
        reject(err);
      }
    });

    return this.startupPromise;
  }

  /**
   * Wait for the server to be ready to accept connections
   * @param {number} retries - Number of connection attempts
   * @param {number} delay - Delay between attempts in ms
   * @returns {Promise<void>}
   */
  waitForReady(retries = 30, delay = 500) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkReady = () => {
        attempts++;
        this.makeRequest('/get_options/fr', 'GET')
          .then(() => {
            console.log('[Grammalecte] Server is ready');
            resolve();
          })
          .catch(() => {
            if (attempts < retries) {
              setTimeout(checkReady, delay);
            } else {
              reject(new Error('Server failed to start within timeout'));
            }
          });
      };

      setTimeout(checkReady, 1000); // Initial delay for process to start
    });
  }

  /**
   * Stop the Grammalecte server
   */
  stop() {
    if (this.process) {
      try {
        // Kill the entire process group (negative PID) to terminate all worker threads
        process.kill(-this.process.pid, 'SIGTERM');
      } catch (err) {
        // Process group may not exist, try killing just the main process
        this.process.kill('SIGTERM');
      }
      this.process = null;
      this.isRunning = false;
      this.startupPromise = null;
    }
  }

  /**
   * Make an HTTP request to the Grammalecte server
   * @param {string} endpoint - API endpoint (e.g., '/gc_text/fr')
   * @param {string} method - HTTP method ('GET' or 'POST')
   * @param {object} data - Data to send (for POST requests)
   * @returns {Promise<object>} - Parsed JSON response
   */
  makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const postData = data ? new URLSearchParams(data).toString() : '';
      
      const options = {
        hostname: this.host,
        port: this.port,
        path: endpoint,
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      };

      if (method === 'POST' && postData) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (e) {
            // Some responses might not be JSON
            resolve({ raw: responseData });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (method === 'POST' && postData) {
        req.write(postData);
      }

      req.end();
    });
  }

  /**
   * Check grammar for the given text
   * @param {string} text - Text to check
   * @param {object} options - Grammar checking options
   * @returns {Promise<object>} - Grammar check results with errors
   */
  async checkGrammar(text, options = null) {
    const data = { text };
    if (options) {
      data.options = JSON.stringify(options);
    }
    return this.makeRequest('/gc_text/fr', 'POST', data);
  }

  /**
   * Get spelling suggestions for a word
   * @param {string} word - Word to get suggestions for
   * @returns {Promise<object>} - Suggestions object
   */
  async getSuggestions(word) {
    return this.makeRequest(`/suggest/fr/${encodeURIComponent(word)}`, 'GET');
  }

  /**
   * Get available grammar options
   * @returns {Promise<object>} - Options with labels
   */
  async getOptions() {
    return this.makeRequest('/get_options/fr', 'GET');
  }

  /**
   * Set grammar options for the session
   * @param {object} options - Options to set
   * @returns {Promise<object>} - Updated options
   */
  async setOptions(options) {
    return this.makeRequest('/set_options/fr', 'POST', { options: JSON.stringify(options) });
  }

  /**
   * Reset options to defaults
   * @returns {Promise<object>}
   */
  async resetOptions() {
    return this.makeRequest('/reset_options/fr', 'POST');
  }
}

// Export singleton instance
const grammalecteServer = new GrammalecteServer();

module.exports = {
  GrammalecteServer,
  grammalecteServer
};