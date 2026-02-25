/**
 * TopPageController.js
 * Top page controller - manages game list rendering and navigation
 */

import { configLoader } from '../core/ConfigLoader.js';
import { gameDataService } from '../core/GameDataService.js';
import { createGameCard } from '../ui/GameCard.js';

export default class TopPageController {
  /**
   * Constructor
   */
  constructor() {
    this.configLoader = configLoader;
    this.gameDataService = gameDataService;

    // State
    this.state = {
      siteConfig: null,
      games: [],
      loading: false,
      error: null
    };

    // DOM references
    this.gamesGridContainer = null;
  }

  /**
   * Initialize top page
   */
  async init() {
    try {
      // Cache DOM elements
      this.gamesGridContainer = document.getElementById('games-grid');

      if (!this.gamesGridContainer) {
        console.error('Games grid container not found');
        return;
      }

      // Debug: Show all localStorage items with bgc_ prefix
      console.log('=== LocalStorage Contents ===');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('bgc_')) {
          console.log(`${key}: ${localStorage.getItem(key)}`);
        }
      }
      console.log('=============================');

      // Show loading state
      this.showLoading();

      // Load site config and games data
      await this.loadSiteConfig();
      await this.loadAndRenderGames();

      // Hide loading state
      this.hideLoading();

    } catch (error) {
      console.error('Failed to initialize top page:', error);
      this.showError('Failed to load games. Please refresh the page.');
    }
  }

  /**
   * Load site configuration
   */
  async loadSiteConfig() {
    try {
      this.state.siteConfig = await this.configLoader.loadSiteConfig();

      // Update page title if config loaded
      if (this.state.siteConfig && this.state.siteConfig.siteName) {
        document.title = this.state.siteConfig.siteName;
      }
    } catch (error) {
      console.warn('Failed to load site config, using defaults:', error);
      // Continue with default config
    }
  }

  /**
   * Load games metadata and render game cards
   */
  async loadAndRenderGames() {
    try {
      // Load games data
      const gamesData = await this.configLoader.loadGamesData();

      if (!gamesData || !gamesData.games) {
        throw new Error('Invalid games data format');
      }

      // Filter enabled games
      this.state.games = gamesData.games.filter(game => game.enabled !== false);

      // Render game cards
      this.renderGameCards(this.state.games);

    } catch (error) {
      console.error('Failed to load games data:', error);
      throw error;
    }
  }

  /**
   * Render game cards in grid
   * @param {Array} games - Array of game objects
   */
  renderGameCards(games) {
    if (!this.gamesGridContainer) return;

    // Clear existing cards
    this.gamesGridContainer.innerHTML = '';

    // Create and append game cards
    games.forEach(game => {
      const highScore = this.getHighScoreForGame(game.id);
      const card = createGameCard(game, highScore, (gameData) => {
        this.handleGameClick(gameData);
      });
      this.gamesGridContainer.appendChild(card);
    });
  }

  /**
   * Get high score for a specific game
   * @param {string} gameId - Game ID
   * @returns {number|object|null} High score or null
   */
  getHighScoreForGame(gameId) {
    try {
      let highScore;
      switch (gameId) {
        case 'memory-game':
          highScore = this.gameDataService.loadMemoryGameHighScore();
          console.log(`Memory Game high score:`, highScore);
          return highScore;

        case 'tic-tac-toe':
          highScore = this.gameDataService.loadTicTacToeStats();
          console.log(`Tic-Tac-Toe stats:`, highScore);
          return highScore;

        case 'whack-a-mole':
          highScore = this.gameDataService.loadWhackAMoleHighScore();
          console.log(`Whack-a-Mole high score:`, highScore);
          return highScore;

        default:
          return null;
      }
    } catch (error) {
      console.warn(`Failed to load high score for ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Handle game card click
   * @param {object} game - Game metadata
   */
  handleGameClick(game) {
    if (!game || !game.htmlPath) {
      console.error('Invalid game data:', game);
      return;
    }

    // Navigate to game page
    this.navigateToGame(game.htmlPath);
  }

  /**
   * Navigate to game page
   * @param {string} url - Game page URL
   */
  navigateToGame(url) {
    // Convert to ES6 module version if using module-based top page
    // For example: games/memory-game.html -> games/memory-game-module.html
    if (window.location.pathname.includes('module.html') && !url.includes('module')) {
      url = url.replace('.html', '-module.html');
    }

    // Simple navigation
    window.location.href = url;
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (!this.gamesGridContainer) return;

    this.state.loading = true;
    this.gamesGridContainer.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
        <p>Loading games...</p>
      </div>
    `;
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.state.loading = false;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    if (!this.gamesGridContainer) return;

    this.state.error = message;
    this.gamesGridContainer.innerHTML = `
      <div class="error">
        <p class="error__message">${message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}
