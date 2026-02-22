# Memory Game - Detailed Design Document

## Overview
This document provides detailed design specifications for the Memory Game implementation, including algorithms, state management, UI interactions, and event handling.

---

## 1. Game Specifications Summary ✅

**From Requirements (docs/games/memory-game.md):**
- 16 cards (8 pairs)
- 2×8 grid layout (horizontal)
- Numbers 1-8 as card values
- Move-based scoring (lower is better)
- No time limit
- LocalStorage high score tracking

**Key Features:**
- Card flip animation (CSS)
- Auto flip-back after 1 second for mismatches
- Match detection
- Move counter
- High score comparison

---

## 2. State Management ✅

### 2.1 Game State Object

**Complete State Definition:**
```javascript
const state = {
  // Card data
  cards: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8],  // Shuffled array

  // Card states (parallel arrays)
  flippedIndices: [],       // Array<number>: Currently flipped card indices (max 2)
  matchedIndices: [],       // Array<number>: All matched card indices

  // Game progress
  moves: 0,                 // Number of move pairs made

  // Game control
  isLocked: false,          // Boolean: Prevent clicks during flip-back animation
  gameStarted: false,       // Boolean: Has game started?
  gameComplete: false,      // Boolean: All pairs matched?

  // High score
  highScore: null,          // Number|null: Best score from LocalStorage

  // DOM references (cached)
  cardElements: [],         // Array<HTMLElement>: Card DOM elements
  movesDisplay: null,       // HTMLElement: Moves counter display
  highScoreDisplay: null    // HTMLElement: High score display
};
```

### 2.2 State Transitions

**State Transition Diagram:**
```
┌──────────────┐
│  INITIAL     │ gameStarted: false
│              │ moves: 0
└──────┬───────┘
       │ User clicks "Start" or first card
       ↓
┌──────────────┐
│  ACTIVE      │ gameStarted: true
│              │ isLocked: false
└──────┬───────┘
       │ User clicks card
       ↓
┌──────────────┐
│  FIRST_FLIP  │ flippedIndices: [index]
│              │ Card face-up
└──────┬───────┘
       │ User clicks second card
       ↓
┌──────────────┐
│  SECOND_FLIP │ flippedIndices: [index1, index2]
│              │ Both cards face-up
│              │ moves++
└──────┬───────┘
       │
       ├─ Match? ──→ YES ──→ ┌──────────────┐
       │                     │  MATCH       │ matchedIndices updated
       │                     │              │ flippedIndices cleared
       │                     └──────┬───────┘
       │                            │
       │                            ├─ All matched? ──→ YES ──→ COMPLETE
       │                            └─ All matched? ──→ NO ──→ ACTIVE
       │
       └─ Match? ──→ NO ──→ ┌──────────────┐
                            │  MISMATCH    │ isLocked: true
                            │              │ Wait 1 second
                            └──────┬───────┘
                                   │ After 1s
                                   ↓
                            ┌──────────────┐
                            │  FLIP_BACK   │ Cards flip face-down
                            │              │ flippedIndices cleared
                            │              │ isLocked: false
                            └──────┬───────┘
                                   │
                                   ↓ ACTIVE

┌──────────────┐
│  COMPLETE    │ gameComplete: true
│              │ All 8 pairs matched
│              │ Show result modal
└──────────────┘
```

---

## 3. Core Algorithms ✅

### 3.1 Fisher-Yates Shuffle

**Purpose:** Randomize card positions at game start

**Algorithm:**
```javascript
/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle (will be modified in place)
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];  // Swap
  }
  return array;
}

// Usage
const cards = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8];
shuffleArray(cards);
```

**Time Complexity:** O(n)
**Space Complexity:** O(1)

**Why Fisher-Yates?**
- Unbiased: Each permutation equally likely
- Efficient: Single pass, in-place
- Simple: Easy to implement and understand

### 3.2 Match Detection

**Purpose:** Check if two flipped cards have the same value

**Algorithm:**
```javascript
/**
 * Check if two cards match
 * @param {number} index1 - First card index
 * @param {number} index2 - Second card index
 * @returns {boolean} True if cards match
 */
function checkMatch(index1, index2) {
  return state.cards[index1] === state.cards[index2];
}

// Usage in game flow
if (state.flippedIndices.length === 2) {
  const [index1, index2] = state.flippedIndices;
  const isMatch = checkMatch(index1, index2);

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}
```

**Time Complexity:** O(1)

### 3.3 Game Completion Check

**Purpose:** Determine if all pairs have been matched

**Algorithm:**
```javascript
/**
 * Check if game is complete
 * @returns {boolean} True if all 8 pairs matched
 */
function isGameComplete() {
  return state.matchedIndices.length === 16;  // 8 pairs × 2 cards
}

// Alternative: Check if matched count equals total cards
function isGameComplete() {
  return state.matchedIndices.length === state.cards.length;
}
```

**Time Complexity:** O(1)

---

## 4. UI Implementation ✅

### 4.1 HTML Structure

**Grid Layout:**
```html
<div class="memory-game">
  <div class="game-header">
    <h2>Memory Game</h2>
    <div class="game-stats">
      <div class="moves-counter">
        <span>Moves:</span>
        <span id="moves-value">0</span>
      </div>
      <div class="high-score">
        <span>Best:</span>
        <span id="high-score-value">--</span>
      </div>
    </div>
  </div>

  <div class="cards-grid" id="cards-grid">
    <!-- Cards generated dynamically -->
  </div>

  <div class="game-controls">
    <button id="reset-btn" class="btn-secondary">New Game</button>
    <button id="back-btn" class="btn-secondary">Back to Home</button>
  </div>
</div>

<!-- Result Modal (hidden by default) -->
<div id="result-modal" class="modal hidden">
  <!-- Modal content -->
</div>
```

**CSS Grid Layout:**
```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);  /* 8 columns */
  grid-template-rows: repeat(2, 1fr);     /* 2 rows */
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
```

### 4.2 Card Element Structure

**Single Card HTML:**
```html
<div class="card" data-index="0" data-value="1">
  <div class="card-inner">
    <div class="card-front">
      <span class="card-value">1</span>
    </div>
    <div class="card-back">
      <span class="card-question">?</span>
    </div>
  </div>
</div>
```

**Card States (CSS Classes):**
```css
/* Default: Face-down */
.card .card-inner {
  transform: rotateY(0deg);
  transition: transform 0.3s ease;
}

/* Flipped: Face-up */
.card.flipped .card-inner {
  transform: rotateY(180deg);
}

/* Matched: Disabled, dimmed */
.card.matched {
  opacity: 0.6;
  pointer-events: none;
}

/* Locked: Prevent clicks */
.card.locked {
  pointer-events: none;
}
```

### 4.3 Dynamic Card Generation

**JavaScript Implementation:**
```javascript
/**
 * Generate and render all card elements
 */
function renderCards() {
  const gridContainer = document.getElementById('cards-grid');
  gridContainer.innerHTML = '';  // Clear existing
  state.cardElements = [];       // Reset cache

  state.cards.forEach((value, index) => {
    const card = createCardElement(value, index);
    gridContainer.appendChild(card);
    state.cardElements.push(card);
  });
}

/**
 * Create single card element
 * @param {number} value - Card value (1-8)
 * @param {number} index - Card index in array
 * @returns {HTMLElement} Card element
 */
function createCardElement(value, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.index = index;
  card.dataset.value = value;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <span class="card-value">${value}</span>
      </div>
      <div class="card-back">
        <span class="card-question">?</span>
      </div>
    </div>
  `;

  // Attach event listener
  card.addEventListener('click', () => handleCardClick(index));

  return card;
}
```

---

## 5. Event Handling ✅

### 5.1 Card Click Event

**Event Flow:**
```javascript
/**
 * Handle card click event
 * @param {number} index - Clicked card index
 */
function handleCardClick(index) {
  // 1. Validation checks
  if (state.isLocked) return;                       // Game locked (animation)
  if (state.flippedIndices.includes(index)) return; // Already flipped
  if (state.matchedIndices.includes(index)) return; // Already matched

  // 2. Start game on first click
  if (!state.gameStarted) {
    state.gameStarted = true;
  }

  // 3. Flip card
  flipCard(index);
  state.flippedIndices.push(index);

  // 4. Check if two cards flipped
  if (state.flippedIndices.length === 2) {
    // Increment move counter
    state.moves++;
    updateMovesDisplay();

    // Check for match
    const [index1, index2] = state.flippedIndices;
    const isMatch = state.cards[index1] === state.cards[index2];

    if (isMatch) {
      handleMatch();
    } else {
      handleMismatch();
    }
  }
}
```

### 5.2 Match Handling

**Match Flow:**
```javascript
/**
 * Handle successful match
 */
function handleMatch() {
  const [index1, index2] = state.flippedIndices;

  // 1. Add to matched indices
  state.matchedIndices.push(index1, index2);

  // 2. Apply matched CSS class
  state.cardElements[index1].classList.add('matched');
  state.cardElements[index2].classList.add('matched');

  // 3. Clear flipped indices
  state.flippedIndices = [];

  // 4. Check game completion
  if (isGameComplete()) {
    setTimeout(() => handleGameComplete(), 500);  // Delay for effect
  }
}
```

### 5.3 Mismatch Handling

**Mismatch Flow:**
```javascript
/**
 * Handle mismatch (cards don't match)
 */
function handleMismatch() {
  const [index1, index2] = state.flippedIndices;

  // 1. Lock game to prevent clicks
  state.isLocked = true;

  // 2. Wait 1 second, then flip back
  setTimeout(() => {
    // Flip both cards back
    unflipCard(index1);
    unflipCard(index2);

    // Clear flipped indices
    state.flippedIndices = [];

    // Unlock game
    state.isLocked = false;
  }, 1000);  // 1 second delay
}
```

### 5.4 Game Complete Handling

**Completion Flow:**
```javascript
/**
 * Handle game completion
 */
function handleGameComplete() {
  state.gameComplete = true;

  // 1. Check if new high score
  const isNewRecord = checkAndSaveHighScore();

  // 2. Show result modal
  showResultModal({
    moves: state.moves,
    highScore: state.highScore,
    isNewRecord: isNewRecord
  });
}

/**
 * Check and save high score
 * @returns {boolean} True if new record
 */
function checkAndSaveHighScore() {
  // Lower is better for Memory Game
  if (state.highScore === null || state.moves < state.highScore) {
    state.highScore = state.moves;
    gameDataService.saveMemoryGameScore(state.moves);
    updateHighScoreDisplay();
    return true;
  }
  return false;
}
```

---

## 6. Game Flow Implementation ✅

### 6.1 Initialization Sequence

**Startup Flow:**
```javascript
/**
 * Initialize Memory Game
 */
async function init() {
  // 1. Load high score from storage
  state.highScore = gameDataService.loadMemoryGameHighScore();

  // 2. Cache DOM elements
  state.movesDisplay = document.getElementById('moves-value');
  state.highScoreDisplay = document.getElementById('high-score-value');

  // 3. Update displays
  updateMovesDisplay();
  updateHighScoreDisplay();

  // 4. Setup event listeners
  setupEventListeners();

  // 5. Start new game
  startNewGame();
}

/**
 * Start new game
 */
function startNewGame() {
  // 1. Reset state
  state.cards = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8];
  shuffleArray(state.cards);
  state.flippedIndices = [];
  state.matchedIndices = [];
  state.moves = 0;
  state.isLocked = false;
  state.gameStarted = false;
  state.gameComplete = false;

  // 2. Update display
  updateMovesDisplay();

  // 3. Render cards
  renderCards();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    startNewGame();
  });

  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = '/index.html';
  });
}
```

### 6.2 Update Functions

**Display Updates:**
```javascript
/**
 * Update moves display
 */
function updateMovesDisplay() {
  if (state.movesDisplay) {
    state.movesDisplay.textContent = state.moves;
  }
}

/**
 * Update high score display
 */
function updateHighScoreDisplay() {
  if (state.highScoreDisplay) {
    state.highScoreDisplay.textContent =
      state.highScore !== null ? state.highScore : '--';
  }
}
```

### 6.3 Card Flip Functions

**Flip Animation:**
```javascript
/**
 * Flip card face-up
 * @param {number} index - Card index
 */
function flipCard(index) {
  const card = state.cardElements[index];
  if (card) {
    card.classList.add('flipped');
  }
}

/**
 * Flip card face-down
 * @param {number} index - Card index
 */
function unflipCard(index) {
  const card = state.cardElements[index];
  if (card) {
    card.classList.remove('flipped');
  }
}
```

---

## 7. Result Modal ✅

### 7.1 Modal Structure

**HTML:**
```html
<div id="result-modal" class="modal hidden">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <h2 class="modal-title">🎉 Game Complete! 🎉</h2>

    <div class="result-stats">
      <div class="stat-item">
        <span class="stat-label">Your Moves:</span>
        <span class="stat-value" id="final-moves">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Best Score:</span>
        <span class="stat-value" id="final-best">0</span>
      </div>
    </div>

    <div id="new-record-badge" class="new-record hidden">
      ⭐ NEW RECORD! ⭐
    </div>

    <div class="modal-buttons">
      <button id="play-again-btn" class="btn-primary">Play Again</button>
      <button id="modal-back-btn" class="btn-secondary">Back to Home</button>
    </div>

    <!-- Optional: Post-game ad space -->
    <div class="ad-container">
      <!-- Ad placement -->
    </div>
  </div>
</div>
```

### 7.2 Modal Functions

**Show/Hide Modal:**
```javascript
/**
 * Show result modal
 * @param {object} result - Game result data
 */
function showResultModal(result) {
  const modal = document.getElementById('result-modal');

  // Update content
  document.getElementById('final-moves').textContent = result.moves;
  document.getElementById('final-best').textContent =
    result.highScore !== null ? result.highScore : result.moves;

  // Show new record badge if applicable
  const badge = document.getElementById('new-record-badge');
  if (result.isNewRecord) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  // Setup button listeners
  document.getElementById('play-again-btn').addEventListener('click', () => {
    hideResultModal();
    startNewGame();
  });

  document.getElementById('modal-back-btn').addEventListener('click', () => {
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

---

## 8. Performance Optimizations ✅

### 8.1 DOM Caching

**Avoid Repeated DOM Queries:**
```javascript
// ❌ Bad: Query every time
function updateMoves() {
  document.getElementById('moves-value').textContent = state.moves;
}

// ✅ Good: Cache on init
const movesElement = document.getElementById('moves-value');
function updateMoves() {
  movesElement.textContent = state.moves;
}
```

### 8.2 Event Delegation (Alternative)

**Use Event Delegation for Cards:**
```javascript
// Instead of attaching listener to each card
document.getElementById('cards-grid').addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  if (card) {
    const index = parseInt(card.dataset.index, 10);
    handleCardClick(index);
  }
});
```

### 8.3 Animation Performance

**Use CSS Transforms (GPU-accelerated):**
```css
/* GPU-accelerated flip */
.card-inner {
  transform: rotateY(0deg);
  transform-style: preserve-3d;
  will-change: transform;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}
```

---

## 9. Testing Checklist ✅

### 9.1 Functional Tests

**Manual Testing:**
- [ ] Cards shuffle randomly on each new game
- [ ] First card click flips card face-up
- [ ] Second card click flips second card
- [ ] Matching cards stay face-up
- [ ] Non-matching cards flip back after 1 second
- [ ] Move counter increments correctly
- [ ] Cannot click during flip-back animation
- [ ] Cannot click already flipped cards
- [ ] Cannot click already matched cards
- [ ] Game completes when all pairs matched
- [ ] Result modal appears on completion
- [ ] High score saves correctly
- [ ] New record badge shows when appropriate
- [ ] "Play Again" resets game
- [ ] "Back to Home" navigates correctly

### 9.2 Edge Cases

**Edge Case Testing:**
- [ ] Click same card twice (should ignore)
- [ ] Rapid clicking during animation (should lock)
- [ ] Game completion with perfect score (8 moves)
- [ ] LocalStorage disabled (should handle gracefully)
- [ ] LocalStorage full (should handle error)
- [ ] No high score exists (should show "--")

### 9.3 Performance Tests

**Performance Checks:**
- [ ] Flip animation smooth (60fps)
- [ ] No lag when clicking cards
- [ ] Modal appears instantly
- [ ] Page load time < 1 second

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed
  - Game Specifications: Summary from requirements
  - State Management: Complete state object and transitions
  - Core Algorithms: Fisher-Yates shuffle, match detection, completion check
  - UI Implementation: HTML structure, CSS grid, dynamic generation
  - Event Handling: Click events, match/mismatch handling
  - Game Flow: Initialization, updates, reset logic
  - Result Modal: Structure and functions
  - Performance: Optimizations and best practices
  - Testing: Comprehensive test checklist
