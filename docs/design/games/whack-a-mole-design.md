# Whack-a-Mole - Detailed Design Document

## Overview
This document provides detailed design specifications for the Whack-a-Mole game implementation, including timer management, mole spawning algorithm, scoring system, and event handling.

---

## 1. Game Specifications Summary ✅

**From Requirements (docs/games/whack-a-mole.md):**
- 9 holes (3×3 grid)
- 30-second time limit
- Random mole spawning (0.5-1.5s intervals)
- 1-second mole visibility
- Simple +1 scoring
- No penalty for misclicks
- High score tracking

**Key Features:**
- Countdown timer with visual warnings
- Random mole appearance pattern
- Real-time score display
- High score persistence (LocalStorage)
- Responsive click detection

---

## 2. State Management ✅

### 2.1 Game State Object

**Complete State Definition:**
```javascript
const state = {
  // Hole states
  holes: [false, false, false, false, false, false, false, false, false],  // Boolean: mole visible?

  // Game progress
  score: 0,                  // Number: Current score (moles hit)
  timeRemaining: 30,         // Number: Seconds left

  // Game control
  gameActive: false,         // Boolean: Game running?
  gameStarted: false,        // Boolean: Has game started?

  // Timers (cleanup references)
  timerInterval: null,       // Number|null: setInterval ID for countdown
  moleTimeouts: {},          // Object: { index: timeoutID } for mole auto-hide
  spawnTimeout: null,        // Number|null: setTimeout ID for next spawn

  // High score
  highScore: 0,              // Number: Best score from LocalStorage

  // Spawn configuration
  spawnConfig: {
    minDelay: 500,           // Minimum spawn interval (ms)
    maxDelay: 1500,          // Maximum spawn interval (ms)
    moleVisibility: 1000     // Mole visible duration (ms)
  },

  // DOM references (cached)
  holeElements: [],          // Array<HTMLElement>: Hole elements
  scoreDisplay: null,        // HTMLElement: Score display
  timerDisplay: null,        // HTMLElement: Timer display
  highScoreDisplay: null     // HTMLElement: High score display
};
```

### 2.2 State Transitions

**State Transition Diagram:**
```
┌──────────────┐
│  INITIAL     │ gameStarted: false
│              │ gameActive: false
│              │ score: 0
│              │ timeRemaining: 30
└──────┬───────┘
       │ User clicks "Start Game"
       ↓
┌──────────────┐
│  GAME_START  │ gameStarted: true
│              │ gameActive: true
│              │ Start countdown timer
│              │ Start mole spawning
└──────┬───────┘
       │
       ↓ Loop: Spawn mole every 0.5-1.5s
       │
┌──────────────┐
│  MOLE_SPAWN  │ holes[index] = true
│              │ Show mole at random hole
│              │ Set auto-hide timeout (1s)
└──────┬───────┘
       │
       ├─ User clicks mole → MOLE_HIT
       └─ 1 second passes → MOLE_HIDE

┌──────────────┐
│  MOLE_HIT    │ score++
│              │ holes[index] = false
│              │ Hide mole immediately
│              │ Update score display
└──────┬───────┘
       │
       └─ Continue spawning

┌──────────────┐
│  MOLE_HIDE   │ holes[index] = false
│              │ Hide mole (auto)
│              │ No score change
└──────┬───────┘
       │
       └─ Continue spawning

┌──────────────┐
│  TIMER_TICK  │ timeRemaining--
│              │ Update timer display
│              │ Check for warnings
└──────┬───────┘
       │
       ├─ timeRemaining === 0 → GAME_OVER
       └─ timeRemaining > 0 → Continue

┌──────────────┐
│  GAME_OVER   │ gameActive: false
│              │ Stop timer
│              │ Stop spawning
│              │ Hide all moles
│              │ Check & save high score
│              │ Show result modal
└──────────────┘
```

---

## 3. Timer Management ✅

### 3.1 Countdown Timer Implementation

**Start Timer:**
```javascript
/**
 * Start countdown timer
 */
function startTimer() {
  state.timeRemaining = 30;
  updateTimerDisplay();

  // Update every second
  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerDisplay();

    // Apply warning styles
    if (state.timeRemaining <= 10) {
      applyTimerWarning();
    }

    // Game over when time reaches 0
    if (state.timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

/**
 * Stop timer
 */
function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}
```

### 3.2 Timer Display Updates

**Update Timer:**
```javascript
/**
 * Update timer display
 */
function updateTimerDisplay() {
  if (state.timerDisplay) {
    state.timerDisplay.textContent = `${state.timeRemaining}s`;

    // Remove warning class if time > 10
    if (state.timeRemaining > 10) {
      state.timerDisplay.classList.remove('warning', 'critical');
    }
    // Warning: 6-10 seconds (orange)
    else if (state.timeRemaining > 5) {
      state.timerDisplay.classList.remove('critical');
      state.timerDisplay.classList.add('warning');
    }
    // Critical: 1-5 seconds (red)
    else {
      state.timerDisplay.classList.remove('warning');
      state.timerDisplay.classList.add('critical');
    }
  }
}

/**
 * Apply timer warning styles
 */
function applyTimerWarning() {
  if (state.timerDisplay) {
    if (state.timeRemaining <= 5) {
      state.timerDisplay.classList.add('critical');
      state.timerDisplay.classList.remove('warning');
    } else if (state.timeRemaining <= 10) {
      state.timerDisplay.classList.add('warning');
      state.timerDisplay.classList.remove('critical');
    }
  }
}
```

**CSS Styling:**
```css
.timer {
  font-size: 24px;
  font-weight: 700;
  color: #27ae60;  /* Green: normal */
  transition: color 0.3s ease;
}

.timer.warning {
  color: #f39c12;  /* Orange: warning */
}

.timer.critical {
  color: #e74c3c;  /* Red: critical */
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## 4. Mole Spawning Algorithm ✅

### 4.1 Spawn Logic

**Continuous Spawning:**
```javascript
/**
 * Start mole spawning loop
 */
function startMoleSpawning() {
  if (!state.gameActive) return;

  // Spawn one mole
  spawnMole();

  // Schedule next spawn (random interval)
  const nextDelay = getRandomSpawnDelay();
  state.spawnTimeout = setTimeout(() => {
    startMoleSpawning();  // Recursive call
  }, nextDelay);
}

/**
 * Spawn single mole at random hole
 */
function spawnMole() {
  if (!state.gameActive) return;

  // Get random available hole
  const availableHoles = state.holes
    .map((visible, index) => (visible ? null : index))
    .filter(index => index !== null);

  if (availableHoles.length === 0) return;  // All holes occupied

  const randomIndex = availableHoles[
    Math.floor(Math.random() * availableHoles.length)
  ];

  // Show mole
  showMole(randomIndex);

  // Auto-hide after 1 second
  const hideTimeout = setTimeout(() => {
    hideMole(randomIndex);
  }, state.spawnConfig.moleVisibility);

  // Store timeout reference for cleanup
  state.moleTimeouts[randomIndex] = hideTimeout;
}

/**
 * Get random spawn delay
 * @returns {number} Delay in ms (500-1500)
 */
function getRandomSpawnDelay() {
  const { minDelay, maxDelay } = state.spawnConfig;
  return minDelay + Math.random() * (maxDelay - minDelay);
}
```

### 4.2 Mole Show/Hide

**Show Mole:**
```javascript
/**
 * Show mole at specific hole
 * @param {number} index - Hole index (0-8)
 */
function showMole(index) {
  if (index < 0 || index >= 9) return;

  // Update state
  state.holes[index] = true;

  // Update UI
  const hole = state.holeElements[index];
  if (hole) {
    hole.classList.add('active');
  }
}
```

**Hide Mole:**
```javascript
/**
 * Hide mole at specific hole
 * @param {number} index - Hole index
 */
function hideMole(index) {
  if (index < 0 || index >= 9) return;

  // Update state
  state.holes[index] = false;

  // Update UI
  const hole = state.holeElements[index];
  if (hole) {
    hole.classList.remove('active');
  }

  // Clear timeout reference
  if (state.moleTimeouts[index]) {
    delete state.moleTimeouts[index];
  }
}
```

### 4.3 Cleanup on Game End

**Stop All Spawning:**
```javascript
/**
 * Stop mole spawning and clear all timeouts
 */
function stopMoleSpawning() {
  // Clear spawn timeout
  if (state.spawnTimeout) {
    clearTimeout(state.spawnTimeout);
    state.spawnTimeout = null;
  }

  // Clear all mole hide timeouts
  Object.values(state.moleTimeouts).forEach(timeoutId => {
    clearTimeout(timeoutId);
  });
  state.moleTimeouts = {};

  // Hide all moles
  state.holes.forEach((_, index) => {
    if (state.holes[index]) {
      hideMole(index);
    }
  });
}
```

---

## 5. Scoring System ✅

### 5.1 Score Tracking

**Increment Score:**
```javascript
/**
 * Increment score when mole is hit
 */
function incrementScore() {
  state.score++;
  updateScoreDisplay();
}

/**
 * Update score display
 */
function updateScoreDisplay() {
  if (state.scoreDisplay) {
    state.scoreDisplay.textContent = state.score;
  }
}

/**
 * Reset score
 */
function resetScore() {
  state.score = 0;
  updateScoreDisplay();
}
```

### 5.2 High Score Management

**Check and Save High Score:**
```javascript
/**
 * Check if new high score and save
 * @returns {boolean} True if new record
 */
function checkAndSaveHighScore() {
  // Higher is better for Whack-a-Mole
  if (state.score > state.highScore) {
    state.highScore = state.score;
    gameDataService.saveWhackAMoleScore(state.score);
    updateHighScoreDisplay();
    return true;
  }
  return false;
}

/**
 * Update high score display
 */
function updateHighScoreDisplay() {
  if (state.highScoreDisplay) {
    state.highScoreDisplay.textContent =
      state.highScore > 0 ? state.highScore : '--';
  }
}
```

---

## 6. UI Implementation ✅

### 6.1 HTML Structure

**Game Layout:**
```html
<div class="whack-a-mole">
  <div class="game-header">
    <h2>Whack-a-Mole</h2>
    <div class="game-stats">
      <div class="score">
        <span>Score:</span>
        <span id="score-value">0</span>
      </div>
      <div class="timer">
        <span>Time:</span>
        <span id="timer-value">30s</span>
      </div>
      <div class="high-score">
        <span>Best:</span>
        <span id="high-score-value">--</span>
      </div>
    </div>
  </div>

  <div class="holes-grid" id="holes-grid">
    <!-- 9 holes generated dynamically -->
  </div>

  <div class="game-controls">
    <button id="start-btn" class="btn-primary">Start Game</button>
    <button id="back-btn" class="btn-secondary">Back to Home</button>
  </div>
</div>

<!-- Result Modal -->
<div id="result-modal" class="modal hidden">
  <!-- Modal content -->
</div>
```

**CSS Grid Layout:**
```css
.holes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 24px;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.hole {
  aspect-ratio: 1;
  background: #8b4513;  /* Brown */
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 4px 8px rgba(0,0,0,0.3);
  transition: transform 0.1s ease;
}

.hole:active {
  transform: scale(0.95);
}

.mole {
  position: absolute;
  bottom: -100%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 60%;
  background: #6d4c41;
  border-radius: 50%;
  transition: bottom 0.2s ease;
}

.hole.active .mole {
  bottom: 20%;  /* Mole pops up */
}

/* Mole face (optional) */
.mole::before,
.mole::after {
  content: '';
  position: absolute;
  top: 30%;
  width: 8px;
  height: 8px;
  background: black;
  border-radius: 50%;
}

.mole::before {
  left: 30%;
}

.mole::after {
  right: 30%;
}
```

### 6.2 Dynamic Hole Generation

**Create Holes:**
```javascript
/**
 * Generate and render all hole elements
 */
function renderHoles() {
  const gridContainer = document.getElementById('holes-grid');
  gridContainer.innerHTML = '';
  state.holeElements = [];

  for (let i = 0; i < 9; i++) {
    const hole = createHoleElement(i);
    gridContainer.appendChild(hole);
    state.holeElements.push(hole);
  }
}

/**
 * Create single hole element
 * @param {number} index - Hole index
 * @returns {HTMLElement} Hole element
 */
function createHoleElement(index) {
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.dataset.index = index;

  // Add mole element
  const mole = document.createElement('div');
  mole.className = 'mole';
  hole.appendChild(mole);

  // Attach event listener
  hole.addEventListener('click', () => handleHoleClick(index));

  return hole;
}
```

---

## 7. Event Handling ✅

### 7.1 Hole Click Event

**Handle Click:**
```javascript
/**
 * Handle hole click
 * @param {number} index - Hole index
 */
function handleHoleClick(index) {
  // Ignore if game not active
  if (!state.gameActive) return;

  // Check if mole is visible
  if (state.holes[index]) {
    handleMoleHit(index);
  }
  // else: Miss click, no penalty
}

/**
 * Handle mole hit
 * @param {number} index - Hole index
 */
function handleMoleHit(index) {
  // Increment score
  incrementScore();

  // Hide mole immediately
  hideMole(index);

  // Clear auto-hide timeout
  if (state.moleTimeouts[index]) {
    clearTimeout(state.moleTimeouts[index]);
    delete state.moleTimeouts[index];
  }

  // Optional: Visual feedback
  showHitFeedback(index);
}

/**
 * Show visual feedback for hit
 * @param {number} index - Hole index
 */
function showHitFeedback(index) {
  const hole = state.holeElements[index];
  if (hole) {
    hole.classList.add('hit');
    setTimeout(() => {
      hole.classList.remove('hit');
    }, 200);
  }
}
```

**CSS for Hit Feedback:**
```css
.hole.hit {
  animation: hitFlash 0.2s ease;
}

@keyframes hitFlash {
  0%, 100% { background: #8b4513; }
  50% { background: #27ae60; }
}
```

### 7.2 Start Game Event

**Start Button:**
```javascript
/**
 * Handle start game button click
 */
function handleStartGame() {
  // Reset and start
  startNewGame();

  // Disable start button during game
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = 'Game in Progress...';
  }
}

// Event listener
document.getElementById('start-btn').addEventListener('click', handleStartGame);
```

---

## 8. Game Flow Implementation ✅

### 8.1 Initialization

**Setup:**
```javascript
/**
 * Initialize Whack-a-Mole game
 */
async function init() {
  // 1. Load high score from LocalStorage
  state.highScore = gameDataService.loadWhackAMoleHighScore();

  // 2. Cache DOM elements
  state.scoreDisplay = document.getElementById('score-value');
  state.timerDisplay = document.getElementById('timer-value');
  state.highScoreDisplay = document.getElementById('high-score-value');

  // 3. Update displays
  updateScoreDisplay();
  updateTimerDisplay();
  updateHighScoreDisplay();

  // 4. Render holes
  renderHoles();

  // 5. Setup event listeners
  setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Start button
  document.getElementById('start-btn').addEventListener('click', handleStartGame);

  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = '/index.html';
  });
}
```

### 8.2 Start Game

**New Game:**
```javascript
/**
 * Start new game
 */
function startNewGame() {
  // 1. Reset state
  state.score = 0;
  state.timeRemaining = 30;
  state.gameActive = true;
  state.gameStarted = true;
  state.holes = [false, false, false, false, false, false, false, false, false];

  // 2. Update displays
  updateScoreDisplay();
  updateTimerDisplay();

  // 3. Start timer
  startTimer();

  // 4. Start mole spawning
  startMoleSpawning();
}
```

### 8.3 End Game

**Game Over:**
```javascript
/**
 * End game
 */
function endGame() {
  // 1. Stop game
  state.gameActive = false;

  // 2. Stop timer
  stopTimer();

  // 3. Stop spawning
  stopMoleSpawning();

  // 4. Check and save high score
  const isNewRecord = checkAndSaveHighScore();

  // 5. Re-enable start button
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = 'Start Game';
  }

  // 6. Show result modal
  setTimeout(() => {
    showResultModal({
      score: state.score,
      highScore: state.highScore,
      isNewRecord: isNewRecord
    });
  }, 500);
}
```

### 8.4 Cleanup

**Resource Cleanup:**
```javascript
/**
 * Cleanup all timers and timeouts
 */
function cleanup() {
  stopTimer();
  stopMoleSpawning();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
```

---

## 9. Result Modal ✅

### 9.1 Modal Structure

**HTML:**
```html
<div id="result-modal" class="modal hidden">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <h2 class="modal-title">⏰ Time's Up! ⏰</h2>

    <div class="result-stats">
      <div class="stat-item">
        <span class="stat-label">Your Score:</span>
        <span class="stat-value" id="final-score">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">High Score:</span>
        <span class="stat-value" id="final-high-score">0</span>
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

### 9.2 Modal Functions

**Show Modal:**
```javascript
/**
 * Show result modal
 * @param {object} result - Game result data
 */
function showResultModal(result) {
  const modal = document.getElementById('result-modal');

  // Update content
  document.getElementById('final-score').textContent = result.score;
  document.getElementById('final-high-score').textContent = result.highScore;

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
}

/**
 * Hide result modal
 */
function hideResultModal() {
  document.getElementById('result-modal').classList.add('hidden');
}
```

---

## 10. Testing Checklist ✅

### 10.1 Functional Tests

**Manual Testing:**
- [ ] Game starts when "Start Game" clicked
- [ ] Timer counts down from 30 seconds
- [ ] Timer changes color at 10 seconds (warning)
- [ ] Timer changes color at 5 seconds (critical)
- [ ] Moles appear randomly in holes
- [ ] Moles appear with 0.5-1.5s intervals
- [ ] Moles stay visible for 1 second
- [ ] Moles disappear if not clicked
- [ ] Score increments when mole clicked
- [ ] Score doesn't change on miss click
- [ ] Game ends when timer reaches 0
- [ ] All moles disappear at game end
- [ ] High score saves correctly
- [ ] High score persists across page reload
- [ ] New record badge shows when appropriate
- [ ] "Play Again" starts new game
- [ ] "Back to Home" navigates correctly

### 10.2 Edge Cases

**Edge Case Testing:**
- [ ] Click hole without mole (no effect)
- [ ] Rapid clicking on single hole (no double count)
- [ ] Click mole just before it disappears
- [ ] All 9 moles visible simultaneously (rare but possible)
- [ ] Game starts with score of 0
- [ ] First game with no high score (shows "--")
- [ ] Perfect game (hit all moles)
- [ ] Zero score game (missed all moles)

### 10.3 Performance Tests

**Performance Checks:**
- [ ] Mole spawn timing accurate (±50ms)
- [ ] Timer countdown accurate (±100ms over 30s)
- [ ] No lag when clicking moles
- [ ] Smooth mole pop-up animation
- [ ] Page load time < 1 second
- [ ] No memory leaks from timers

### 10.4 Timer Accuracy Test

**Validate Timer:**
```javascript
// Test: Run game and verify timer accuracy
// Expected: 30 seconds ± 100ms
console.time('game-duration');
// ... game runs ...
console.timeEnd('game-duration');
// Should print ~30000ms
```

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed
  - Game Specifications: Summary from requirements
  - State Management: Complete state object and transitions
  - Timer Management: Countdown timer with visual warnings
  - Mole Spawning: Random spawning algorithm, show/hide logic
  - Scoring System: Score tracking and high score management
  - UI Implementation: HTML structure, CSS styling, dynamic generation
  - Event Handling: Hole clicks, mole hits, game start
  - Game Flow: Initialization, start, end, cleanup
  - Result Modal: Structure and functions
  - Testing: Comprehensive test checklist including timer accuracy
- 2026-02-22: Added ad container to Result Modal for consistency across all games
