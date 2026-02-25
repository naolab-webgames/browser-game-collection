/**
 * TicTacToeController.js
 * Tic-Tac-Toe game logic - Player vs CPU
 */

import GameController from './GameController.js';
import Modal from '../ui/Modal.js';

// Winning line combinations
const WINNING_LINES = [
  // Horizontal
  [0, 1, 2],  // Top row
  [3, 4, 5],  // Middle row
  [6, 7, 8],  // Bottom row

  // Vertical
  [0, 3, 6],  // Left column
  [1, 4, 7],  // Center column
  [2, 5, 8],  // Right column

  // Diagonal
  [0, 4, 8],  // Top-left to bottom-right
  [2, 4, 6]   // Top-right to bottom-left
];

export default class TicTacToeController extends GameController {
  /**
   * Constructor
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameDataService) {
    super('tic-tac-toe', gameDataService);

    // Game state
    this.state = {
      // Board state
      board: ['', '', '', '', '', '', '', '', ''],  // 9 cells: '' = empty, 'X' or 'O'

      // Player configuration
      currentPlayer: 'X',
      playerSymbol: 'X',
      cpuSymbol: 'O',

      // Game control
      gameOver: false,
      winner: null,
      winningLine: [],

      // Statistics
      sessionStats: {
        wins: 0,
        losses: 0,
        draws: 0
      },
      totalStats: {
        wins: 0,
        losses: 0,
        draws: 0
      },

      // UI state
      cpuThinking: false,
      symbolSelected: false,

      // DOM references
      cells: [],
      statsDisplay: null,
      messageDisplay: null,
      symbolButtons: []
    };
  }

  /**
   * Initialize game
   */
  async init() {
    // Load stats from storage
    this.loadStats();

    // Cache DOM elements
    this.state.cells = Array.from(document.querySelectorAll('.cell'));
    this.state.statsDisplay = document.getElementById('stats-display');
    this.state.messageDisplay = document.getElementById('message-display');
    this.state.symbolButtons = Array.from(document.querySelectorAll('.symbol-btn'));

    // Setup event listeners
    this.setupCommonListeners();
    this.setupGameListeners();

    // Update stats display
    this.updateStatsDisplay();

    // Show symbol selection
    this.showSymbolSelection();
  }

  /**
   * Setup game-specific event listeners
   */
  setupGameListeners() {
    // Cell clicks
    this.state.cells.forEach((cell, index) => {
      cell.addEventListener('click', () => this.handleCellClick(index));
    });

    // Symbol selection
    this.state.symbolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const symbol = btn.dataset.symbol;
        this.handleSymbolSelect(symbol);
      });
    });
  }

  /**
   * Show symbol selection screen
   */
  showSymbolSelection() {
    this.state.messageDisplay.textContent = 'Choose your symbol: X or O';
    const symbolSelection = document.getElementById('symbol-selection');
    if (symbolSelection) {
      symbolSelection.classList.remove('hidden');
    }
  }

  /**
   * Handle symbol selection
   * @param {string} symbol - 'X' or 'O'
   */
  handleSymbolSelect(symbol) {
    this.state.playerSymbol = symbol;
    this.state.cpuSymbol = symbol === 'X' ? 'O' : 'X';
    this.state.symbolSelected = true;

    // Hide symbol selection
    const symbolSelection = document.getElementById('symbol-selection');
    if (symbolSelection) {
      symbolSelection.classList.add('hidden');
    }

    // Start game
    this.startGame();
  }

  /**
   * Start new game
   */
  startGame() {
    // Reset board
    this.state.board = ['', '', '', '', '', '', '', '', ''];
    this.state.currentPlayer = 'X';  // X always goes first
    this.state.gameOver = false;
    this.state.winner = null;
    this.state.winningLine = [];

    // Clear cell display
    this.state.cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x', 'o', 'winning');
    });

    // Update message
    if (this.state.currentPlayer === this.state.playerSymbol) {
      this.state.messageDisplay.textContent = 'Your turn!';
    } else {
      this.state.messageDisplay.textContent = 'CPU is thinking...';
      setTimeout(() => this.makeCPUMove(), 500);
    }
  }

  /**
   * Handle cell click (player move)
   * @param {number} index - Cell index (0-8)
   */
  handleCellClick(index) {
    // Validate move
    if (this.state.gameOver) return;
    if (this.state.board[index] !== '') return;
    if (this.state.currentPlayer !== this.state.playerSymbol) return;
    if (this.state.cpuThinking) return;

    // Place player's mark
    this.placeMarkat(index, this.state.playerSymbol);

    // Check win/draw
    const winResult = this.checkWin();
    if (winResult.winner) {
      this.handleGameOver(winResult.winner, winResult.line);
      return;
    }

    if (this.checkDraw()) {
      this.handleGameOver('draw', []);
      return;
    }

    // Switch to CPU turn
    this.state.currentPlayer = this.state.cpuSymbol;
    this.state.messageDisplay.textContent = 'CPU is thinking...';
    this.state.cpuThinking = true;

    // CPU move after delay
    setTimeout(() => {
      this.makeCPUMove();
    }, 500 + Math.random() * 500);  // 0.5-1 second delay
  }

  /**
   * Place mark on board
   * @param {number} index - Cell index
   * @param {string} symbol - 'X' or 'O'
   */
  placeMarkat(index, symbol) {
    this.state.board[index] = symbol;
    this.state.cells[index].textContent = symbol;
    this.state.cells[index].classList.add(symbol.toLowerCase());
  }

  /**
   * Make CPU move
   */
  makeCPUMove() {
    const moveIndex = this.getCPUMove();

    // Place CPU's mark
    this.placeMarkat(moveIndex, this.state.cpuSymbol);
    this.state.cpuThinking = false;

    // Check win/draw
    const winResult = this.checkWin();
    if (winResult.winner) {
      this.handleGameOver(winResult.winner, winResult.line);
      return;
    }

    if (this.checkDraw()) {
      this.handleGameOver('draw', []);
      return;
    }

    // Switch to player turn
    this.state.currentPlayer = this.state.playerSymbol;
    this.state.messageDisplay.textContent = 'Your turn!';
  }

  /**
   * Get CPU's next move (Medium difficulty AI)
   * @returns {number} Cell index (0-8)
   */
  getCPUMove() {
    // 1. Win if possible (70% chance)
    if (Math.random() < 0.7) {
      const winMove = this.findWinningMove(this.state.cpuSymbol);
      if (winMove !== null) {
        return winMove;
      }
    }

    // 2. Block player win (80% chance)
    if (Math.random() < 0.8) {
      const blockMove = this.findWinningMove(this.state.playerSymbol);
      if (blockMove !== null) {
        return blockMove;
      }
    }

    // 3. Take center (60% chance)
    if (Math.random() < 0.6 && this.state.board[4] === '') {
      return 4;
    }

    // 4. Take corner (40% preference)
    if (Math.random() < 0.4) {
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(i => this.state.board[i] === '');
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
    }

    // 5. Random available cell
    return this.getRandomMove();
  }

  /**
   * Find winning move for given symbol
   * @param {string} symbol - 'X' or 'O'
   * @returns {number|null} Winning cell index or null
   */
  findWinningMove(symbol) {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      const cells = [this.state.board[a], this.state.board[b], this.state.board[c]];

      // Count occurrences
      const symbolCount = cells.filter(cell => cell === symbol).length;
      const emptyCount = cells.filter(cell => cell === '').length;

      // If 2 symbols and 1 empty, this line can win
      if (symbolCount === 2 && emptyCount === 1) {
        if (this.state.board[a] === '') return a;
        if (this.state.board[b] === '') return b;
        if (this.state.board[c] === '') return c;
      }
    }

    return null;
  }

  /**
   * Get random available cell
   * @returns {number} Random empty cell index
   */
  getRandomMove() {
    const availableCells = this.state.board
      .map((cell, index) => (cell === '' ? index : null))
      .filter(index => index !== null);

    return availableCells[Math.floor(Math.random() * availableCells.length)];
  }

  /**
   * Check if there's a winner
   * @returns {{winner: string|null, line: Array<number>|null}}
   */
  checkWin() {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;

      if (
        this.state.board[a] !== '' &&
        this.state.board[a] === this.state.board[b] &&
        this.state.board[a] === this.state.board[c]
      ) {
        return {
          winner: this.state.board[a],
          line: line
        };
      }
    }

    return { winner: null, line: null };
  }

  /**
   * Check if game is a draw
   * @returns {boolean}
   */
  checkDraw() {
    return this.state.board.every(cell => cell !== '');
  }

  /**
   * Handle game over
   * @param {string} winner - 'X', 'O', or 'draw'
   * @param {Array<number>} line - Winning line indices
   */
  handleGameOver(winner, line) {
    this.state.gameOver = true;
    this.state.winner = winner;
    this.state.winningLine = line;

    // Highlight winning line
    if (line && line.length > 0) {
      line.forEach(index => {
        this.state.cells[index].classList.add('winning');
      });
    }

    // Update stats and save
    if (winner === 'draw') {
      this.state.sessionStats.draws++;
      this.state.messageDisplay.textContent = "It's a draw!";
      this.gameDataService.saveTicTacToeResult('draw');
    } else if (winner === this.state.playerSymbol) {
      this.state.sessionStats.wins++;
      this.state.messageDisplay.textContent = 'You win!';
      this.gameDataService.saveTicTacToeResult('win');
    } else {
      this.state.sessionStats.losses++;
      this.state.messageDisplay.textContent = 'CPU wins!';
      this.gameDataService.saveTicTacToeResult('loss');
    }

    // Reload stats from storage to get updated totals
    this.loadStats();
    this.updateStatsDisplay();

    // Show result modal
    this.showResultModal({
      winner: winner,
      stats: this.state.totalStats
    });
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

    let title = 'Game Over!';
    if (result.winner === 'draw') {
      title = "It's a Draw!";
    } else if (result.winner === this.state.playerSymbol) {
      title = 'You Win!';
    } else {
      title = 'CPU Wins!';
    }

    this.resultModal.show(title, content, buttons);
  }

  /**
   * Build modal content
   * @param {object} result - Result data
   * @returns {string} HTML content
   */
  buildModalContent(result) {
    return `
      <div class="result-stats">
        <div class="stat-item">
          <span class="stat-label">Wins:</span>
          <span class="stat-value">${result.stats.wins}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Losses:</span>
          <span class="stat-value">${result.stats.losses}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Draws:</span>
          <span class="stat-value">${result.stats.draws}</span>
        </div>
      </div>
      <div class="ad-container"><!-- Ad placement --></div>
    `;
  }

  /**
   * Reset game
   */
  resetGame() {
    if (this.state.symbolSelected) {
      this.startGame();
    } else {
      this.showSymbolSelection();
    }
  }

  /**
   * End game
   */
  endGame() {
    this.state.gameOver = true;
  }

  /**
   * Load stats from storage
   */
  loadStats() {
    const stats = this.gameDataService.loadTicTacToeStats();
    this.state.totalStats = stats;
  }

  /**
   * Save stats to storage
   */
  saveStats() {
    this.gameDataService.saveTicTacToeResult(this.state.totalStats);
  }

  /**
   * Update stats display
   */
  updateStatsDisplay() {
    if (this.state.statsDisplay) {
      this.state.statsDisplay.innerHTML = `
        <div>W: ${this.state.totalStats.wins}</div>
        <div>L: ${this.state.totalStats.losses}</div>
        <div>D: ${this.state.totalStats.draws}</div>
      `;
    }
  }
}
