/**
 * NBackGameController.js
 * Dual N-Back memory training game
 * Players remember both position and number from N steps back
 */

import GameController from './GameController.js';
import Modal from '../ui/Modal.js';

// Constants
const GAME_DURATION = 30; // 30 seconds
const STIMULUS_DURATION = 500; // 500ms to show stimulus
const RESPONSE_WINDOW = 2000; // 2000ms for player to respond (increased from 1000ms)
const GRID_SIZE = 3; // 3x3 grid
const NUMBER_RANGE = 9; // Numbers 1-9

export default class NBackGameController extends GameController {
  constructor(gameDataService) {
    super('nback-game', gameDataService);

    this.state = {
      gameState: 'difficulty-select', // difficulty-select | ready | running | finished

      // Difficulty (N-back level)
      difficulty: 2, // 1=Easy, 2=Normal, 3=Hard

      // Current stimulus
      currentPosition: null, // 0-8 (grid index)
      currentNumber: null, // 1-9

      // History
      positionHistory: [],
      numberHistory: [],

      // Trial tracking
      trialIndex: 0,
      totalTrials: 0,

      // Player responses (only for trials where comparison is possible)
      positionResponses: [], // [{expected: bool, actual: bool, correct: bool}]
      numberResponses: [],

      // Response tracking for current trial
      currentPositionResponse: false,
      currentNumberResponse: false,

      // Timer
      timeRemaining: GAME_DURATION,
      gameTimer: null,
      stimulusTimer: null,

      // UI elements
      cells: [],
      positionButton: null,
      numberButton: null
    };
  }

  /**
   * Initialize game
   */
  async init() {
    // Cache DOM elements
    this.state.cells = Array.from(document.querySelectorAll('.grid-cell'));
    this.state.positionButton = document.getElementById('position-match-btn');
    this.state.numberButton = document.getElementById('number-match-btn');

    // Setup event listeners
    this.setupCommonListeners();
    this.setupGameListeners();

    // Show difficulty selection
    this.showDifficultySelection();
  }

  /**
   * Setup game-specific event listeners
   */
  setupGameListeners() {
    // Difficulty selection buttons
    document.getElementById('easy-btn')?.addEventListener('click', () => {
      this.selectDifficulty(1);
    });

    document.getElementById('normal-btn')?.addEventListener('click', () => {
      this.selectDifficulty(2);
    });

    document.getElementById('hard-btn')?.addEventListener('click', () => {
      this.selectDifficulty(3);
    });

    // Match buttons
    this.state.positionButton?.addEventListener('click', () => {
      this.handlePositionMatch();
    });

    this.state.numberButton?.addEventListener('click', () => {
      this.handleNumberMatch();
    });

    // Keyboard support (P for position, N for number)
    document.addEventListener('keydown', (e) => {
      if (this.state.gameState !== 'running') return;

      if (e.code === 'KeyP' || e.code === 'KeyA') {
        e.preventDefault();
        this.handlePositionMatch();
      } else if (e.code === 'KeyN' || e.code === 'KeyL') {
        e.preventDefault();
        this.handleNumberMatch();
      }
    });
  }

  /**
   * Show difficulty selection screen
   */
  showDifficultySelection() {
    this.state.gameState = 'difficulty-select';
    document.getElementById('difficulty-screen')?.classList.remove('hidden');
    document.getElementById('game-screen')?.classList.add('hidden');
  }

  /**
   * Select difficulty and start game
   */
  selectDifficulty(level) {
    this.state.difficulty = level;
    document.getElementById('difficulty-screen')?.classList.add('hidden');
    document.getElementById('game-screen')?.classList.remove('hidden');

    // Update difficulty display
    const difficultyNames = ['', 'Easy (1-back)', 'Normal (2-back)', 'Hard (3-back)'];
    const difficultyEl = document.getElementById('difficulty-value');
    if (difficultyEl) {
      difficultyEl.textContent = difficultyNames[level];
    }

    // Start game after brief delay
    setTimeout(() => {
      this.startGame();
    }, 500);
  }

  /**
   * Start new game
   */
  startGame() {
    // Reset state
    this.state.gameState = 'running';
    this.state.trialIndex = 0;
    this.state.totalTrials = 0;
    this.state.positionHistory = [];
    this.state.numberHistory = [];
    this.state.positionResponses = [];
    this.state.numberResponses = [];
    this.state.currentPosition = null;
    this.state.currentNumber = null;
    this.state.currentPositionResponse = false;
    this.state.currentNumberResponse = false;
    this.state.timeRemaining = GAME_DURATION;

    // Enable buttons
    this.state.positionButton.disabled = false;
    this.state.numberButton.disabled = false;

    // Reset button states
    this.state.positionButton.classList.remove('pressed');
    this.state.numberButton.classList.remove('pressed');

    // Start game timer
    this.startGameTimer();

    // Start first trial
    this.startTrial();
  }

  /**
   * Start game timer (30 seconds)
   */
  startGameTimer() {
    this.updateTimerDisplay();

    this.state.gameTimer = setInterval(() => {
      this.state.timeRemaining--;
      this.updateTimerDisplay();

      if (this.state.timeRemaining <= 0) {
        this.handleGameEnd();
      }
    }, 1000);
  }

  /**
   * Update timer display
   */
  updateTimerDisplay() {
    const timerEl = document.getElementById('timer-value');
    if (timerEl) {
      timerEl.textContent = `${this.state.timeRemaining}s`;
    }
  }

  /**
   * Start a new trial (show stimulus)
   */
  startTrial() {
    if (this.state.gameState !== 'running') return;

    // Generate random position and number
    this.state.currentPosition = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    this.state.currentNumber = Math.floor(Math.random() * NUMBER_RANGE) + 1;

    // Add to history
    this.state.positionHistory.push(this.state.currentPosition);
    this.state.numberHistory.push(this.state.currentNumber);

    // Reset current trial responses
    this.state.currentPositionResponse = false;
    this.state.currentNumberResponse = false;

    // Reset button states
    this.state.positionButton.classList.remove('pressed', 'correct', 'incorrect');
    this.state.numberButton.classList.remove('pressed', 'correct', 'incorrect');

    // Show stimulus
    this.showStimulus();

    // Schedule hiding stimulus
    setTimeout(() => {
      this.hideStimulus();

      // Schedule recording response
      setTimeout(() => {
        this.recordResponse();

        // Wait 500ms to show feedback, then start next trial
        setTimeout(() => {
          this.state.trialIndex++;
          this.startTrial();
        }, 500);
      }, RESPONSE_WINDOW);
    }, STIMULUS_DURATION);
  }

  /**
   * Show stimulus on grid
   */
  showStimulus() {
    // Clear all cells
    this.state.cells.forEach(cell => {
      cell.classList.remove('active');
      cell.textContent = '';
    });

    // Activate current cell
    const cell = this.state.cells[this.state.currentPosition];
    cell.classList.add('active');
    cell.textContent = this.state.currentNumber;
  }

  /**
   * Hide stimulus
   */
  hideStimulus() {
    this.state.cells.forEach(cell => {
      cell.classList.remove('active');
      cell.textContent = '';
    });
  }

  /**
   * Handle position match button press
   */
  handlePositionMatch() {
    if (this.state.gameState !== 'running') return;

    this.state.currentPositionResponse = true;
    this.state.positionButton.classList.add('pressed');
  }

  /**
   * Handle number match button press
   */
  handleNumberMatch() {
    if (this.state.gameState !== 'running') return;

    this.state.currentNumberResponse = true;
    this.state.numberButton.classList.add('pressed');
  }

  /**
   * Record response for current trial
   */
  recordResponse() {
    const currentTrial = this.state.trialIndex;
    const nBack = this.state.difficulty;

    // Only record if we have enough history to compare
    if (currentTrial >= nBack) {
      // Check if position matched
      const positionExpected =
        this.state.positionHistory[currentTrial] ===
        this.state.positionHistory[currentTrial - nBack];

      // Check if number matched
      const numberExpected =
        this.state.numberHistory[currentTrial] ===
        this.state.numberHistory[currentTrial - nBack];

      // Record position response
      const positionCorrect =
        this.state.currentPositionResponse === positionExpected;
      this.state.positionResponses.push({
        expected: positionExpected,
        actual: this.state.currentPositionResponse,
        correct: positionCorrect
      });

      // Record number response
      const numberCorrect =
        this.state.currentNumberResponse === numberExpected;
      this.state.numberResponses.push({
        expected: numberExpected,
        actual: this.state.currentNumberResponse,
        correct: numberCorrect
      });

      // Update button visual feedback for position
      this.state.positionButton.classList.remove('pressed');
      // Show feedback only if: (1) pressed and correct, (2) pressed and incorrect, (3) not pressed and incorrect
      if (this.state.currentPositionResponse) {
        // User pressed the button
        if (positionCorrect) {
          this.state.positionButton.classList.add('correct');
        } else {
          this.state.positionButton.classList.add('incorrect');
        }
      } else {
        // User did NOT press the button
        if (!positionCorrect) {
          // Should have pressed but didn't - show incorrect
          this.state.positionButton.classList.add('incorrect');
        }
        // If correct and didn't press - no feedback (correct behavior)
      }

      // Update button visual feedback for number
      this.state.numberButton.classList.remove('pressed');
      // Show feedback only if: (1) pressed and correct, (2) pressed and incorrect, (3) not pressed and incorrect
      if (this.state.currentNumberResponse) {
        // User pressed the button
        if (numberCorrect) {
          this.state.numberButton.classList.add('correct');
        } else {
          this.state.numberButton.classList.add('incorrect');
        }
      } else {
        // User did NOT press the button
        if (!numberCorrect) {
          // Should have pressed but didn't - show incorrect
          this.state.numberButton.classList.add('incorrect');
        }
        // If correct and didn't press - no feedback (correct behavior)
      }

      this.state.totalTrials++;
    }
  }

  /**
   * End game
   */
  handleGameEnd() {
    this.state.gameState = 'finished';

    // Clear timers
    if (this.state.gameTimer) {
      clearInterval(this.state.gameTimer);
      this.state.gameTimer = null;
    }

    // Disable buttons
    this.state.positionButton.disabled = true;
    this.state.numberButton.disabled = true;

    // Hide stimulus
    this.hideStimulus();

    // Calculate results
    const results = this.calculateResults();

    // Show results modal with delay
    setTimeout(() => {
      this.showResultsModal(results);
    }, 500);
  }

  /**
   * Calculate game results
   */
  calculateResults() {
    const positionCorrect = this.state.positionResponses.filter(
      r => r.correct
    ).length;
    const positionTotal = this.state.positionResponses.length;
    const positionAccuracy =
      positionTotal > 0 ? (positionCorrect / positionTotal) * 100 : 0;

    const numberCorrect = this.state.numberResponses.filter(r => r.correct)
      .length;
    const numberTotal = this.state.numberResponses.length;
    const numberAccuracy =
      numberTotal > 0 ? (numberCorrect / numberTotal) * 100 : 0;

    const totalCorrect = positionCorrect + numberCorrect;
    const totalAttempts = positionTotal + numberTotal;
    const overallAccuracy =
      totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

    return {
      position: {
        correct: positionCorrect,
        total: positionTotal,
        accuracy: positionAccuracy
      },
      number: {
        correct: numberCorrect,
        total: numberTotal,
        accuracy: numberAccuracy
      },
      overall: {
        correct: totalCorrect,
        total: totalAttempts,
        accuracy: overallAccuracy
      },
      difficulty: this.state.difficulty
    };
  }

  /**
   * Show results modal with animated progress bars
   */
  showResultsModal(results) {
    const difficultyNames = ['', 'Easy', 'Normal', 'Hard'];

    let html = `<div class="result-difficulty">Difficulty: ${difficultyNames[results.difficulty]}</div>`;

    // Position accuracy
    html += `
      <div class="result-item">
        <div class="result-label">Position Match</div>
        <div class="progress-bar-container">
          <div class="progress-bar" data-accuracy="${results.position.accuracy.toFixed(0)}">
            <div class="progress-fill position-fill"></div>
          </div>
          <div class="progress-text">${results.position.accuracy.toFixed(0)}%</div>
        </div>
        <div class="result-detail">${results.position.correct}/${results.position.total} correct</div>
      </div>
    `;

    // Number accuracy
    html += `
      <div class="result-item">
        <div class="result-label">Number Match</div>
        <div class="progress-bar-container">
          <div class="progress-bar" data-accuracy="${results.number.accuracy.toFixed(0)}">
            <div class="progress-fill number-fill"></div>
          </div>
          <div class="progress-text">${results.number.accuracy.toFixed(0)}%</div>
        </div>
        <div class="result-detail">${results.number.correct}/${results.number.total} correct</div>
      </div>
    `;

    // Overall accuracy
    html += `
      <div class="result-item overall">
        <div class="result-label">Overall Accuracy</div>
        <div class="progress-bar-container">
          <div class="progress-bar" data-accuracy="${results.overall.accuracy.toFixed(0)}">
            <div class="progress-fill overall-fill"></div>
          </div>
          <div class="progress-text">${results.overall.accuracy.toFixed(0)}%</div>
        </div>
        <div class="result-detail">${results.overall.correct}/${results.overall.total} correct</div>
      </div>
    `;

    const buttons = this.buildModalButtons();

    if (!this.resultModal) {
      this.resultModal = new Modal('result-modal');
    }

    this.resultModal.show('Game Complete!', html, buttons);

    // Animate progress bars after modal is shown
    setTimeout(() => {
      this.animateProgressBars();
    }, 100);
  }

  /**
   * Animate progress bars
   */
  animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');

    progressBars.forEach(bar => {
      const container = bar.closest('.progress-bar');
      const accuracy = parseInt(container.dataset.accuracy);

      // Animate width
      setTimeout(() => {
        bar.style.width = `${accuracy}%`;
      }, 50);
    });
  }

  /**
   * Reset game
   */
  resetGame() {
    // Clear timers
    if (this.state.gameTimer) {
      clearInterval(this.state.gameTimer);
      this.state.gameTimer = null;
    }

    // Reset to difficulty selection
    this.showDifficultySelection();

    // Clear grid
    this.hideStimulus();

    // Reset timer display
    this.state.timeRemaining = GAME_DURATION;
    this.updateTimerDisplay();
  }

  /**
   * End game (from parent class requirement)
   */
  endGame() {
    if (this.state.gameState === 'running') {
      this.handleGameEnd();
    } else {
      if (this.state.gameTimer) {
        clearInterval(this.state.gameTimer);
        this.state.gameTimer = null;
      }
      this.state.gameState = 'finished';
    }
  }
}
