/**
 * NineGameController.js
 * Nine card game logic - Strategic card game inspired by manga "Ten"
 * Player vs CPU: Use cards 1-9 wisely to score maximum points
 */

import GameController from './GameController.js';
import Modal from '../ui/Modal.js';

export default class NineGameController extends GameController {
  /**
   * Constructor
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameDataService) {
    super('nine-game', gameDataService);

    // Game state
    this.state = {
      // Card data
      playerCards: [1, 2, 3, 4, 5, 6, 7, 8, 9],      // Available cards
      cpuCards: [1, 2, 3, 4, 5, 6, 7, 8, 9],         // Available cards
      playerUsedCards: [],                            // Already played
      cpuUsedCards: [],                               // Already played

      // Turn data
      currentTurn: 1,                                 // 1-9
      isPlayerTurn: true,                             // Turn order alternates

      // Selection data
      playerSelectedCard: null,                       // Current selection
      cpuSelectedCard: null,                          // Hidden until reveal

      // Revealed cards (for display)
      lastPlayerCard: null,
      lastCpuCard: null,
      lastRoundResult: null,

      // Score data
      playerScore: 0,
      cpuScore: 0,
      highScore: null,

      // Game state
      gamePhase: 'selection',  // selection | reveal | complete
      isLocked: false,         // Lock during animations

      // DOM cache
      playerCardElements: [],
      cpuCardElements: [],
      confirmButton: null,
      newGameButton: null,
      playerScoreDisplay: null,
      cpuScoreDisplay: null,
      highScoreDisplay: null,
      turnDisplay: null,
      resultDisplay: null
    };
  }

  /**
   * Initialize game
   */
  async init() {
    // Load high score from storage
    this.state.highScore = this.gameDataService.loadNineGameHighScore();

    // Cache DOM elements
    this.cacheDOM();

    // Setup event listeners
    this.setupCommonListeners();
    this.setupGameListeners();

    // Update displays
    this.updateScoreDisplays();
    this.updateTurnDisplay();

    // Start game
    this.startGame();
  }

  /**
   * Cache DOM elements
   */
  cacheDOM() {
    // Card containers
    const playerCardsContainer = document.getElementById('player-cards');
    const cpuCardsContainer = document.getElementById('cpu-cards');

    if (playerCardsContainer) {
      this.state.playerCardElements = Array.from(
        playerCardsContainer.querySelectorAll('.nine-card')
      );
    }

    if (cpuCardsContainer) {
      this.state.cpuCardElements = Array.from(
        cpuCardsContainer.querySelectorAll('.nine-card')
      );
    }

    // Buttons
    this.state.confirmButton = document.getElementById('confirm-btn');
    this.state.newGameButton = document.getElementById('new-game-btn');

    // Displays
    this.state.playerScoreDisplay = document.getElementById('player-score');
    this.state.cpuScoreDisplay = document.getElementById('cpu-score');
    this.state.highScoreDisplay = document.getElementById('high-score-value');
    this.state.turnDisplay = document.getElementById('turn-display');
    this.state.resultDisplay = document.getElementById('result-display');
  }

  /**
   * Setup game-specific event listeners
   */
  setupGameListeners() {
    // Player card clicks
    this.state.playerCardElements.forEach((cardEl, index) => {
      cardEl.addEventListener('click', () => this.handleCardClick(index));
    });

    // Confirm button
    if (this.state.confirmButton) {
      this.state.confirmButton.addEventListener('click', () => this.handleConfirm());
    }

    // New game button
    if (this.state.newGameButton) {
      this.state.newGameButton.addEventListener('click', () => this.resetGame());
    }
  }

  /**
   * Start new game
   */
  startGame() {
    // Reset state
    this.state.playerCards = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.state.cpuCards = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.state.playerUsedCards = [];
    this.state.cpuUsedCards = [];
    this.state.currentTurn = 1;
    this.state.isPlayerTurn = true;
    this.state.playerSelectedCard = null;
    this.state.cpuSelectedCard = null;
    this.state.lastPlayerCard = null;
    this.state.lastCpuCard = null;
    this.state.lastRoundResult = null;
    this.state.playerScore = 0;
    this.state.cpuScore = 0;
    this.state.gamePhase = 'selection';
    this.state.isLocked = false;

    // Render cards
    this.renderCards();

    // Update displays
    this.updateScoreDisplays();
    this.updateTurnDisplay();
    this.updateConfirmButton();

    // Clear result display
    if (this.state.resultDisplay) {
      this.state.resultDisplay.textContent = 'Select a card and click Confirm!';
      this.state.resultDisplay.className = 'result-display';
    }
  }

  /**
   * Render all cards
   */
  renderCards() {
    // Render player cards
    this.state.playerCardElements.forEach((cardEl, index) => {
      const cardValue = index + 1;
      const isUsed = this.state.playerUsedCards.includes(cardValue);
      const isSelected = this.state.playerSelectedCard === cardValue;

      cardEl.dataset.value = cardValue;
      cardEl.textContent = cardValue;
      cardEl.classList.remove('used', 'selected', 'red', 'black');

      // Add color class (odd = red, even = black)
      cardEl.classList.add(cardValue % 2 === 1 ? 'red' : 'black');

      if (isUsed) {
        cardEl.classList.add('used');
      }

      if (isSelected) {
        cardEl.classList.add('selected');
      }
    });

    // Render CPU cards (face-down, show as used if played)
    this.state.cpuCardElements.forEach((cardEl, index) => {
      const cardValue = index + 1;
      const isUsed = this.state.cpuUsedCards.includes(cardValue);

      cardEl.dataset.value = cardValue;
      cardEl.classList.remove('used');

      if (isUsed) {
        cardEl.classList.add('used');
        cardEl.textContent = cardValue;
        cardEl.classList.add(cardValue % 2 === 1 ? 'red' : 'black');
      } else {
        cardEl.textContent = '?';
        cardEl.classList.remove('red', 'black');
      }
    });
  }

  /**
   * Handle player card click
   * @param {number} index - Card index (0-8)
   */
  handleCardClick(index) {
    // Validation
    if (this.state.isLocked) return;
    if (this.state.gamePhase !== 'selection') return;

    const cardValue = index + 1;

    // Cannot select used cards
    if (this.state.playerUsedCards.includes(cardValue)) return;

    // Toggle selection
    if (this.state.playerSelectedCard === cardValue) {
      this.state.playerSelectedCard = null;
    } else {
      this.state.playerSelectedCard = cardValue;
    }

    // Re-render cards
    this.renderCards();

    // Update confirm button
    this.updateConfirmButton();
  }

  /**
   * Handle confirm button click
   */
  async handleConfirm() {
    // Validation
    if (this.state.isLocked) return;
    if (this.state.playerSelectedCard === null) return;
    if (this.state.gamePhase !== 'selection') return;

    // Lock game
    this.state.isLocked = true;

    // Disable confirm button
    if (this.state.confirmButton) {
      this.state.confirmButton.disabled = true;
    }

    // Update result display
    if (this.state.resultDisplay) {
      this.state.resultDisplay.textContent = 'CPU is thinking...';
      this.state.resultDisplay.className = 'result-display';
    }

    // CPU selects card (1 second delay)
    await this.sleep(1000);
    this.state.cpuSelectedCard = this.cpuSelectCard();

    // Store cards for display
    this.state.lastPlayerCard = this.state.playerSelectedCard;
    this.state.lastCpuCard = this.state.cpuSelectedCard;

    // Mark cards as used
    this.state.playerUsedCards.push(this.state.playerSelectedCard);
    this.state.cpuUsedCards.push(this.state.cpuSelectedCard);

    // Remove from available cards
    this.state.playerCards = this.state.playerCards.filter(
      c => c !== this.state.playerSelectedCard
    );
    this.state.cpuCards = this.state.cpuCards.filter(
      c => c !== this.state.cpuSelectedCard
    );

    // Reveal phase
    this.state.gamePhase = 'reveal';

    // Reveal and resolve
    await this.revealCards();

    // Check if game complete
    if (this.state.currentTurn >= 9) {
      this.handleGameComplete();
    } else {
      // Next turn
      this.nextTurn();
    }
  }

  /**
   * CPU card selection strategy (Medium difficulty)
   * @returns {number} Selected card value (1-9)
   */
  cpuSelectCard() {
    const availableCards = [...this.state.cpuCards];
    const playerScore = this.state.playerScore;
    const cpuScore = this.state.cpuScore;
    const remainingTurns = 10 - this.state.currentTurn;
    const scoreDiff = cpuScore - playerScore;

    // Strategy 1: If behind by a lot (>15 points), play high card
    if (scoreDiff < -15 && availableCards.length > 3) {
      const topCards = availableCards.slice(-3);
      return this.randomChoice(topCards);
    }

    // Strategy 2: If ahead by a lot (>15 points), save high cards
    if (scoreDiff > 15 && availableCards.length > 3) {
      const bottomCards = availableCards.slice(0, 3);
      return this.randomChoice(bottomCards);
    }

    // Strategy 3: If last 3 turns and losing/tied, play aggressively
    if (remainingTurns <= 3 && scoreDiff <= 0) {
      return Math.max(...availableCards);
    }

    // Strategy 4: Default - play middle-range card with randomness
    const middleCards = availableCards.filter(c => c >= 4 && c <= 6);
    if (middleCards.length > 0 && Math.random() < 0.6) {
      return this.randomChoice(middleCards);
    }

    // Strategy 5: Fallback - random card
    return this.randomChoice(availableCards);
  }

  /**
   * Reveal cards and resolve round
   */
  async revealCards() {
    const playerCard = this.state.lastPlayerCard;
    const cpuCard = this.state.lastCpuCard;

    // Re-render to show CPU card
    this.renderCards();

    // Calculate result
    const result = this.resolveRound(playerCard, cpuCard);
    this.state.lastRoundResult = result;

    // Update scores
    this.state.playerScore += result.playerPoints;
    this.state.cpuScore += result.cpuPoints;

    // Update displays
    this.updateScoreDisplays();

    // Show result message
    if (this.state.resultDisplay) {
      this.state.resultDisplay.textContent = result.message;
      this.state.resultDisplay.className = `result-display ${result.winner}`;
    }

    // Wait for user to see result
    await this.sleep(2000);
  }

  /**
   * Resolve round - determine winner and points
   * @param {number} playerCard - Player's card value
   * @param {number} cpuCard - CPU's card value
   * @returns {object} Result {winner, playerPoints, cpuPoints, message}
   */
  resolveRound(playerCard, cpuCard) {
    const totalPoints = playerCard + cpuCard;

    if (playerCard > cpuCard) {
      return {
        winner: 'player',
        playerPoints: totalPoints,
        cpuPoints: 0,
        message: `You win ${totalPoints} points! (Your ${playerCard} > CPU ${cpuCard})`
      };
    } else if (cpuCard > playerCard) {
      return {
        winner: 'cpu',
        playerPoints: 0,
        cpuPoints: totalPoints,
        message: `CPU wins ${totalPoints} points! (CPU ${cpuCard} > Your ${playerCard})`
      };
    } else {
      // Tie: No points awarded
      return {
        winner: 'tie',
        playerPoints: 0,
        cpuPoints: 0,
        message: `Tie! No points awarded. (${playerCard} = ${cpuCard})`
      };
    }
  }

  /**
   * Advance to next turn
   */
  nextTurn() {
    // Increment turn
    this.state.currentTurn++;

    // Alternate turn order (player goes first on odd turns)
    this.state.isPlayerTurn = (this.state.currentTurn % 2 === 1);

    // Reset selection
    this.state.playerSelectedCard = null;
    this.state.cpuSelectedCard = null;

    // Back to selection phase
    this.state.gamePhase = 'selection';
    this.state.isLocked = false;

    // Update displays
    this.updateTurnDisplay();
    this.updateConfirmButton();

    // Re-render cards
    this.renderCards();

    // Update result display
    if (this.state.resultDisplay) {
      this.state.resultDisplay.textContent = 'Select a card and click Confirm!';
      this.state.resultDisplay.className = 'result-display';
    }
  }

  /**
   * Handle game completion
   */
  handleGameComplete() {
    this.state.gamePhase = 'complete';
    this.state.isLocked = true;

    // Determine winner
    let winner, message;
    if (this.state.playerScore > this.state.cpuScore) {
      winner = 'player';
      message = 'You Win!';
    } else if (this.state.cpuScore > this.state.playerScore) {
      winner = 'cpu';
      message = 'CPU Wins!';
    } else {
      winner = 'tie';
      message = "It's a Tie!";
    }

    // Check for new high score (only if player wins or ties)
    const isNewRecord = this.checkAndSaveHighScore();

    // Show result modal
    setTimeout(() => {
      this.showResultModal({
        winner: winner,
        message: message,
        playerScore: this.state.playerScore,
        cpuScore: this.state.cpuScore,
        highScore: this.state.highScore,
        isNewRecord: isNewRecord
      });
    }, 1000);
  }

  /**
   * Check and save high score
   * @returns {boolean} True if new record
   */
  checkAndSaveHighScore() {
    const currentScore = this.state.playerScore;
    const currentBest = this.state.highScore;

    // Higher is better for Nine game
    if (currentBest === null || currentScore > currentBest) {
      this.gameDataService.saveNineGameScore(currentScore);
      this.state.highScore = currentScore;
      this.updateScoreDisplays();
      return true;
    }

    return false;
  }

  /**
   * Update score displays
   */
  updateScoreDisplays() {
    if (this.state.playerScoreDisplay) {
      this.state.playerScoreDisplay.textContent = this.state.playerScore;
    }

    if (this.state.cpuScoreDisplay) {
      this.state.cpuScoreDisplay.textContent = this.state.cpuScore;
    }

    if (this.state.highScoreDisplay) {
      this.state.highScoreDisplay.textContent =
        this.state.highScore !== null ? this.state.highScore : '--';
    }
  }

  /**
   * Update turn display
   */
  updateTurnDisplay() {
    if (this.state.turnDisplay) {
      const turnText = `Turn ${this.state.currentTurn}/9`;
      const whoseTurn = this.state.isPlayerTurn ? "Your turn" : "CPU's turn";
      this.state.turnDisplay.textContent = `${turnText} - ${whoseTurn}`;
    }
  }

  /**
   * Update confirm button state
   */
  updateConfirmButton() {
    if (this.state.confirmButton) {
      this.state.confirmButton.disabled =
        this.state.playerSelectedCard === null ||
        this.state.isLocked ||
        this.state.gamePhase !== 'selection';
    }
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

    this.resultModal.show('Game Over!', content, buttons);
  }

  /**
   * Build modal content
   * @param {object} result - Result data
   * @returns {string} HTML content
   */
  buildModalContent(result) {
    let html = '';

    // New record badge
    if (result.isNewRecord) {
      html += '<div class="new-record">⭐ NEW RECORD! ⭐</div>';
    }

    // Winner message
    html += `<p class="result-message ${result.winner}">${result.message}</p>`;

    // Scores
    html += '<div class="result-stats">';
    html += `
      <div class="stat-item">
        <span class="stat-label">Your Score:</span>
        <span class="stat-value">${result.playerScore}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">CPU Score:</span>
        <span class="stat-value">${result.cpuScore}</span>
      </div>
    `;

    if (result.highScore !== null) {
      html += `
        <div class="stat-item">
          <span class="stat-label">Best Score:</span>
          <span class="stat-value">${result.highScore}</span>
        </div>
      `;
    }

    html += '</div>';

    // Ad container
    html += '<div class="ad-container"><!-- Ad placement --></div>';

    return html;
  }

  /**
   * Reset game
   */
  resetGame() {
    this.startGame();
  }

  /**
   * End game
   */
  endGame() {
    this.state.gamePhase = 'complete';
    this.state.isLocked = true;
  }

  /**
   * Utility: Sleep/delay
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Utility: Random choice from array
   * @param {Array} array - Array to choose from
   * @returns {any} Random element
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}
