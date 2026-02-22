# Module Design Document - Browser Game Collection

## Overview
This document defines the module structure, dependencies, and interfaces for the Browser Game Collection application.

---

## 1. Module Architecture ✅

### 1.1 Overall Architecture

**Layered Architecture:**
```
┌──────────────────────────────────────────────────────┐
│                 Presentation Layer                   │
│  - index.html (Top Page)                            │
│  - games/*.html (Game Pages)                        │
│  - UI Components (GameCard, Modal, etc.)            │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│                 Application Layer                    │
│  - TopPageController                                │
│  - GameController (base class)                      │
│  - MemoryGameController                             │
│  - TicTacToeController                              │
│  - WhackAMoleController                             │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│                 Service Layer                        │
│  - StorageService                                   │
│  - GameDataService                                  │
│  - ConfigLoader                                     │
│  - AdService (optional)                             │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│                 Data Layer                           │
│  - LocalStorage API                                 │
│  - External JSON Files                              │
└──────────────────────────────────────────────────────┘
```

### 1.2 Module Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│                  index.html (Top Page)              │
│  ┌────────────────────────────────────────────┐    │
│  │  TopPageController                         │    │
│  │    ├─ ConfigLoader                         │    │
│  │    ├─ GameDataService                      │    │
│  │    └─ UIComponents (GameCard)              │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            games/*.html (Game Pages)                │
│  ┌────────────────────────────────────────────┐    │
│  │  GameController (Abstract Base)            │    │
│  │    ├─ StorageService                       │    │
│  │    ├─ GameDataService                      │    │
│  │    └─ UIComponents (Modal, Timer)          │    │
│  │                                             │    │
│  │  MemoryGameController extends GameController│   │
│  │  TicTacToeController extends GameController │   │
│  │  WhackAMoleController extends GameController│   │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Shared Services (All Pages)            │
│  ┌────────────────────────────────────────────┐    │
│  │  StorageService (singleton)                │    │
│  │  GameDataService (singleton)               │    │
│  │  ConfigLoader (singleton)                  │    │
│  │  AdService (singleton, optional)           │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 1.3 File Structure

```
browser-game-collection/
├── index.html                          # Top page
├── games/
│   ├── memory-game.html               # Memory game page
│   ├── tic-tac-toe.html              # Tic-tac-toe page
│   └── whack-a-mole.html             # Whack-a-mole page
├── src/
│   ├── js/
│   │   ├── core/                      # Core modules
│   │   │   ├── StorageService.js     # LocalStorage abstraction
│   │   │   ├── GameDataService.js    # Game data operations
│   │   │   ├── ConfigLoader.js       # JSON config loader
│   │   │   └── AdService.js          # Advertisement service (optional)
│   │   ├── controllers/               # Application controllers
│   │   │   ├── TopPageController.js  # Top page logic
│   │   │   ├── GameController.js     # Base game controller
│   │   │   ├── MemoryGameController.js
│   │   │   ├── TicTacToeController.js
│   │   │   └── WhackAMoleController.js
│   │   ├── ui/                        # UI components
│   │   │   ├── GameCard.js           # Game card component
│   │   │   ├── Modal.js              # Modal component
│   │   │   ├── Timer.js              # Timer component
│   │   │   └── Notification.js       # Toast notification
│   │   └── utils/                     # Utility functions
│   │       ├── validation.js         # Validation functions
│   │       ├── helpers.js            # General helpers
│   │       └── constants.js          # App constants
│   ├── css/
│   │   ├── common.css                # Common styles
│   │   ├── top-page.css              # Top page styles
│   │   ├── game-common.css           # Game page common styles
│   │   └── games/
│   │       ├── memory-game.css
│   │       ├── tic-tac-toe.css
│   │       └── whack-a-mole.css
│   └── assets/
│       ├── data/
│       │   ├── games.json            # Game metadata
│       │   └── site-config.json      # Site configuration
│       └── images/
│           └── thumbnails/           # Game thumbnails
├── docs/                              # Documentation
└── README.md
```

---

## 2. Core Modules ✅

### 2.1 StorageService

**File:** `/src/js/core/StorageService.js`

**Purpose:** Abstract LocalStorage operations with error handling

**Class Definition:**
```javascript
/**
 * LocalStorage abstraction service
 * Provides safe access to browser LocalStorage with error handling
 */
class StorageService {
  /**
   * Constructor
   * @param {string} prefix - Key prefix for all storage items (default: 'bgc_')
   */
  constructor(prefix = 'bgc_');

  /**
   * Save data to LocalStorage
   * @param {string} key - Storage key (without prefix)
   * @param {any} value - Value to store (primitives or objects)
   * @returns {boolean} Success status
   */
  save(key, value);

  /**
   * Load data from LocalStorage
   * @param {string} key - Storage key (without prefix)
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or defaultValue
   */
  load(key, defaultValue = null);

  /**
   * Load numeric value with validation
   * @param {string} key - Storage key (without prefix)
   * @param {number} defaultValue - Default value if invalid
   * @returns {number} Stored number or defaultValue
   */
  loadNumber(key, defaultValue = 0);

  /**
   * Remove item from LocalStorage
   * @param {string} key - Storage key (without prefix)
   * @returns {boolean} Success status
   */
  remove(key);

  /**
   * Clear all items with prefix
   * @returns {boolean} Success status
   */
  clearAll();

  /**
   * Check if LocalStorage is available
   * @returns {boolean} Availability status
   */
  isAvailable();
}

// Export singleton instance
export const storageService = new StorageService('bgc_');
```

**Dependencies:** None

**Used By:** GameDataService, all game controllers

### 2.2 GameDataService

**File:** `/src/js/core/GameDataService.js`

**Purpose:** Game-specific data operations (save/load scores, stats)

**Class Definition:**
```javascript
/**
 * Game data management service
 * Handles game-specific LocalStorage operations
 */
class GameDataService {
  /**
   * Constructor
   * @param {StorageService} storageService - Storage service instance
   */
  constructor(storageService);

  // Memory Game Methods
  /**
   * Save Memory Game high score
   * @param {number} moves - Number of moves
   * @returns {boolean} True if new high score
   */
  saveMemoryGameScore(moves);

  /**
   * Load Memory Game high score
   * @returns {number|null} High score or null
   */
  loadMemoryGameHighScore();

  // Tic-Tac-Toe Methods
  /**
   * Save Tic-Tac-Toe game result
   * @param {'win'|'loss'|'draw'} result - Game result
   */
  saveTicTacToeResult(result);

  /**
   * Load Tic-Tac-Toe statistics
   * @returns {{wins: number, losses: number, draws: number}}
   */
  loadTicTacToeStats();

  // Whack-a-Mole Methods
  /**
   * Save Whack-a-Mole high score
   * @param {number} score - Score achieved
   * @returns {boolean} True if new high score
   */
  saveWhackAMoleScore(score);

  /**
   * Load Whack-a-Mole high score
   * @returns {number} High score (default 0)
   */
  loadWhackAMoleHighScore();
}

// Export singleton instance
export const gameDataService = new GameDataService(storageService);
```

**Dependencies:** StorageService

**Used By:** All game controllers

### 2.3 ConfigLoader

**File:** `/src/js/core/ConfigLoader.js`

**Purpose:** Load and cache external JSON configuration files

**Class Definition:**
```javascript
/**
 * Configuration loader service
 * Loads and caches JSON configuration files
 */
class ConfigLoader {
  /**
   * Constructor
   */
  constructor();

  /**
   * Load site configuration
   * @returns {Promise<object>} Site config object
   */
  async loadSiteConfig();

  /**
   * Load games metadata
   * @returns {Promise<Array>} Array of enabled games
   */
  async loadGamesData();

  /**
   * Get default site config (fallback)
   * @returns {object} Default configuration
   */
  getDefaultSiteConfig();

  /**
   * Show warning to user
   * @param {string} message - Warning message
   */
  showWarning(message);
}

// Export singleton instance
export const configLoader = new ConfigLoader();
```

**Dependencies:** None

**Used By:** TopPageController, all game controllers

### 2.4 AdService (Optional)

**File:** `/src/js/core/AdService.js`

**Purpose:** Manage advertisement display logic

**Class Definition:**
```javascript
/**
 * Advertisement service
 * Manages ad display timing and placement
 */
class AdService {
  /**
   * Constructor
   * @param {object} config - Ad configuration from site-config.json
   */
  constructor(config);

  /**
   * Show pre-game interstitial ad
   * @param {Function} callback - Called when ad can be skipped/closed
   * @returns {Promise<void>}
   */
  async showPreGameAd(callback);

  /**
   * Show post-game ad in modal
   * @param {HTMLElement} container - Container element for ad
   */
  showPostGameAd(container);

  /**
   * Show banner ad on top page
   * @param {HTMLElement} container - Container element for ad
   */
  showBannerAd(container);

  /**
   * Check if ads are enabled
   * @returns {boolean} Ads enabled status
   */
  isEnabled();
}

// Export singleton instance (initialized with config)
export const adService = new AdService();
```

**Dependencies:** ConfigLoader

**Used By:** TopPageController, GameController

---

## 3. Controller Modules ✅

### 3.1 TopPageController

**File:** `/src/js/controllers/TopPageController.js`

**Purpose:** Manage top page functionality (game list, navigation)

**Class Definition:**
```javascript
/**
 * Top page controller
 * Manages game list rendering and user interactions on index.html
 */
class TopPageController {
  /**
   * Constructor
   * @param {ConfigLoader} configLoader - Config loader instance
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(configLoader, gameDataService);

  /**
   * Initialize top page
   * Loads config, renders games, sets up event listeners
   * @returns {Promise<void>}
   */
  async init();

  /**
   * Load and apply site configuration
   * @returns {Promise<void>}
   */
  async loadSiteConfig();

  /**
   * Load games metadata and render game cards
   * @returns {Promise<void>}
   */
  async loadAndRenderGames();

  /**
   * Render game cards in grid
   * @param {Array} games - Array of game objects
   */
  renderGameCards(games);

  /**
   * Create single game card element
   * @param {object} game - Game metadata object
   * @returns {HTMLElement} Game card element
   */
  createGameCard(game);

  /**
   * Handle game card click
   * @param {object} game - Game metadata
   */
  handleGameClick(game);

  /**
   * Show pre-game ad (if enabled)
   * @param {string} gameUrl - URL to navigate after ad
   * @returns {Promise<void>}
   */
  async showPreGameAd(gameUrl);

  /**
   * Navigate to game page
   * @param {string} url - Game page URL
   */
  navigateToGame(url);
}

// Usage in index.html
const controller = new TopPageController(configLoader, gameDataService);
controller.init();
```

**Dependencies:** ConfigLoader, GameDataService, AdService (optional)

**Used By:** index.html

**Key Responsibilities:**
- Load site configuration and game metadata
- Render game cards with thumbnails and metadata
- Display high scores on cards
- Handle game selection and navigation
- Show pre-game ads if enabled
- Display banner ads on page

### 3.2 GameController (Base Class)

**File:** `/src/js/controllers/GameController.js`

**Purpose:** Abstract base class for all game controllers

**Class Definition:**
```javascript
/**
 * Base game controller
 * Abstract class providing common functionality for all games
 */
class GameController {
  /**
   * Constructor
   * @param {string} gameId - Unique game identifier
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameId, gameDataService);

  // Lifecycle Methods (to be implemented by subclasses)

  /**
   * Initialize game
   * Override in subclass to set up game-specific logic
   * @returns {Promise<void>}
   */
  async init();

  /**
   * Start new game
   * Override in subclass to implement game start logic
   */
  startGame();

  /**
   * End current game
   * Override in subclass to implement game end logic
   */
  endGame();

  /**
   * Reset game state
   * Override in subclass to reset game-specific state
   */
  resetGame();

  // Common Methods (provided by base class)

  /**
   * Load high score/stats from storage
   * @returns {any} Stored data
   */
  loadGameData();

  /**
   * Save high score/stats to storage
   * @param {any} data - Data to save
   * @returns {boolean} True if new high score
   */
  saveGameData(data);

  /**
   * Show result modal
   * @param {object} result - Game result data
   */
  showResultModal(result);

  /**
   * Hide result modal
   */
  hideResultModal();

  /**
   * Update UI elements
   * @param {object} state - Current game state
   */
  updateUI(state);

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {'success'|'warning'|'error'} type - Notification type
   */
  showNotification(message, type = 'success');

  /**
   * Navigate back to home
   */
  navigateToHome();
}

export default GameController;
```

**Dependencies:** GameDataService

**Used By:** MemoryGameController, TicTacToeController, WhackAMoleController

### 3.3 MemoryGameController

**File:** `/src/js/controllers/MemoryGameController.js`

**Purpose:** Control Memory Game logic and UI

**Class Definition:**
```javascript
/**
 * Memory Game controller
 * Manages Memory Game state and interactions
 */
class MemoryGameController extends GameController {
  /**
   * Constructor
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameDataService);

  /**
   * Initialize Memory Game
   * @returns {Promise<void>}
   */
  async init();

  /**
   * Start new game
   * Shuffles cards and resets state
   */
  startGame();

  /**
   * Shuffle cards using Fisher-Yates algorithm
   * @returns {Array<number>} Shuffled card values
   */
  shuffleCards();

  /**
   * Handle card click
   * @param {number} index - Card index (0-15)
   */
  handleCardClick(index);

  /**
   * Flip card face up
   * @param {number} index - Card index
   */
  flipCard(index);

  /**
   * Flip card face down
   * @param {number} index - Card index
   */
  unflipCard(index);

  /**
   * Check if two flipped cards match
   * @returns {boolean} True if cards match
   */
  checkMatch();

  /**
   * Handle card match
   * @param {Array<number>} indices - Matched card indices
   */
  handleMatch(indices);

  /**
   * Handle card mismatch
   * @param {Array<number>} indices - Mismatched card indices
   */
  handleMismatch(indices);

  /**
   * Check if game is complete
   * @returns {boolean} True if all pairs matched
   */
  isGameComplete();

  /**
   * End game and show result
   */
  endGame();

  /**
   * Reset game state
   */
  resetGame();

  // State properties
  state = {
    cards: [],              // Array of card values
    flippedCards: [],       // Indices of flipped cards
    matchedPairs: [],       // Indices of matched cards
    moves: 0,               // Move counter
    isLocked: false,        // Prevent clicks during animation
    gameStarted: false,
    highScore: null
  };
}

// Export and initialize in memory-game.html
export default MemoryGameController;
```

**Dependencies:** GameController (parent), GameDataService

**Used By:** games/memory-game.html

### 3.4 TicTacToeController

**File:** `/src/js/controllers/TicTacToeController.js`

**Purpose:** Control Tic-Tac-Toe logic, CPU AI, and UI

**Class Definition:**
```javascript
/**
 * Tic-Tac-Toe controller
 * Manages Tic-Tac-Toe game state, CPU AI, and interactions
 */
class TicTacToeController extends GameController {
  /**
   * Constructor
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameDataService);

  /**
   * Initialize Tic-Tac-Toe game
   * @returns {Promise<void>}
   */
  async init();

  /**
   * Start new game
   * @param {'X'|'O'} playerSymbol - Symbol chosen by player
   */
  startGame(playerSymbol);

  /**
   * Handle cell click
   * @param {number} index - Cell index (0-8)
   */
  handleCellClick(index);

  /**
   * Place mark on board
   * @param {number} index - Cell index
   * @param {'X'|'O'} symbol - Symbol to place
   */
  placeMark(index, symbol);

  /**
   * CPU turn logic
   * Uses medium-difficulty AI with intentional mistakes
   */
  async cpuTurn();

  /**
   * CPU AI: Get best move
   * @returns {number} Cell index for CPU move
   */
  getCPUMove();

  /**
   * Check for winning move
   * @param {'X'|'O'} symbol - Symbol to check
   * @returns {number|null} Winning cell index or null
   */
  findWinningMove(symbol);

  /**
   * Get random available cell
   * @returns {number} Random empty cell index
   */
  getRandomMove();

  /**
   * Check win condition
   * @returns {{winner: string|null, line: Array<number>|null}}
   */
  checkWin();

  /**
   * Check draw condition
   * @returns {boolean} True if board is full
   */
  checkDraw();

  /**
   * End game with result
   * @param {'win'|'loss'|'draw'} result - Game result
   */
  endGame(result);

  /**
   * Reset game state
   */
  resetGame();

  // State properties
  state = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    playerSymbol: 'X',
    cpuSymbol: 'O',
    gameOver: false,
    winner: null,
    winningLine: [],
    stats: { wins: 0, losses: 0, draws: 0 }
  };
}

export default TicTacToeController;
```

**Dependencies:** GameController (parent), GameDataService

**Used By:** games/tic-tac-toe.html

### 3.5 WhackAMoleController

**File:** `/src/js/controllers/WhackAMoleController.js`

**Purpose:** Control Whack-a-Mole game logic, timing, and UI

**Class Definition:**
```javascript
/**
 * Whack-a-Mole controller
 * Manages Whack-a-Mole game state, timers, and mole spawning
 */
class WhackAMoleController extends GameController {
  /**
   * Constructor
   * @param {GameDataService} gameDataService - Game data service instance
   */
  constructor(gameDataService);

  /**
   * Initialize Whack-a-Mole game
   * @returns {Promise<void>}
   */
  async init();

  /**
   * Start new game
   * Starts countdown timer and mole spawning
   */
  startGame();

  /**
   * Start countdown timer
   */
  startTimer();

  /**
   * Update timer display
   */
  updateTimer();

  /**
   * Start mole spawning loop
   */
  startMoleSpawning();

  /**
   * Spawn mole at random hole
   */
  spawnMole();

  /**
   * Show mole at specific hole
   * @param {number} index - Hole index (0-8)
   */
  showMole(index);

  /**
   * Hide mole at specific hole
   * @param {number} index - Hole index
   */
  hideMole(index);

  /**
   * Handle hole click
   * @param {number} index - Hole index
   */
  handleHoleClick(index);

  /**
   * Handle mole hit
   * @param {number} index - Hole index
   */
  handleMoleHit(index);

  /**
   * End game when time runs out
   */
  endGame();

  /**
   * Reset game state
   */
  resetGame();

  /**
   * Cleanup timers
   */
  cleanup();

  // State properties
  state = {
    holes: [false, false, false, false, false, false, false, false, false],
    score: 0,
    timeRemaining: 30,
    gameActive: false,
    timerInterval: null,
    spawnTimeout: null,
    highScore: 0
  };
}

export default WhackAMoleController;
```

**Dependencies:** GameController (parent), GameDataService

**Used By:** games/whack-a-mole.html

---

## 4. UI Component Modules ✅

### 4.1 GameCard Component

**File:** `/src/js/ui/GameCard.js`

**Purpose:** Reusable game card component for top page

**Function Definition:**
```javascript
/**
 * Create game card element
 * @param {object} game - Game metadata
 * @param {number|null} highScore - High score to display
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Game card element
 */
export function createGameCard(game, highScore, onClick) {
  const card = document.createElement('article');
  card.className = 'game-card';
  card.setAttribute('data-game-id', game.id);

  // Build card HTML
  card.innerHTML = `
    <div class="game-card__thumbnail">
      <img src="${game.thumbnail}"
           alt="${game.title}"
           width="380"
           height="214"
           loading="lazy">
    </div>
    <div class="game-card__content">
      <h3 class="game-card__title">${game.title}</h3>
      <div class="game-card__difficulty">
        ${renderDifficulty(game.difficulty)}
      </div>
      <p class="game-card__description">${game.description}</p>
      <div class="game-card__meta">
        <span>⏱ ${game.estimatedTime}</span>
        <span>🏆 Best: ${highScore !== null ? highScore : '--'}</span>
      </div>
      <button class="game-card__button">PLAY NOW</button>
    </div>
  `;

  // Attach event listener
  const button = card.querySelector('.game-card__button');
  button.addEventListener('click', () => onClick(game));

  return card;
}

/**
 * Render difficulty stars
 * @param {string} difficulty - "easy", "medium", or "hard"
 * @returns {string} HTML string with stars
 */
function renderDifficulty(difficulty) {
  const levels = { easy: 1, medium: 2, hard: 3 };
  const stars = levels[difficulty] || 1;
  const filled = '★'.repeat(stars);
  const empty = '☆'.repeat(3 - stars);
  return `<span class="stars">${filled}${empty}</span> ${capitalize(difficulty)}`;
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**Dependencies:** None

**Used By:** TopPageController

### 4.2 Modal Component

**File:** `/src/js/ui/Modal.js`

**Purpose:** Reusable modal dialog component

**Class Definition:**
```javascript
/**
 * Modal dialog component
 * Reusable modal for displaying results, messages, etc.
 */
class Modal {
  /**
   * Constructor
   * @param {string} id - Modal element ID
   */
  constructor(id);

  /**
   * Show modal with content
   * @param {string} title - Modal title
   * @param {string|HTMLElement} content - Modal content
   * @param {Array<object>} buttons - Array of button configs
   *   [{label: 'OK', onClick: Function, primary: boolean}]
   */
  show(title, content, buttons = []);

  /**
   * Hide modal
   */
  hide();

  /**
   * Create modal element if not exists
   */
  create();

  /**
   * Render buttons
   * @param {Array<object>} buttons - Button configurations
   * @returns {string} Buttons HTML
   */
  renderButtons(buttons);
}

// Usage example
const resultModal = new Modal('result-modal');
resultModal.show('Game Complete!', 'Your score: 15', [
  { label: 'Play Again', onClick: () => resetGame(), primary: true },
  { label: 'Back to Home', onClick: () => navigateHome() }
]);

export default Modal;
```

**Dependencies:** None

**Used By:** All game controllers

### 4.3 Timer Component

**File:** `/src/js/ui/Timer.js`

**Purpose:** Countdown timer component

**Class Definition:**
```javascript
/**
 * Countdown timer component
 * Displays and manages countdown timer
 */
class Timer {
  /**
   * Constructor
   * @param {HTMLElement} element - Timer display element
   * @param {number} duration - Duration in seconds
   * @param {Function} onTick - Called each second with remaining time
   * @param {Function} onComplete - Called when timer reaches 0
   */
  constructor(element, duration, onTick, onComplete);

  /**
   * Start timer countdown
   */
  start();

  /**
   * Pause timer
   */
  pause();

  /**
   * Resume timer
   */
  resume();

  /**
   * Reset timer to initial duration
   */
  reset();

  /**
   * Stop and clear timer
   */
  stop();

  /**
   * Update display
   * @param {number} seconds - Seconds remaining
   */
  updateDisplay(seconds);

  /**
   * Format seconds as MM:SS
   * @param {number} seconds - Seconds to format
   * @returns {string} Formatted time string
   */
  formatTime(seconds);
}

// Usage example
const timer = new Timer(
  document.getElementById('timer'),
  30,
  (remaining) => {
    if (remaining <= 10) {
      // Show warning color
      element.classList.add('warning');
    }
  },
  () => {
    // Time's up!
    endGame();
  }
);
timer.start();

export default Timer;
```

**Dependencies:** None

**Used By:** WhackAMoleController

### 4.4 Notification Component

**File:** `/src/js/ui/Notification.js`

**Purpose:** Toast notification component

**Function Definition:**
```javascript
/**
 * Show toast notification
 * @param {string} message - Notification message
 * @param {'success'|'warning'|'error'|'info'} type - Notification type
 * @param {number} duration - Display duration in ms (default: 3000)
 */
export function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Auto-dismiss
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Usage
showNotification('Game saved!', 'success');
showNotification('Failed to load data', 'error');
```

**Dependencies:** None

**Used By:** All controllers

---

## 5. Utility Modules ✅

### 5.1 Validation Utilities

**File:** `/src/js/utils/validation.js`

**Purpose:** Data validation functions

**Exports:**
```javascript
/**
 * Validate numeric score
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Valid or not
 */
export function isValidScore(value, min = 0, max = 10000);

/**
 * Validate game ID format
 * @param {string} id - Game ID
 * @returns {boolean} Valid or not
 */
export function isValidGameId(id);

/**
 * Validate difficulty level
 * @param {string} difficulty - Difficulty value
 * @returns {boolean} Valid or not
 */
export function isValidDifficulty(difficulty);

/**
 * Validate category
 * @param {string} category - Category value
 * @returns {boolean} Valid or not
 */
export function isValidCategory(category);

/**
 * Sanitize value by type
 * @param {any} value - Value to sanitize
 * @param {'number'|'string'|'boolean'} type - Expected type
 * @returns {any} Sanitized value
 */
export function sanitizeValue(value, type);
```

**Dependencies:** None

**Used By:** StorageService, ConfigLoader, all controllers

### 5.2 Helper Utilities

**File:** `/src/js/utils/helpers.js`

**Purpose:** General helper functions

**Exports:**
```javascript
/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (new instance)
 */
export function shuffleArray(array);

/**
 * Get random integer in range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer
 */
export function getRandomInt(min, max);

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait);

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export function deepClone(obj);

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num);

/**
 * Sleep for specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms);
```

**Dependencies:** None

**Used By:** All controllers

### 5.3 Constants

**File:** `/src/js/utils/constants.js`

**Purpose:** Application-wide constants

**Exports:**
```javascript
/**
 * Application constants
 */

// Storage keys
export const STORAGE_PREFIX = 'bgc_';

// Game IDs
export const GAME_IDS = {
  MEMORY_GAME: 'memory-game',
  TIC_TAC_TOE: 'tic-tac-toe',
  WHACK_A_MOLE: 'whack-a-mole'
};

// Game states
export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  ENDED: 'ended'
};

// Difficulty levels
export const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Categories
export const CATEGORIES = {
  PUZZLE: 'puzzle',
  ACTION: 'action',
  STRATEGY: 'strategy'
};

// UI timing
export const ANIMATION_DURATION = 300; // ms
export const NOTIFICATION_DURATION = 3000; // ms
export const MODAL_FADE_DURATION = 300; // ms

// Tic-Tac-Toe winning lines
export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
  [0, 4, 8], [2, 4, 6]             // Diagonal
];

// Memory Game config
export const MEMORY_GAME_CONFIG = {
  TOTAL_CARDS: 16,
  PAIRS: 8,
  FLIP_DELAY: 1000 // ms
};

// Whack-a-Mole config
export const WHACK_A_MOLE_CONFIG = {
  TOTAL_HOLES: 9,
  GAME_DURATION: 30, // seconds
  MOLE_VISIBILITY: 1000, // ms
  SPAWN_MIN_DELAY: 500, // ms
  SPAWN_MAX_DELAY: 1500 // ms
};
```

**Dependencies:** None

**Used By:** All modules

---

## 6. Module Loading Strategy ✅

### 6.1 ES6 Modules

**All JavaScript uses ES6 module syntax:**

```html
<!-- In HTML files -->
<script type="module" src="/src/js/controllers/TopPageController.js"></script>
```

**Module imports:**
```javascript
// In TopPageController.js
import { configLoader } from '../core/ConfigLoader.js';
import { gameDataService } from '../core/GameDataService.js';
import { createGameCard } from '../ui/GameCard.js';
```

### 6.2 Loading Order

**Top Page (index.html):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Browser Games Collection</title>
  <link rel="stylesheet" href="/src/css/common.css">
  <link rel="stylesheet" href="/src/css/top-page.css">
</head>
<body>
  <!-- HTML content -->

  <!-- Load modules in order -->
  <script type="module">
    import { TopPageController } from '/src/js/controllers/TopPageController.js';
    import { configLoader } from '/src/js/core/ConfigLoader.js';
    import { gameDataService } from '/src/js/core/GameDataService.js';

    // Initialize controller
    const controller = new TopPageController(configLoader, gameDataService);
    controller.init();
  </script>
</body>
</html>
```

**Game Pages (games/*.html):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Memory Game</title>
  <link rel="stylesheet" href="/src/css/common.css">
  <link rel="stylesheet" href="/src/css/game-common.css">
  <link rel="stylesheet" href="/src/css/games/memory-game.css">
</head>
<body>
  <!-- HTML content -->

  <script type="module">
    import MemoryGameController from '/src/js/controllers/MemoryGameController.js';
    import { gameDataService } from '/src/js/core/GameDataService.js';

    // Initialize controller
    const controller = new MemoryGameController(gameDataService);
    controller.init();
  </script>
</body>
</html>
```

### 6.3 Browser Compatibility

**ES6 Modules Support:**
- Chrome 61+
- Edge 16+
- Firefox 60+
- Safari 11+

**For older browsers (not required for initial release):**
- Use bundler like Rollup or Webpack
- Transpile to ES5 with Babel

---

## 7. Inter-Module Communication ✅

### 7.1 Communication Patterns

**1. Direct Method Calls (Most Common):**
```javascript
// Controller calls service
const highScore = gameDataService.loadMemoryGameHighScore();
```

**2. Event-Based Communication (For UI):**
```javascript
// Custom events for decoupled components
document.dispatchEvent(new CustomEvent('game:complete', {
  detail: { score: 15, isNewRecord: true }
}));

// Listen for events
document.addEventListener('game:complete', (event) => {
  showResultModal(event.detail);
});
```

**3. Callback Functions:**
```javascript
// Timer calls callback on complete
const timer = new Timer(element, 30, onTick, onComplete);
```

### 7.2 Event Types

**Custom Events:**
```javascript
// Game events
'game:start'      // Game started
'game:pause'      // Game paused
'game:resume'     // Game resumed
'game:complete'   // Game completed
'game:reset'      // Game reset

// UI events
'modal:show'      // Modal shown
'modal:hide'      // Modal hidden
'notification:show' // Notification shown

// Data events
'score:save'      // Score saved
'score:newrecord' // New high score
```

---

## 8. Error Handling Strategy ✅

### 8.1 Error Handling Layers

**Service Layer:**
```javascript
// In StorageService
save(key, value) {
  try {
    localStorage.setItem(this.prefix + key, value);
    return true;
  } catch (error) {
    console.error('Failed to save:', error);
    this.handleStorageError(error);
    return false;
  }
}

handleStorageError(error) {
  if (error.name === 'QuotaExceededError') {
    showNotification('Storage full', 'warning');
  } else if (error.name === 'SecurityError') {
    showNotification('Storage access denied', 'warning');
  }
}
```

**Controller Layer:**
```javascript
// In GameController
async init() {
  try {
    await this.loadGameData();
    this.setupEventListeners();
    this.render();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    this.showError('Failed to load game. Please refresh the page.');
  }
}
```

**Global Error Handler:**
```javascript
// In main script
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showNotification('Something went wrong', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showNotification('Failed to load data', 'error');
});
```

### 8.2 Fallback Strategies

**1. LocalStorage Unavailable:**
- Detect with `storageService.isAvailable()`
- Show warning to user
- Continue with in-memory storage (scores not saved)

**2. JSON Loading Failure:**
- Use default/fallback configuration
- Show warning to user
- Retry once after delay

**3. Game State Corruption:**
- Validate loaded data
- Reset to default state if invalid
- Notify user of reset

---

## 9. Testing Strategy ✅

### 9.1 Unit Testing

**Test Framework:** Jest (optional, not required for initial release)

**Test Coverage:**
- Core services (StorageService, GameDataService)
- Utility functions (validation, helpers)
- Game logic (CPU AI, win detection, shuffling)

**Example Test:**
```javascript
// StorageService.test.js
import { storageService } from '../core/StorageService.js';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('save and load number', () => {
    storageService.save('test_score', 42);
    const loaded = storageService.loadNumber('test_score', 0);
    expect(loaded).toBe(42);
  });

  test('returns default for missing key', () => {
    const loaded = storageService.loadNumber('nonexistent', 99);
    expect(loaded).toBe(99);
  });
});
```

### 9.2 Integration Testing

**Manual Testing Checklist:**
- [ ] Top page loads and displays games
- [ ] Game cards show correct metadata
- [ ] Clicking game navigates to game page
- [ ] Game initializes correctly
- [ ] Game logic works as expected
- [ ] Scores save and persist
- [ ] High scores display correctly
- [ ] Modal appears on game end
- [ ] "Play Again" resets game
- [ ] "Back to Home" navigates to top page

### 9.3 Browser Testing

**Test Matrix:**
| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | Latest  | ✅ Primary |
| Edge    | Latest  | ✅ Primary |
| Firefox | Latest  | ✅ Primary |
| Safari  | Latest  | ⚠️ Test |

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed
  - Module Architecture: Layered architecture, dependency graph, file structure
  - Core Modules: StorageService, GameDataService, ConfigLoader, AdService
  - Controller Modules: TopPageController, GameController (base), game-specific controllers
  - UI Component Modules: GameCard, Modal, Timer, Notification
  - Utility Modules: Validation, helpers, constants
  - Module Loading Strategy: ES6 modules, loading order, browser compatibility
  - Inter-Module Communication: Communication patterns, event types
  - Error Handling: Multi-layer error handling, fallback strategies
  - Testing Strategy: Unit tests, integration tests, browser testing
- 2026-02-22: Internal review and alignment with requirements.md
  - Confirmed file structure aligns with requirements.md Section 1.8
  - index.html placement: Root directory (GitHub Pages convention)
  - Folder structure: core/, controllers/, ui/, utils/ (layered architecture)
  - Module organization prioritizes maintainability and scalability
