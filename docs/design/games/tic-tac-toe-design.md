# Tic-Tac-Toe - Detailed Design Document

## Overview
This document provides detailed design specifications for the Tic-Tac-Toe game implementation, including CPU AI algorithm, state management, win detection, and user interactions.

---

## 1. Game Specifications Summary ✅

**From Requirements (docs/games/tic-tac-toe.md):**
- 3×3 grid
- Player vs CPU
- Player chooses X (first) or O (second)
- Medium difficulty CPU AI
- Win/Loss/Draw statistics tracking
- Winning line highlight animation

**Key Features:**
- Strategic CPU AI with intentional mistakes
- Win detection (8 possible lines)
- Statistics persistence (LocalStorage)
- Instant visual feedback
- CPU move delay (0.5-1 second)

---

## 2. State Management ✅

### 2.1 Game State Object

**Complete State Definition:**
```javascript
const state = {
  // Board state
  board: ['', '', '', '', '', '', '', '', ''],  // 9 cells: '' = empty, 'X' or 'O'

  // Player configuration
  currentPlayer: 'X',        // String: 'X' or 'O' (whose turn)
  playerSymbol: 'X',         // String: 'X' or 'O' (what player chose)
  cpuSymbol: 'O',            // String: 'X' or 'O' (CPU's symbol)

  // Game control
  gameOver: false,           // Boolean: Game ended?
  winner: null,              // String|null: 'X', 'O', 'draw', or null
  winningLine: [],           // Array<number>: Indices of winning cells

  // Statistics (session + cumulative)
  sessionStats: {
    wins: 0,
    losses: 0,
    draws: 0
  },
  totalStats: {
    wins: 0,                 // From LocalStorage
    losses: 0,
    draws: 0
  },

  // UI state
  cpuThinking: false,        // Boolean: CPU calculating move
  symbolSelected: false,     // Boolean: Has player chosen symbol?

  // DOM references (cached)
  cells: [],                 // Array<HTMLElement>: Cell elements
  statsDisplay: null,        // HTMLElement: Stats display
  messageDisplay: null       // HTMLElement: Turn/result message
};
```

### 2.2 State Transitions

**State Transition Diagram:**
```
┌──────────────┐
│  SYMBOL      │ Player chooses X or O
│  SELECTION   │ playerSymbol set
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  GAME_START  │ board reset to empty
│              │ currentPlayer = 'X'
└──────┬───────┘
       │
       ↓ Is currentPlayer === playerSymbol?
       │
       ├─ YES → PLAYER_TURN
       └─ NO  → CPU_TURN

┌──────────────┐
│ PLAYER_TURN  │ Wait for player click
└──────┬───────┘
       │ Player clicks cell
       ↓
┌──────────────┐
│ PLACE_MARK   │ board[index] = playerSymbol
│              │ Check win/draw
└──────┬───────┘
       │
       ├─ Win? → GAME_OVER (player wins)
       ├─ Draw? → GAME_OVER (draw)
       └─ Continue → CPU_TURN

┌──────────────┐
│  CPU_TURN    │ cpuThinking = true
│              │ Calculate move
│              │ Delay 0.5-1s
└──────┬───────┘
       │ CPU places mark
       ↓
┌──────────────┐
│ PLACE_MARK   │ board[index] = cpuSymbol
│              │ Check win/draw
│              │ cpuThinking = false
└──────┬───────┘
       │
       ├─ Win? → GAME_OVER (CPU wins)
       ├─ Draw? → GAME_OVER (draw)
       └─ Continue → PLAYER_TURN

┌──────────────┐
│  GAME_OVER   │ gameOver = true
│              │ winner = 'X'|'O'|'draw'
│              │ Highlight winning line
│              │ Update statistics
│              │ Show result modal
└──────────────┘
```

---

## 3. Win Detection Algorithm ✅

### 3.1 Winning Lines Definition

**All 8 Possible Winning Combinations:**
```javascript
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
```

**Board Index Mapping:**
```
┌───┬───┬───┐
│ 0 │ 1 │ 2 │
├───┼───┼───┤
│ 3 │ 4 │ 5 │
├───┼───┼───┤
│ 6 │ 7 │ 8 │
└───┴───┴───┘
```

### 3.2 Win Check Implementation

**Algorithm:**
```javascript
/**
 * Check if there's a winner
 * @returns {{winner: string|null, line: Array<number>|null}}
 */
function checkWin() {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;

    // Check if all three cells have same non-empty symbol
    if (
      state.board[a] !== '' &&
      state.board[a] === state.board[b] &&
      state.board[a] === state.board[c]
    ) {
      return {
        winner: state.board[a],  // 'X' or 'O'
        line: line                // [a, b, c]
      };
    }
  }

  return { winner: null, line: null };
}
```

**Time Complexity:** O(1) - Always checks exactly 8 lines
**Space Complexity:** O(1)

### 3.3 Draw Detection

**Algorithm:**
```javascript
/**
 * Check if game is a draw
 * @returns {boolean} True if board full and no winner
 */
function checkDraw() {
  // Board is full (no empty cells) and no winner
  return state.board.every(cell => cell !== '') && !checkWin().winner;
}

// Alternative: Check if board is full
function isBoardFull() {
  return !state.board.includes('');
}
```

**Time Complexity:** O(1) - Board always has 9 cells

---

## 4. CPU AI Algorithm ✅

### 4.1 Medium Difficulty Strategy

**AI Behavior:**
- Not perfect (allows player to win)
- Makes strategic moves with intentional mistakes
- Priority-based decision making

**Strategy Priority (with error rates):**
1. **Win if possible** (70% success rate)
2. **Block player win** (80% success rate)
3. **Take center** (60% if available)
4. **Take corner** (40% preference)
5. **Random move** (100% fallback)

### 4.2 AI Implementation

**Main CPU Move Function:**
```javascript
/**
 * Get CPU's next move
 * @returns {number} Cell index (0-8)
 */
function getCPUMove() {
  // 1. Win if possible (70% chance)
  if (Math.random() < 0.7) {
    const winMove = findWinningMove(state.cpuSymbol);
    if (winMove !== null) {
      return winMove;
    }
  }

  // 2. Block player win (80% chance)
  if (Math.random() < 0.8) {
    const blockMove = findWinningMove(state.playerSymbol);
    if (blockMove !== null) {
      return blockMove;
    }
  }

  // 3. Take center (60% chance)
  if (Math.random() < 0.6 && state.board[4] === '') {
    return 4;
  }

  // 4. Take corner (40% preference)
  if (Math.random() < 0.4) {
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => state.board[i] === '');
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
  }

  // 5. Random available cell
  return getRandomMove();
}
```

### 4.3 Helper Functions

**Find Winning Move:**
```javascript
/**
 * Find move that wins for given symbol
 * @param {string} symbol - 'X' or 'O'
 * @returns {number|null} Winning cell index or null
 */
function findWinningMove(symbol) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const cells = [state.board[a], state.board[b], state.board[c]];

    // Count occurrences
    const symbolCount = cells.filter(cell => cell === symbol).length;
    const emptyCount = cells.filter(cell => cell === '').length;

    // If 2 symbols and 1 empty, this line can win
    if (symbolCount === 2 && emptyCount === 1) {
      // Find and return the empty cell
      if (state.board[a] === '') return a;
      if (state.board[b] === '') return b;
      if (state.board[c] === '') return c;
    }
  }

  return null;
}
```

**Random Move:**
```javascript
/**
 * Get random available cell
 * @returns {number} Random empty cell index
 */
function getRandomMove() {
  const availableCells = state.board
    .map((cell, index) => (cell === '' ? index : null))
    .filter(index => index !== null);

  return availableCells[Math.floor(Math.random() * availableCells.length)];
}
```

**Get Available Cells:**
```javascript
/**
 * Get all available (empty) cells
 * @returns {Array<number>} Array of available cell indices
 */
function getAvailableCells() {
  return state.board
    .map((cell, index) => (cell === '' ? index : null))
    .filter(index => index !== null);
}
```

---

## 5. UI Implementation ✅

### 5.1 HTML Structure

**Game Board:**
```html
<div class="tic-tac-toe">
  <div class="game-header">
    <h2>Tic-Tac-Toe</h2>
    <div class="game-stats">
      <span class="stat">W: <span id="wins">0</span></span>
      <span class="stat">L: <span id="losses">0</span></span>
      <span class="stat">D: <span id="draws">0</span></span>
    </div>
  </div>

  <!-- Symbol selection (shown at start) -->
  <div id="symbol-selection" class="symbol-selection">
    <h3>Choose Your Symbol</h3>
    <div class="symbol-buttons">
      <button id="choose-x" class="btn-symbol">X (Play First)</button>
      <button id="choose-o" class="btn-symbol">O (Play Second)</button>
    </div>
  </div>

  <!-- Game board (hidden until symbol chosen) -->
  <div id="game-board" class="board hidden">
    <div class="board-grid">
      <div class="cell" data-index="0"></div>
      <div class="cell" data-index="1"></div>
      <div class="cell" data-index="2"></div>
      <div class="cell" data-index="3"></div>
      <div class="cell" data-index="4"></div>
      <div class="cell" data-index="5"></div>
      <div class="cell" data-index="6"></div>
      <div class="cell" data-index="7"></div>
      <div class="cell" data-index="8"></div>
    </div>

    <div class="game-message">
      <p id="turn-message">Your Turn</p>
    </div>
  </div>

  <div class="game-controls">
    <button id="new-game-btn" class="btn-secondary">New Game</button>
    <button id="back-btn" class="btn-secondary">Back to Home</button>
  </div>
</div>
```

**CSS Grid Layout:**
```css
.board-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.cell {
  aspect-ratio: 1;
  background: white;
  border: 2px solid #3498db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cell:hover:not(.filled) {
  background: #ecf0f1;
  transform: scale(1.05);
}

.cell.filled {
  cursor: default;
}

.cell.x {
  color: #3498db;
}

.cell.o {
  color: #e74c3c;
}

.cell.winning {
  background: #27ae60;
  color: white;
  animation: pulse 0.5s ease;
}
```

### 5.2 Dynamic Updates

**Place Mark:**
```javascript
/**
 * Place mark on board
 * @param {number} index - Cell index
 * @param {string} symbol - 'X' or 'O'
 */
function placeMark(index, symbol) {
  // Update state
  state.board[index] = symbol;

  // Update UI
  const cell = state.cells[index];
  cell.textContent = symbol;
  cell.classList.add('filled', symbol.toLowerCase());
}
```

**Highlight Winning Line:**
```javascript
/**
 * Highlight winning line
 * @param {Array<number>} line - Winning cell indices
 */
function highlightWinningLine(line) {
  line.forEach(index => {
    state.cells[index].classList.add('winning');
  });
}
```

---

## 6. Event Handling ✅

### 6.1 Symbol Selection

**Choose Symbol:**
```javascript
/**
 * Handle symbol selection
 * @param {string} symbol - 'X' or 'O'
 */
function handleSymbolSelection(symbol) {
  // Set player and CPU symbols
  state.playerSymbol = symbol;
  state.cpuSymbol = symbol === 'X' ? 'O' : 'X';
  state.symbolSelected = true;

  // Hide selection, show board
  document.getElementById('symbol-selection').classList.add('hidden');
  document.getElementById('game-board').classList.remove('hidden');

  // Start game
  startGame();
}

// Event listeners
document.getElementById('choose-x').addEventListener('click', () => {
  handleSymbolSelection('X');
});

document.getElementById('choose-o').addEventListener('click', () => {
  handleSymbolSelection('O');
});
```

### 6.2 Cell Click Event

**Handle Player Move:**
```javascript
/**
 * Handle cell click
 * @param {number} index - Cell index
 */
function handleCellClick(index) {
  // Validation checks
  if (state.gameOver) return;                          // Game ended
  if (state.board[index] !== '') return;               // Cell occupied
  if (state.currentPlayer !== state.playerSymbol) return;  // Not player's turn
  if (state.cpuThinking) return;                      // CPU is thinking

  // Place player's mark
  placeMark(index, state.playerSymbol);
  state.currentPlayer = state.cpuSymbol;
  updateMessage('CPU is thinking...');

  // Check win/draw
  const winResult = checkWin();
  if (winResult.winner) {
    handleGameEnd(winResult);
    return;
  }

  if (checkDraw()) {
    handleGameEnd({ winner: 'draw', line: null });
    return;
  }

  // CPU's turn
  setTimeout(() => {
    cpuTurn();
  }, getRandomDelay());
}
```

### 6.3 CPU Turn

**CPU Move Execution:**
```javascript
/**
 * Execute CPU turn
 */
async function cpuTurn() {
  state.cpuThinking = true;

  // Get CPU move
  const cpuMove = getCPUMove();

  // Place CPU's mark (after delay)
  placeMark(cpuMove, state.cpuSymbol);
  state.currentPlayer = state.playerSymbol;
  state.cpuThinking = false;
  updateMessage('Your Turn');

  // Check win/draw
  const winResult = checkWin();
  if (winResult.winner) {
    handleGameEnd(winResult);
    return;
  }

  if (checkDraw()) {
    handleGameEnd({ winner: 'draw', line: null });
    return;
  }
}

/**
 * Get random delay for CPU move
 * @returns {number} Delay in ms (500-1000)
 */
function getRandomDelay() {
  return 500 + Math.random() * 500;  // 0.5-1 second
}
```

---

## 7. Game Flow Implementation ✅

### 7.1 Initialization

**Setup:**
```javascript
/**
 * Initialize Tic-Tac-Toe game
 */
async function init() {
  // 1. Load statistics from LocalStorage
  state.totalStats = gameDataService.loadTicTacToeStats();

  // 2. Cache DOM elements
  state.cells = Array.from(document.querySelectorAll('.cell'));
  state.statsDisplay = {
    wins: document.getElementById('wins'),
    losses: document.getElementById('losses'),
    draws: document.getElementById('draws')
  };
  state.messageDisplay = document.getElementById('turn-message');

  // 3. Update stats display
  updateStatsDisplay();

  // 4. Setup event listeners
  setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Cell clicks
  state.cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
  });

  // New game button
  document.getElementById('new-game-btn').addEventListener('click', () => {
    resetGame();
  });

  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = '/index.html';
  });
}
```

### 7.2 Game Start

**Start New Game:**
```javascript
/**
 * Start game (after symbol selection)
 */
function startGame() {
  // Reset board
  state.board = ['', '', '', '', '', '', '', '', ''];
  state.currentPlayer = 'X';
  state.gameOver = false;
  state.winner = null;
  state.winningLine = [];

  // Clear cells
  state.cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('filled', 'x', 'o', 'winning');
  });

  // If CPU goes first
  if (state.cpuSymbol === 'X') {
    updateMessage('CPU is thinking...');
    setTimeout(() => {
      cpuTurn();
    }, 500);
  } else {
    updateMessage('Your Turn');
  }
}
```

### 7.3 Game End

**Handle Game End:**
```javascript
/**
 * Handle game end
 * @param {object} result - { winner: string, line: Array }
 */
function handleGameEnd(result) {
  state.gameOver = true;
  state.winner = result.winner;
  state.winningLine = result.line;

  // Highlight winning line
  if (result.line) {
    highlightWinningLine(result.line);
  }

  // Update statistics
  if (result.winner === state.playerSymbol) {
    // Player wins
    state.sessionStats.wins++;
    state.totalStats.wins++;
    gameDataService.saveTicTacToeResult('win');
    updateMessage('🎉 You Win!');
  } else if (result.winner === state.cpuSymbol) {
    // CPU wins
    state.sessionStats.losses++;
    state.totalStats.losses++;
    gameDataService.saveTicTacToeResult('loss');
    updateMessage('CPU Wins');
  } else {
    // Draw
    state.sessionStats.draws++;
    state.totalStats.draws++;
    gameDataService.saveTicTacToeResult('draw');
    updateMessage("It's a Draw");
  }

  updateStatsDisplay();

  // Show result modal (optional)
  setTimeout(() => {
    showResultModal(result);
  }, 1000);
}
```

### 7.4 Helper Functions

**Update Functions:**
```javascript
/**
 * Update message display
 * @param {string} message - Message to display
 */
function updateMessage(message) {
  if (state.messageDisplay) {
    state.messageDisplay.textContent = message;
  }
}

/**
 * Update statistics display
 */
function updateStatsDisplay() {
  state.statsDisplay.wins.textContent = state.totalStats.wins;
  state.statsDisplay.losses.textContent = state.totalStats.losses;
  state.statsDisplay.draws.textContent = state.totalStats.draws;
}

/**
 * Reset game (back to symbol selection)
 */
function resetGame() {
  // Hide board, show symbol selection
  document.getElementById('game-board').classList.add('hidden');
  document.getElementById('symbol-selection').classList.remove('hidden');

  // Reset state
  state.symbolSelected = false;
}
```

---

## 8. Result Modal ✅

### 8.1 Modal Structure

**HTML:**
```html
<div id="result-modal" class="modal hidden">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <h2 class="modal-title" id="result-title">Game Over</h2>

    <div class="result-message" id="result-message">
      <!-- Dynamic message based on win/loss/draw -->
    </div>

    <div class="result-stats">
      <h3>Session Statistics</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Wins:</span>
          <span class="stat-value" id="modal-wins">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Losses:</span>
          <span class="stat-value" id="modal-losses">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Draws:</span>
          <span class="stat-value" id="modal-draws">0</span>
        </div>
      </div>
    </div>

    <div class="modal-buttons">
      <button id="play-again-modal-btn" class="btn-primary">Play Again</button>
      <button id="modal-back-btn" class="btn-secondary">Back to Home</button>
    </div>

    <!-- Optional: Post-game ad space -->
    <div class="ad-container">
      <!-- Ad placement -->
    </div>
  </div>
</div>
```

**CSS Styling:**
```css
.result-message {
  font-size: 24px;
  font-weight: 700;
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.result-message.win {
  background: #d4edda;
  color: #155724;
}

.result-message.loss {
  background: #f8d7da;
  color: #721c24;
}

.result-message.draw {
  background: #fff3cd;
  color: #856404;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
  margin-top: 4px;
}
```

### 8.2 Modal Functions

**Show Result Modal:**
```javascript
/**
 * Show result modal
 * @param {object} result - Game result data { winner: string, line: Array }
 */
function showResultModal(result) {
  const modal = document.getElementById('result-modal');
  const titleElement = document.getElementById('result-title');
  const messageElement = document.getElementById('result-message');

  // Set title and message based on result
  if (result.winner === state.playerSymbol) {
    // Player wins
    titleElement.textContent = '🎉 Victory! 🎉';
    messageElement.textContent = 'Congratulations! You Win!';
    messageElement.className = 'result-message win';
  } else if (result.winner === state.cpuSymbol) {
    // CPU wins
    titleElement.textContent = '😔 Defeat 😔';
    messageElement.textContent = 'CPU Wins. Better luck next time!';
    messageElement.className = 'result-message loss';
  } else {
    // Draw
    titleElement.textContent = '🤝 Draw 🤝';
    messageElement.textContent = "It's a Tie! Well played!";
    messageElement.className = 'result-message draw';
  }

  // Update statistics display
  document.getElementById('modal-wins').textContent = state.totalStats.wins;
  document.getElementById('modal-losses').textContent = state.totalStats.losses;
  document.getElementById('modal-draws').textContent = state.totalStats.draws;

  // Setup button listeners (use once to avoid duplicates)
  const playAgainBtn = document.getElementById('play-again-modal-btn');
  const backBtn = document.getElementById('modal-back-btn');

  // Remove existing listeners (clone and replace)
  const newPlayAgainBtn = playAgainBtn.cloneNode(true);
  const newBackBtn = backBtn.cloneNode(true);
  playAgainBtn.parentNode.replaceChild(newPlayAgainBtn, playAgainBtn);
  backBtn.parentNode.replaceChild(newBackBtn, backBtn);

  // Add new listeners
  newPlayAgainBtn.addEventListener('click', () => {
    hideResultModal();
    resetGame();
  });

  newBackBtn.addEventListener('click', () => {
    window.location.href = '/index.html';
  });

  // Show modal
  modal.classList.remove('hidden');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Hide result modal
 */
function hideResultModal() {
  const modal = document.getElementById('result-modal');
  modal.classList.add('hidden');

  // Restore body scroll
  document.body.style.overflow = '';
}
```

### 8.3 Modal Display Timing

**Call from handleGameEnd:**
```javascript
function handleGameEnd(result) {
  state.gameOver = true;
  state.winner = result.winner;
  state.winningLine = result.line;

  // Highlight winning line
  if (result.line) {
    highlightWinningLine(result.line);
  }

  // Update statistics
  if (result.winner === state.playerSymbol) {
    state.sessionStats.wins++;
    state.totalStats.wins++;
    gameDataService.saveTicTacToeResult('win');
    updateMessage('🎉 You Win!');
  } else if (result.winner === state.cpuSymbol) {
    state.sessionStats.losses++;
    state.totalStats.losses++;
    gameDataService.saveTicTacToeResult('loss');
    updateMessage('CPU Wins');
  } else {
    state.sessionStats.draws++;
    state.totalStats.draws++;
    gameDataService.saveTicTacToeResult('draw');
    updateMessage("It's a Draw");
  }

  updateStatsDisplay();

  // Show result modal after brief delay
  setTimeout(() => {
    showResultModal(result);
  }, 1000);  // 1 second delay to show winning line
}
```

---

## 9. Testing Checklist ✅

### 9.1 Functional Tests

**Manual Testing:**
- [ ] Symbol selection works (X and O buttons)
- [ ] Player can place mark on empty cell
- [ ] Cannot place mark on occupied cell
- [ ] Cannot click during CPU turn
- [ ] CPU makes move after 0.5-1 second delay
- [ ] Horizontal win detected correctly
- [ ] Vertical win detected correctly
- [ ] Diagonal win detected correctly
- [ ] Draw detected when board full
- [ ] Winning line highlights correctly
- [ ] Statistics update correctly
- [ ] Statistics persist across page reload
- [ ] "New Game" returns to symbol selection
- [ ] Player can play first (X) or second (O)
- [ ] Result modal appears after game end
- [ ] Modal shows correct result message (win/loss/draw)
- [ ] Modal displays current statistics
- [ ] "Play Again" button resets game to symbol selection
- [ ] "Back to Home" button navigates correctly

### 9.2 AI Behavior Tests

**CPU AI Testing:**
- [ ] CPU attempts to win when possible
- [ ] CPU blocks player win when possible
- [ ] CPU occasionally misses obvious moves (medium difficulty)
- [ ] CPU prefers center cell
- [ ] CPU takes corners when strategic
- [ ] CPU never makes illegal move
- [ ] Player can win against CPU (not unbeatable)

### 9.3 Edge Cases

**Edge Case Testing:**
- [ ] Rapid clicking (should prevent multiple marks)
- [ ] Click during CPU thinking (should ignore)
- [ ] LocalStorage disabled (should handle gracefully)
- [ ] First game with no stats (should show 0)
- [ ] All 8 winning combinations work

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed
  - Game Specifications: Summary from requirements
  - State Management: Complete state object and transitions
  - Win Detection: All 8 winning lines, algorithms
  - CPU AI: Medium difficulty strategy with error rates
  - UI Implementation: HTML structure, CSS styling
  - Event Handling: Symbol selection, cell clicks, CPU turn
  - Game Flow: Initialization, start, end, reset
  - Testing: Comprehensive test checklist including AI behavior
- 2026-02-22: Added Result Modal section (Section 8)
  - Modal HTML structure with win/loss/draw messages
  - Modal functions: showResultModal(), hideResultModal()
  - Statistics display in modal
  - Button event handlers
  - Modal display timing
  - Updated Testing Checklist with modal tests
