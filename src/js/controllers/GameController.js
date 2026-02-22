/**
 * GameController.js
 * Abstract base class for all game controllers
 */

import Modal from '../ui/Modal.js';

export default class GameController {
  /**
   * Constructor
   * @param {string} gameId - Unique game identifier
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameId, gameDataService) {
    if (this.constructor === GameController) {
      throw new Error('GameController is an abstract class and cannot be instantiated directly');
    }

    this.gameId = gameId;
    this.gameDataService = gameDataService;
    this.resultModal = null;
  }

  /**
   * Initialize game (abstract method - must be implemented by subclass)
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error('init() method must be implemented by subclass');
  }

  /**
   * Start new game (abstract method - must be implemented by subclass)
   */
  startGame() {
    throw new Error('startGame() method must be implemented by subclass');
  }

  /**
   * End game (abstract method - must be implemented by subclass)
   */
  endGame() {
    throw new Error('endGame() method must be implemented by subclass');
  }

  /**
   * Reset game (abstract method - must be implemented by subclass)
   */
  resetGame() {
    throw new Error('resetGame() method must be implemented by subclass');
  }

  /**
   * Load game data from storage
   * @returns {any} Loaded game data
   */
  loadGameData() {
    // Subclass should implement specific loading logic
    return null;
  }

  /**
   * Save game data to storage
   * @param {any} data - Data to save
   * @returns {boolean} Success status
   */
  saveGameData(data) {
    // Subclass should implement specific saving logic
    return false;
  }

  /**
   * Show result modal
   * @param {object} result - Result data {score, highScore, isNewRecord, message, etc.}
   */
  showResultModal(result) {
    if (!this.resultModal) {
      this.resultModal = new Modal('result-modal');
    }

    // Construct modal content
    const content = this.buildModalContent(result);
    const buttons = this.buildModalButtons();

    // Show modal
    this.resultModal.show('Game Over!', content, buttons);
  }

  /**
   * Build modal content HTML
   * @param {object} result - Result data
   * @returns {string} HTML content
   */
  buildModalContent(result) {
    let html = '<div class="result-stats">';

    // Add result message if provided
    if (result.message) {
      html += `<p class="text-center mb-2">${result.message}</p>`;
    }

    // Add score
    if (result.score !== undefined) {
      html += `
        <div class="stat-item">
          <span class="stat-label">Your Score:</span>
          <span class="stat-value">${result.score}</span>
        </div>
      `;
    }

    // Add high score
    if (result.highScore !== undefined && result.highScore !== null) {
      html += `
        <div class="stat-item">
          <span class="stat-label">Best Score:</span>
          <span class="stat-value">${result.highScore}</span>
        </div>
      `;
    }

    html += '</div>';

    // Add new record badge
    if (result.isNewRecord) {
      html = '<div class="new-record">⭐ NEW RECORD! ⭐</div>' + html;
    }

    // Add ad container
    html += '<div class="ad-container"><!-- Ad placement --></div>';

    return html;
  }

  /**
   * Build modal buttons
   * @returns {Array<object>} Button configuration
   */
  buildModalButtons() {
    return [
      {
        label: 'Play Again',
        primary: true,
        onClick: () => {
          this.resultModal.hide();
          this.resetGame();
        }
      },
      {
        label: 'Back to Home',
        primary: false,
        onClick: () => this.navigateToHome()
      }
    ];
  }

  /**
   * Navigate to home page
   */
  navigateToHome() {
    window.location.href = '/index.html';
  }

  /**
   * Setup common event listeners
   */
  setupCommonListeners() {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.navigateToHome());
    }

    // Reset/New Game button
    const resetBtn = document.getElementById('reset-btn') ||
                     document.getElementById('new-game-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetGame());
    }
  }

  /**
   * Cleanup resources (call on page unload)
   */
  cleanup() {
    // Subclass can override to cleanup timers, intervals, etc.
  }
}
