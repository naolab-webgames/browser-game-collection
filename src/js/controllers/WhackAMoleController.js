/**
 * WhackAMoleController.js
 * Whack-a-Mole game logic with timer and random mole spawning
 */

import GameController from './GameController.js';
import Modal from '../ui/Modal.js';

export default class WhackAMoleController extends GameController {
  /**
   * Constructor
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameDataService) {
    super('whack-a-mole', gameDataService);

    // Game state
    this.state = {
      // Hole states (9 holes in 3x3 grid)
      holes: [false, false, false, false, false, false, false, false, false],

      // Game progress
      score: 0,
      timeRemaining: 30,

      // Game control
      gameActive: false,
      gameStarted: false,

      // Timers (cleanup references)
      timerInterval: null,
      moleTimeouts: {},
      spawnTimeout: null,

      // High score
      highScore: 0,

      // Spawn configuration
      spawnConfig: {
        minDelay: 500,      // 0.5 seconds
        maxDelay: 1500,     // 1.5 seconds
        moleVisibility: 1000 // 1 second
      },

      // DOM references (cached)
      holeElements: [],
      scoreDisplay: null,
      timerDisplay: null,
      highScoreDisplay: null
    };
  }

  /**
   * Initialize game
   */
  async init() {
    // 1. Load high score from storage
    this.state.highScore = this.gameDataService.loadWhackAMoleHighScore() || 0;

    // 2. Cache DOM elements
    this.state.scoreDisplay = document.getElementById('score-value');
    this.state.timerDisplay = document.getElementById('timer-value');
    this.state.highScoreDisplay = document.getElementById('high-score-value');

    // 3. Update displays
    this.updateScoreDisplay();
    this.updateTimerDisplay();
    this.updateHighScoreDisplay();

    // 4. Render holes
    this.renderHoles();

    // 5. Setup event listeners
    this.setupCommonListeners();
    this.setupGameListeners();
  }

  /**
   * Setup game-specific event listeners
   */
  setupGameListeners() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStartGame());
    }
  }

  /**
   * Generate and render all hole elements
   */
  renderHoles() {
    const gridContainer = document.getElementById('holes-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    this.state.holeElements = [];

    for (let i = 0; i < 9; i++) {
      const hole = this.createHoleElement(i);
      gridContainer.appendChild(hole);
      this.state.holeElements.push(hole);
    }
  }

  /**
   * Create single hole element
   * @param {number} index - Hole index (0-8)
   * @returns {HTMLElement} Hole element
   */
  createHoleElement(index) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.dataset.index = index;

    // Add mole element
    const mole = document.createElement('div');
    mole.className = 'mole';
    hole.appendChild(mole);

    // Attach event listener
    hole.addEventListener('click', () => this.handleHoleClick(index));

    return hole;
  }

  /**
   * Handle start game button click
   */
  handleStartGame() {
    this.startGame();

    // Disable start button during game
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = 'Game in Progress...';
    }
  }

  /**
   * Start new game
   */
  startGame() {
    // 1. Reset state
    this.state.score = 0;
    this.state.timeRemaining = 30;
    this.state.gameActive = true;
    this.state.gameStarted = true;
    this.state.holes = [false, false, false, false, false, false, false, false, false];

    // 2. Update displays
    this.updateScoreDisplay();
    this.updateTimerDisplay();

    // 3. Start timer
    this.startTimer();

    // 4. Start mole spawning
    this.startMoleSpawning();
  }

  /**
   * Start countdown timer
   */
  startTimer() {
    this.state.timeRemaining = 30;
    this.updateTimerDisplay();

    // Update every second
    this.state.timerInterval = setInterval(() => {
      this.state.timeRemaining--;
      this.updateTimerDisplay();

      // Game over when time reaches 0
      if (this.state.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * Stop timer
   */
  stopTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  }

  /**
   * Update timer display with color warnings
   */
  updateTimerDisplay() {
    if (this.state.timerDisplay) {
      this.state.timerDisplay.textContent = `${this.state.timeRemaining}s`;

      // Remove all warning classes first
      this.state.timerDisplay.classList.remove('warning', 'critical');

      // Warning: 6-10 seconds (orange)
      if (this.state.timeRemaining > 5 && this.state.timeRemaining <= 10) {
        this.state.timerDisplay.classList.add('warning');
      }
      // Critical: 1-5 seconds (red, pulsing)
      else if (this.state.timeRemaining <= 5) {
        this.state.timerDisplay.classList.add('critical');
      }
    }
  }

  /**
   * Start mole spawning loop
   */
  startMoleSpawning() {
    if (!this.state.gameActive) return;

    // Spawn one mole
    this.spawnMole();

    // Schedule next spawn (random interval)
    const nextDelay = this.getRandomSpawnDelay();
    this.state.spawnTimeout = setTimeout(() => {
      this.startMoleSpawning(); // Recursive call
    }, nextDelay);
  }

  /**
   * Spawn single mole at random hole
   */
  spawnMole() {
    if (!this.state.gameActive) return;

    // Get random available hole
    const availableHoles = this.state.holes
      .map((visible, index) => (visible ? null : index))
      .filter(index => index !== null);

    if (availableHoles.length === 0) return; // All holes occupied

    const randomIndex = availableHoles[
      Math.floor(Math.random() * availableHoles.length)
    ];

    // Show mole
    this.showMole(randomIndex);

    // Auto-hide after 1 second
    const hideTimeout = setTimeout(() => {
      this.hideMole(randomIndex);
    }, this.state.spawnConfig.moleVisibility);

    // Store timeout reference for cleanup
    this.state.moleTimeouts[randomIndex] = hideTimeout;
  }

  /**
   * Get random spawn delay
   * @returns {number} Delay in ms (500-1500)
   */
  getRandomSpawnDelay() {
    const { minDelay, maxDelay } = this.state.spawnConfig;
    return minDelay + Math.random() * (maxDelay - minDelay);
  }

  /**
   * Show mole at specific hole
   * @param {number} index - Hole index (0-8)
   */
  showMole(index) {
    if (index < 0 || index >= 9) return;

    // Update state
    this.state.holes[index] = true;

    // Update UI
    const hole = this.state.holeElements[index];
    if (hole) {
      hole.classList.add('active');
    }
  }

  /**
   * Hide mole at specific hole
   * @param {number} index - Hole index
   */
  hideMole(index) {
    if (index < 0 || index >= 9) return;

    // Update state
    this.state.holes[index] = false;

    // Update UI
    const hole = this.state.holeElements[index];
    if (hole) {
      hole.classList.remove('active');
    }

    // Clear timeout reference
    if (this.state.moleTimeouts[index]) {
      delete this.state.moleTimeouts[index];
    }
  }

  /**
   * Stop mole spawning and clear all timeouts
   */
  stopMoleSpawning() {
    // Clear spawn timeout
    if (this.state.spawnTimeout) {
      clearTimeout(this.state.spawnTimeout);
      this.state.spawnTimeout = null;
    }

    // Clear all mole hide timeouts
    Object.values(this.state.moleTimeouts).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.state.moleTimeouts = {};

    // Hide all moles
    this.state.holes.forEach((_, index) => {
      if (this.state.holes[index]) {
        this.hideMole(index);
      }
    });
  }

  /**
   * Handle hole click
   * @param {number} index - Hole index
   */
  handleHoleClick(index) {
    // Ignore if game not active
    if (!this.state.gameActive) return;

    // Check if mole is visible
    if (this.state.holes[index]) {
      this.handleMoleHit(index);
    }
    // else: Miss click, no penalty
  }

  /**
   * Handle mole hit
   * @param {number} index - Hole index
   */
  handleMoleHit(index) {
    // Increment score
    this.incrementScore();

    // Hide mole immediately
    this.hideMole(index);

    // Clear auto-hide timeout
    if (this.state.moleTimeouts[index]) {
      clearTimeout(this.state.moleTimeouts[index]);
      delete this.state.moleTimeouts[index];
    }

    // Visual feedback
    this.showHitFeedback(index);
  }

  /**
   * Show visual feedback for hit
   * @param {number} index - Hole index
   */
  showHitFeedback(index) {
    const hole = this.state.holeElements[index];
    if (hole) {
      // Flash effect
      hole.classList.add('hit');
      setTimeout(() => {
        hole.classList.remove('hit');
      }, 200);

      // "Hit!!" text animation
      const hitText = document.createElement('div');
      hitText.className = 'hit-text';
      hitText.textContent = 'Hit!!';
      hole.appendChild(hitText);

      // Remove after animation completes
      setTimeout(() => {
        if (hitText.parentNode === hole) {
          hole.removeChild(hitText);
        }
      }, 600);
    }
  }

  /**
   * Increment score
   */
  incrementScore() {
    this.state.score++;
    this.updateScoreDisplay();
  }

  /**
   * Update score display
   */
  updateScoreDisplay() {
    if (this.state.scoreDisplay) {
      this.state.scoreDisplay.textContent = this.state.score;
    }
  }

  /**
   * Update high score display
   */
  updateHighScoreDisplay() {
    if (this.state.highScoreDisplay) {
      this.state.highScoreDisplay.textContent =
        this.state.highScore > 0 ? this.state.highScore : '--';
    }
  }

  /**
   * Check if new high score and save
   * @returns {boolean} True if new record
   */
  checkAndSaveHighScore() {
    // Higher is better for Whack-a-Mole
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      this.gameDataService.saveWhackAMoleScore(this.state.score);
      this.updateHighScoreDisplay();
      return true;
    }
    return false;
  }

  /**
   * End game
   */
  endGame() {
    // 1. Stop game
    this.state.gameActive = false;

    // 2. Stop timer
    this.stopTimer();

    // 3. Stop spawning
    this.stopMoleSpawning();

    // 4. Check and save high score
    const isNewRecord = this.checkAndSaveHighScore();

    // 5. Re-enable start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Start Game';
    }

    // 6. Show result modal
    setTimeout(() => {
      this.showResultModal({
        score: this.state.score,
        highScore: this.state.highScore,
        isNewRecord: isNewRecord
      });
    }, 500);
  }

  /**
   * Show result modal
   * @param {object} result - Result data
   */
  showResultModal(result) {
    const content = this.buildModalContent(result);
    const buttons = this.buildModalButtons();

    if (!this.resultModal) {
      this.resultModal = new Modal('result-modal');
    }

    const title = result.isNewRecord ? '⭐ NEW RECORD! ⭐' : "⏰ Time's Up! ⏰";

    this.resultModal.show(title, content, buttons);
  }

  /**
   * Build modal content
   * @param {object} result - Result data
   * @returns {string} HTML content
   */
  buildModalContent(result) {
    const newRecordBadge = result.isNewRecord
      ? '<div class="new-record">⭐ NEW RECORD! ⭐</div>'
      : '';

    return `
      ${newRecordBadge}
      <div class="result-stats">
        <div class="stat-item">
          <span class="stat-label">Your Score:</span>
          <span class="stat-value">${result.score}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">High Score:</span>
          <span class="stat-value">${result.highScore}</span>
        </div>
      </div>
      <div class="ad-container"><!-- Ad placement --></div>
    `;
  }

  /**
   * Reset game
   */
  resetGame() {
    if (this.state.gameStarted) {
      this.startGame();
    }
  }

  /**
   * Cleanup all timers and timeouts
   */
  cleanup() {
    this.stopTimer();
    this.stopMoleSpawning();
  }
}
