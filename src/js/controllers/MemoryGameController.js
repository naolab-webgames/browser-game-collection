/**
 * MemoryGameController.js
 * Memory Game logic and state management
 */

import GameController from './GameController.js';
import { shuffleArray } from '../utils/helpers.js';

export default class MemoryGameController extends GameController {
  /**
   * Constructor
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameDataService) {
    super('memory-game', gameDataService);

    // Game state
    this.state = {
      // Card data
      cards: [],              // [1,1,2,2,...,8,8] shuffled

      // Card states
      flippedIndices: [],     // Currently flipped card indices (max 2)
      matchedIndices: [],     // All matched card indices

      // Game progress
      moves: 0,               // Number of move pairs made

      // Game control
      isLocked: false,        // Prevent clicks during flip-back animation
      gameStarted: false,     // Has game started?
      gameComplete: false,    // All pairs matched?

      // High score
      highScore: null,        // Best score from LocalStorage

      // DOM references (cached)
      cardElements: [],       // Card DOM elements
      movesDisplay: null,     // Moves counter display
      highScoreDisplay: null  // High score display
    };
  }

  /**
   * Initialize game
   */
  async init() {
    // Load high score from storage
    this.state.highScore = this.gameDataService.loadMemoryGameHighScore();

    // Cache DOM elements
    this.state.movesDisplay = document.getElementById('moves-value');
    this.state.highScoreDisplay = document.getElementById('high-score-value');

    // Update displays
    this.updateMovesDisplay();
    this.updateHighScoreDisplay();

    // Setup event listeners
    this.setupCommonListeners();

    // Start new game
    this.startGame();
  }

  /**
   * Start new game
   */
  startGame() {
    // Create cards array [1,1,2,2,...,8,8]
    this.state.cards = [];
    for (let i = 1; i <= 8; i++) {
      this.state.cards.push(i, i);
    }

    // Shuffle cards
    shuffleArray(this.state.cards);

    // Reset state
    this.state.flippedIndices = [];
    this.state.matchedIndices = [];
    this.state.moves = 0;
    this.state.isLocked = false;
    this.state.gameStarted = false;
    this.state.gameComplete = false;

    // Update display
    this.updateMovesDisplay();

    // Render cards
    this.renderCards();
  }

  /**
   * Reset game (alias for startGame)
   */
  resetGame() {
    this.startGame();
  }

  /**
   * End game
   */
  endGame() {
    this.state.gameComplete = true;
  }

  /**
   * Render all card elements
   */
  renderCards() {
    const gridContainer = document.getElementById('cards-grid');
    if (!gridContainer) {
      console.error('Cards grid container not found');
      return;
    }

    // Clear existing cards
    gridContainer.innerHTML = '';
    this.state.cardElements = [];

    // Create card elements
    this.state.cards.forEach((value, index) => {
      const card = this.createCardElement(value, index);
      gridContainer.appendChild(card);
      this.state.cardElements.push(card);
    });
  }

  /**
   * Create single card element
   * @param {number} value - Card value (1-8)
   * @param {number} index - Card index in array
   * @returns {HTMLElement} Card element
   */
  createCardElement(value, index) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    card.dataset.value = value;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back">?</div>
        <div class="card-front">${value}</div>
      </div>
    `;

    // Attach event listener
    card.addEventListener('click', () => this.handleCardClick(index));

    return card;
  }

  /**
   * Handle card click event
   * @param {number} index - Clicked card index
   */
  handleCardClick(index) {
    // Validation checks
    if (this.state.isLocked) return;                         // Game locked (animation)
    if (this.state.flippedIndices.includes(index)) return;   // Already flipped
    if (this.state.matchedIndices.includes(index)) return;   // Already matched

    // Start game on first click
    if (!this.state.gameStarted) {
      this.state.gameStarted = true;
    }

    // Flip card
    this.flipCard(index);
    this.state.flippedIndices.push(index);

    // Check if two cards flipped
    if (this.state.flippedIndices.length === 2) {
      // Increment move counter (CRITICAL: after second card flip)
      this.state.moves++;
      this.updateMovesDisplay();

      // Check for match
      const [index1, index2] = this.state.flippedIndices;
      const isMatch = this.state.cards[index1] === this.state.cards[index2];

      if (isMatch) {
        this.handleMatch();
      } else {
        this.handleMismatch();
      }
    }
  }

  /**
   * Handle successful match
   */
  handleMatch() {
    const [index1, index2] = this.state.flippedIndices;

    // Add to matched indices
    this.state.matchedIndices.push(index1, index2);

    // Apply matched CSS class
    this.state.cardElements[index1].classList.add('matched');
    this.state.cardElements[index2].classList.add('matched');

    // Clear flipped indices
    this.state.flippedIndices = [];

    // Check game completion
    if (this.isGameComplete()) {
      setTimeout(() => this.handleGameComplete(), 500);  // Delay for effect
    }
  }

  /**
   * Handle mismatch (cards don't match)
   */
  handleMismatch() {
    const [index1, index2] = this.state.flippedIndices;

    // Lock game to prevent clicks (CRITICAL)
    this.state.isLocked = true;

    // Wait 1 second, then flip back
    setTimeout(() => {
      // Flip both cards back
      this.unflipCard(index1);
      this.unflipCard(index2);

      // Clear flipped indices
      this.state.flippedIndices = [];

      // Unlock game
      this.state.isLocked = false;
    }, 1000);  // 1 second delay
  }

  /**
   * Handle game completion
   */
  handleGameComplete() {
    this.state.gameComplete = true;

    // Check if new high score (CRITICAL: lower is better)
    const isNewRecord = this.checkAndSaveHighScore();

    // Show result modal
    this.showResultModal({
      score: this.state.moves,
      highScore: this.state.highScore,
      isNewRecord: isNewRecord,
      message: `Congratulations! You completed the game in ${this.state.moves} moves.`
    });
  }

  /**
   * Check and save high score
   * @returns {boolean} True if new record
   */
  checkAndSaveHighScore() {
    // Lower is better for Memory Game
    const isNewRecord = this.gameDataService.saveMemoryGameScore(this.state.moves);

    if (isNewRecord) {
      this.state.highScore = this.state.moves;
      this.updateHighScoreDisplay();
    }

    return isNewRecord;
  }

  /**
   * Check if game is complete
   * @returns {boolean} True if all 8 pairs matched
   */
  isGameComplete() {
    return this.state.matchedIndices.length === 16;  // 8 pairs × 2 cards
  }

  /**
   * Flip card face-up
   * @param {number} index - Card index
   */
  flipCard(index) {
    const card = this.state.cardElements[index];
    if (card) {
      card.classList.add('flipped');
    }
  }

  /**
   * Flip card face-down
   * @param {number} index - Card index
   */
  unflipCard(index) {
    const card = this.state.cardElements[index];
    if (card) {
      card.classList.remove('flipped');
    }
  }

  /**
   * Update moves display
   */
  updateMovesDisplay() {
    if (this.state.movesDisplay) {
      this.state.movesDisplay.textContent = this.state.moves;
    }
  }

  /**
   * Update high score display
   */
  updateHighScoreDisplay() {
    if (this.state.highScoreDisplay) {
      this.state.highScoreDisplay.textContent =
        this.state.highScore !== null ? this.state.highScore : '--';
    }
  }
}
