# Data Design Document - Browser Game Collection

## Overview
This document defines the data structures, storage schemas, and data management strategies for the Browser Game Collection website.

---

## 1. Data Storage Architecture ✅

### 1.1 Storage Layers

**Three-Tier Data Architecture:**
```
┌─────────────────────────────────────────────┐
│  External JSON Files (Static)               │
│  - games.json                               │
│  - site-config.json                         │
│  (Read-only, loaded on page load)           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  In-Memory State (Runtime)                  │
│  - Current game state                       │
│  - UI state                                 │
│  - Temporary data                           │
│  (Volatile, lost on page reload)            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  LocalStorage (Persistent)                  │
│  - High scores                              │
│  - Game statistics                          │
│  - User preferences (future)                │
│  (Persistent, survives page reload)         │
└─────────────────────────────────────────────┘
```

### 1.2 Data Flow

**Page Load Flow:**
```
1. Load External JSON Files
   ↓
2. Parse and validate JSON data
   ↓
3. Load LocalStorage data
   ↓
4. Initialize in-memory state
   ↓
5. Render UI with combined data
```

**Game Play Flow:**
```
1. User action (click, input)
   ↓
2. Update in-memory game state
   ↓
3. Update UI (real-time)
   ↓
4. On game end: Save to LocalStorage
   ↓
5. Update UI with new saved data
```

---

## 2. LocalStorage Schema ✅

### 2.1 Naming Convention

**Format:** `{prefix}_{game-id}_{data-type}`

**Prefix:** `bgc_` (Browser Game Collection)
- Defined in site-config.json
- Prevents collision with other apps

**Examples:**
- `bgc_memory-game_highscore`
- `bgc_tic-tac-toe_wins`
- `bgc_whack-a-mole_plays`

### 2.2 Memory Game Storage

**Keys:**
```javascript
{
  "bgc_memory-game_highscore": 12,     // Integer: Minimum moves (best score)
  "bgc_memory-game_plays": 5           // Integer: Total games played (optional)
}
```

**Data Types:**
- `highscore`: Number (integer, minimum 8, maximum ~100)
- `plays`: Number (integer, increments each game)

**Validation Rules:**
- highscore must be >= 8 (perfect game)
- plays must be >= 0
- Both values must be valid integers

**Default Values:**
- If key doesn't exist: Use `null` or `--` in UI
- First game: Initialize highscore with first score

### 2.3 Tic-Tac-Toe Storage

**Keys:**
```javascript
{
  "bgc_tic-tac-toe_wins": 12,      // Integer: Total wins
  "bgc_tic-tac-toe_losses": 8,     // Integer: Total losses
  "bgc_tic-tac-toe_draws": 5,      // Integer: Total draws
  "bgc_tic-tac-toe_streak": 4      // Integer: Best win streak (optional)
}
```

**Data Types:**
- `wins`: Number (integer, >= 0)
- `losses`: Number (integer, >= 0)
- `draws`: Number (integer, >= 0)
- `streak`: Number (integer, >= 0)

**Validation Rules:**
- All values must be >= 0
- All values must be valid integers
- Total games = wins + losses + draws

**Default Values:**
- All counters initialize to 0 if not present

### 2.4 Whack-a-Mole Storage

**Keys:**
```javascript
{
  "bgc_whack-a-mole_highscore": 18,    // Integer: Maximum moles hit
  "bgc_whack-a-mole_plays": 12         // Integer: Total games played (optional)
}
```

**Data Types:**
- `highscore`: Number (integer, >= 0)
- `plays`: Number (integer, >= 0)

**Validation Rules:**
- highscore must be >= 0
- plays must be >= 0
- Both values must be valid integers

**Default Values:**
- If key doesn't exist: Use `null` or `--` in UI
- First game: Initialize highscore with first score

### 2.5 Global/Common Storage (Future)

**Reserved Keys for Future Features:**
```javascript
{
  "bgc_settings_sound": true,           // Boolean: Sound enabled
  "bgc_settings_theme": "light",        // String: "light" or "dark"
  "bgc_user_last-played": "memory-game" // String: Last played game ID
}
```

**Note:** Not implemented in initial release

---

## 3. External JSON Data Files ✅

### 3.1 games.json Specification

**Location:** `/src/assets/data/games.json`

**Purpose:** Game metadata for dynamic game list rendering

**Full Schema:**
```javascript
{
  "games": [
    {
      "id": "memory-game",                    // String (required, unique, kebab-case)
      "title": "Memory Game",                 // String (required, display name)
      "description": "Find matching pairs...", // String (required, 50-150 chars)
      "thumbnail": "/assets/images/thumbnails/memory-game.png", // String (required, relative path)
      "difficulty": "easy",                   // String (required: "easy", "medium", "hard")
      "category": "puzzle",                   // String (required: "puzzle", "action", "strategy")
      "estimatedTime": "1-2 minutes",         // String (required, display format)
      "htmlPath": "/games/memory-game.html",  // String (required, relative path)
      "enabled": true                         // Boolean (required, feature flag)
    }
  ]
}
```

**Field Definitions:**

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique game identifier | kebab-case, alphanumeric + hyphens |
| title | string | Yes | Display name | 3-50 characters |
| description | string | Yes | Short description for card | 50-150 characters |
| thumbnail | string | Yes | Path to thumbnail image | Valid file path, .png, .webp, or .jpg |
| difficulty | string | Yes | Difficulty level | "easy", "medium", or "hard" |
| category | string | Yes | Game category | "puzzle", "action", or "strategy" |
| estimatedTime | string | Yes | Estimated play time | Human-readable format |
| htmlPath | string | Yes | Path to game HTML file | Valid file path, .html extension |
| enabled | boolean | Yes | Show in game list? | true or false |

**Validation Rules:**
- Array must contain at least 1 game
- Each game must have all required fields
- No duplicate IDs
- All file paths must be valid (checked on build)

**Usage:**
```javascript
// Load and parse
fetch('src/assets/data/games.json')
  .then(response => response.json())
  .then(data => {
    // Filter enabled games
    const enabledGames = data.games.filter(game => game.enabled);

    // Render game cards
    renderGameCards(enabledGames);
  });
```

### 3.2 site-config.json Specification

**Location:** `/src/assets/data/site-config.json`

**Purpose:** Site-wide configuration and feature flags

**Full Schema:**
```javascript
{
  "site": {
    "title": "Free Browser Games Collection",      // String: Site title for <title>
    "description": "Play fun and casual games...", // String: Site description for meta
    "version": "1.0.0",                            // String: Semantic version
    "language": "en",                              // String: ISO 639-1 language code
    "author": "Your Name",                         // String: Author name
    "keywords": [                                  // Array<String>: SEO keywords
      "browser games",
      "free games",
      "casual games",
      "online games"
    ]
  },
  "features": {
    "adsEnabled": true,          // Boolean: Show advertisements
    "soundEnabled": false,       // Boolean: Enable sound effects (future)
    "darkModeEnabled": false,    // Boolean: Enable dark mode toggle (future)
    "responsiveEnabled": false   // Boolean: Enable mobile/tablet support (future)
  },
  "ads": {
    "provider": "Google AdSense",  // String: Ad provider name
    "showOnTopPage": true,         // Boolean: Show banner ad on top page
    "showBeforeGame": true,        // Boolean: Show pre-game interstitial
    "showAfterGame": true,         // Boolean: Show post-game ad
    "skipDelay": 5                 // Number: Seconds before skip button appears
  },
  "storage": {
    "provider": "localStorage",    // String: Storage provider (localStorage only for now)
    "prefix": "bgc_"               // String: Key prefix for all storage items
  }
}
```

**Field Definitions:**

**site section:**
- `title`: Used in HTML `<title>` tag and header
- `description`: Used in meta description tag
- `version`: Semantic versioning (major.minor.patch)
- `language`: ISO 639-1 code (en, ja, etc.)
- `author`: For meta author tag
- `keywords`: Array of SEO keywords for meta keywords tag

**features section:**
- All boolean flags to enable/disable features
- `false` = feature not shown/not functional
- Use for progressive rollout of features

**ads section:**
- `provider`: Display name (not used for implementation)
- `showOnTopPage`: Controls banner ad visibility
- `showBeforeGame`: Controls pre-game interstitial
- `showAfterGame`: Controls post-game ad in result modal
- `skipDelay`: Number of seconds (integer, 0-30)

**storage section:**
- `provider`: Reserved for future use (only localStorage for now)
- `prefix`: String to prepend to all LocalStorage keys

**Usage:**
```javascript
// Load and parse
fetch('src/assets/data/site-config.json')
  .then(response => response.json())
  .then(config => {
    // Set page title
    document.title = config.site.title;

    // Check feature flags
    if (config.features.adsEnabled) {
      loadAdvertisements();
    }

    // Get storage prefix
    const storagePrefix = config.storage.prefix;
  });
```

---

## 4. In-Memory Game State ✅

### 4.1 Memory Game State

**State Object:**
```javascript
const memoryGameState = {
  // Card data
  cards: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8],  // Array<Number>: Card values (shuffled)

  // Game progress
  flippedCards: [],              // Array<Number>: Indices of currently flipped cards (max 2)
  matchedPairs: [],              // Array<Number>: Indices of matched cards
  moves: 0,                      // Number: Move counter (increments each pair flip)

  // Game control
  isLocked: false,               // Boolean: Prevent clicks during animations
  gameStarted: false,            // Boolean: Has game begun?
  gameComplete: false,           // Boolean: All pairs found?

  // High score
  highScore: null                // Number|null: Best score from LocalStorage
};
```

**State Lifecycle:**
```
Initialize → Shuffle Cards → Game Active → All Matched → Save Score → Reset
```

**Key State Transitions:**
- Card click: `flippedCards.push(index)`, check if length === 2
- Match found: `matchedPairs.push(...indices)`, clear `flippedCards`
- No match: Set `isLocked = true`, wait 1s, flip back, set `isLocked = false`
- Game complete: When `matchedPairs.length === 16`

### 4.2 Tic-Tac-Toe State

**State Object:**
```javascript
const ticTacToeState = {
  // Board state
  board: ['', '', '', '', '', '', '', '', ''],  // Array<String>: 9 cells ('' = empty, 'X' or 'O')

  // Player info
  currentPlayer: 'X',            // String: 'X' or 'O' (whose turn)
  playerSymbol: 'X',             // String: 'X' or 'O' (what player chose)
  cpuSymbol: 'O',                // String: 'X' or 'O' (CPU's symbol)

  // Game control
  gameOver: false,               // Boolean: Game ended?
  winner: null,                  // String|null: 'X', 'O', 'draw', or null
  winningLine: [],               // Array<Number>: Indices of winning cells [0,1,2] etc.

  // Statistics (session + total)
  sessionWins: 0,                // Number: Wins this session
  sessionLosses: 0,              // Number: Losses this session
  sessionDraws: 0,               // Number: Draws this session
  totalWins: 0,                  // Number: All-time wins from LocalStorage
  totalLosses: 0,                // Number: All-time losses from LocalStorage
  totalDraws: 0,                 // Number: All-time draws from LocalStorage
  currentStreak: 0,              // Number: Current win streak
  bestStreak: 0                  // Number: Best win streak from LocalStorage
};
```

**State Lifecycle:**
```
Choose Symbol → Place Mark → Check Win → Game Over → Update Stats → Reset
```

**Key State Transitions:**
- Player move: `board[index] = playerSymbol`, `currentPlayer = cpuSymbol`
- CPU move: Wait 0.5-1s, `board[index] = cpuSymbol`, `currentPlayer = playerSymbol`
- Win detection: Check 8 lines after each move
- Game end: Set `gameOver = true`, `winner = 'X'|'O'|'draw'`, save stats

### 4.3 Whack-a-Mole State

**State Object:**
```javascript
const whackAMoleState = {
  // Hole states
  holes: [false, false, false, false, false, false, false, false, false],  // Array<Boolean>: 9 holes (true = mole visible)

  // Game progress
  score: 0,                      // Number: Current score (moles hit)
  timeRemaining: 30,             // Number: Seconds left

  // Game control
  gameActive: false,             // Boolean: Game running?
  gameStarted: false,            // Boolean: Has game started?

  // Timers (references for cleanup)
  timerInterval: null,           // Number|null: setInterval ID for countdown
  spawnTimeout: null,            // Number|null: setTimeout ID for mole spawning

  // High score
  highScore: 0                   // Number: Best score from LocalStorage
};
```

**State Lifecycle:**
```
Start Game → Timer Countdown → Spawn Moles → Hit/Miss → Time Up → Save Score → Reset
```

**Key State Transitions:**
- Start: `gameActive = true`, `timeRemaining = 30`, start timer, start spawning
- Mole spawn: `holes[randomIndex] = true`, setTimeout to hide after 1s
- Mole hit: `score++`, `holes[index] = false`
- Timer tick: `timeRemaining--`, check if `timeRemaining === 0`
- Game end: `gameActive = false`, clear intervals, save score if > highScore

---

## 5. Data Access Layer (API) ✅

### 5.1 Storage Service Interface

**Purpose:** Abstract LocalStorage operations for consistency and error handling

**Core Functions:**

```javascript
// StorageService.js

class StorageService {
  constructor(prefix = 'bgc_') {
    this.prefix = prefix;
  }

  /**
   * Save data to LocalStorage
   * @param {string} key - Key without prefix
   * @param {any} value - Value to store (will be JSON stringified if object)
   * @returns {boolean} Success status
   */
  save(key, value) {
    try {
      const fullKey = this.prefix + key;
      const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to LocalStorage:', error);
      return false;
    }
  }

  /**
   * Load data from LocalStorage
   * @param {string} key - Key without prefix
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or defaultValue
   */
  load(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);

      if (item === null) {
        return defaultValue;
      }

      // Try to parse as JSON, fallback to raw string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error('Failed to load from LocalStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Load numeric value from LocalStorage
   * @param {string} key - Key without prefix
   * @param {number} defaultValue - Default value if key doesn't exist or invalid
   * @returns {number} Stored number or defaultValue
   */
  loadNumber(key, defaultValue = 0) {
    const value = this.load(key, defaultValue);
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Remove data from LocalStorage
   * @param {string} key - Key without prefix
   * @returns {boolean} Success status
   */
  remove(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Failed to remove from LocalStorage:', error);
      return false;
    }
  }

  /**
   * Clear all data with prefix
   * @returns {boolean} Success status
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear LocalStorage:', error);
      return false;
    }
  }

  /**
   * Check if LocalStorage is available
   * @returns {boolean} Availability status
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService('bgc_');
```

**Usage Example:**
```javascript
import { storageService } from './StorageService.js';

// Save high score
storageService.save('memory-game_highscore', 12);

// Load high score
const highScore = storageService.loadNumber('memory-game_highscore', null);

// Check availability
if (!storageService.isAvailable()) {
  showWarning('LocalStorage not available. Scores will not be saved.');
}
```

### 5.2 Game Data Service Interface

**Purpose:** Game-specific data operations

```javascript
// GameDataService.js

import { storageService } from './StorageService.js';

class GameDataService {
  /**
   * Save Memory Game high score
   * @param {number} score - Score to save
   * @returns {boolean} True if new high score
   */
  saveMemoryGameScore(score) {
    const currentBest = storageService.loadNumber('memory-game_highscore', null);

    // Lower is better for Memory Game
    if (currentBest === null || score < currentBest) {
      storageService.save('memory-game_highscore', score);
      return true;  // New record
    }

    return false;
  }

  /**
   * Load Memory Game high score
   * @returns {number|null} High score or null
   */
  loadMemoryGameHighScore() {
    return storageService.loadNumber('memory-game_highscore', null);
  }

  /**
   * Save Tic-Tac-Toe game result
   * @param {string} result - 'win', 'loss', or 'draw'
   */
  saveTicTacToeResult(result) {
    if (result === 'win') {
      const wins = storageService.loadNumber('tic-tac-toe_wins', 0);
      storageService.save('tic-tac-toe_wins', wins + 1);
    } else if (result === 'loss') {
      const losses = storageService.loadNumber('tic-tac-toe_losses', 0);
      storageService.save('tic-tac-toe_losses', losses + 1);
    } else if (result === 'draw') {
      const draws = storageService.loadNumber('tic-tac-toe_draws', 0);
      storageService.save('tic-tac-toe_draws', draws + 1);
    }
  }

  /**
   * Load Tic-Tac-Toe statistics
   * @returns {object} Stats object
   */
  loadTicTacToeStats() {
    return {
      wins: storageService.loadNumber('tic-tac-toe_wins', 0),
      losses: storageService.loadNumber('tic-tac-toe_losses', 0),
      draws: storageService.loadNumber('tic-tac-toe_draws', 0)
    };
  }

  /**
   * Save Whack-a-Mole high score
   * @param {number} score - Score to save
   * @returns {boolean} True if new high score
   */
  saveWhackAMoleScore(score) {
    const currentBest = storageService.loadNumber('whack-a-mole_highscore', 0);

    // Higher is better for Whack-a-Mole
    if (score > currentBest) {
      storageService.save('whack-a-mole_highscore', score);
      return true;  // New record
    }

    return false;
  }

  /**
   * Load Whack-a-Mole high score
   * @returns {number} High score (default 0)
   */
  loadWhackAMoleHighScore() {
    return storageService.loadNumber('whack-a-mole_highscore', 0);
  }
}

// Export singleton instance
export const gameDataService = new GameDataService();
```

### 5.3 Config Loader Service

**Purpose:** Load and validate external JSON files

```javascript
// ConfigLoader.js

class ConfigLoader {
  constructor() {
    this.siteConfig = null;
    this.gamesData = null;
  }

  /**
   * Load site configuration
   * @returns {Promise<object>} Site config object
   */
  async loadSiteConfig() {
    if (this.siteConfig) {
      return this.siteConfig;  // Return cached
    }

    try {
      const response = await fetch('src/assets/data/site-config.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.siteConfig = await response.json();
      return this.siteConfig;
    } catch (error) {
      console.error('Failed to load site config:', error);
      // Return default config
      return this.getDefaultSiteConfig();
    }
  }

  /**
   * Load games data
   * @returns {Promise<Array>} Games array
   */
  async loadGamesData() {
    if (this.gamesData) {
      return this.gamesData;  // Return cached
    }

    try {
      const response = await fetch('src/assets/data/games.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();

      // Validate structure
      if (!data.games || !Array.isArray(data.games)) {
        throw new Error('Invalid games.json structure');
      }

      // Filter enabled games
      this.gamesData = data.games.filter(game => game.enabled === true);
      return this.gamesData;
    } catch (error) {
      console.error('Failed to load games data:', error);
      // Show warning to user
      this.showWarning('Failed to load games. Please refresh the page.');
      return [];
    }
  }

  /**
   * Show warning message to user (stub - implement in UI layer)
   * @param {string} message - Warning message
   */
  showWarning(message) {
    console.warn(message);
    // TODO: Implement UI notification in actual implementation
  }

  /**
   * Default site config (fallback)
   * @returns {object} Default config
   */
  getDefaultSiteConfig() {
    return {
      site: {
        title: 'Browser Games Collection',
        description: 'Play free browser games',
        version: '1.0.0',
        language: 'en'
      },
      features: {
        adsEnabled: false,
        soundEnabled: false,
        darkModeEnabled: false,
        responsiveEnabled: false
      },
      storage: {
        provider: 'localStorage',
        prefix: 'bgc_'
      }
    };
  }
}

// Export singleton instance
export const configLoader = new ConfigLoader();
```

---

## 6. Data Validation ✅

### 6.1 Input Validation

**LocalStorage Value Validation:**
```javascript
// Validation utilities

/**
 * Validate numeric score
 * @param {any} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} Valid or not
 */
function isValidScore(value, min = 0, max = 10000) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max && Number.isInteger(num);
}

/**
 * Validate game ID
 * @param {string} id - Game ID to validate
 * @returns {boolean} Valid or not
 */
function isValidGameId(id) {
  return typeof id === 'string' && /^[a-z0-9-]+$/.test(id);
}

/**
 * Validate difficulty level
 * @param {string} difficulty - Difficulty to validate
 * @returns {boolean} Valid or not
 */
function isValidDifficulty(difficulty) {
  return ['easy', 'medium', 'hard'].includes(difficulty);
}

/**
 * Validate category
 * @param {string} category - Category to validate
 * @returns {boolean} Valid or not
 */
function isValidCategory(category) {
  return ['puzzle', 'action', 'strategy'].includes(category);
}

/**
 * Sanitize LocalStorage value before saving
 * @param {any} value - Value to sanitize
 * @param {string} type - Expected type ('number', 'string', 'boolean')
 * @returns {any} Sanitized value or null
 */
function sanitizeValue(value, type) {
  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? null : num;
    case 'string':
      return String(value);
    case 'boolean':
      return Boolean(value);
    default:
      return value;
  }
}
```

### 6.2 JSON Schema Validation

**games.json Validation:**
```javascript
/**
 * Validate games.json structure
 * @param {object} data - Games data object to validate
 * @returns {object} { valid: boolean, errors: Array<string> }
 */
function validateGamesJSON(data) {
  const errors = [];

  // Check root structure
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Games data must be an object'] };
  }

  if (!data.games || !Array.isArray(data.games)) {
    return { valid: false, errors: ['Games data must have a "games" array'] };
  }

  const games = data.games;

  if (games.length === 0) {
    return { valid: false, errors: ['Games array cannot be empty'] };
  }

  const ids = new Set();

  games.forEach((game, index) => {
    // Check required fields
    if (!game.id) errors.push(`Game ${index}: Missing 'id' field`);
    if (!game.title) errors.push(`Game ${index}: Missing 'title' field`);
    if (!game.description) errors.push(`Game ${index}: Missing 'description' field`);
    if (!game.htmlPath) errors.push(`Game ${index}: Missing 'htmlPath' field`);

    // Check duplicates
    if (ids.has(game.id)) {
      errors.push(`Duplicate game ID: ${game.id}`);
    } else {
      ids.add(game.id);
    }

    // Validate ID format
    if (game.id && !isValidGameId(game.id)) {
      errors.push(`Game ${index}: Invalid ID format (use kebab-case)`);
    }

    // Validate difficulty
    if (game.difficulty && !isValidDifficulty(game.difficulty)) {
      errors.push(`Game ${index}: Invalid difficulty (must be easy, medium, or hard)`);
    }

    // Validate category
    if (game.category && !isValidCategory(game.category)) {
      errors.push(`Game ${index}: Invalid category (must be puzzle, action, or strategy)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 7. Error Handling ✅

### 7.1 LocalStorage Errors

**Common Error Scenarios:**

1. **QuotaExceededError:**
   - Cause: LocalStorage full (usually 5-10MB limit)
   - Handling: Warn user, offer to clear old data

2. **SecurityError:**
   - Cause: LocalStorage disabled (privacy mode, security settings)
   - Handling: Inform user, continue without saving

3. **TypeError:**
   - Cause: Invalid data type or circular reference
   - Handling: Log error, use default value

**Error Handling Pattern:**
```javascript
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.warn('LocalStorage quota exceeded');
    showNotification('Storage full. Scores may not be saved.', 'warning');
  } else if (error.name === 'SecurityError') {
    console.warn('LocalStorage access denied');
    showNotification('Storage disabled. Scores will not be saved.', 'warning');
  } else {
    console.error('Failed to save data:', error);
  }
}
```

### 7.2 JSON Loading Errors

**Error Scenarios:**

1. **Network Error:**
   - Cause: Failed to fetch JSON file (404, network issue)
   - Handling: Use fallback/default config

2. **Parse Error:**
   - Cause: Invalid JSON syntax
   - Handling: Log error, use fallback config

**Error Handling Pattern:**
```javascript
try {
  const response = await fetch('config.json');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Failed to load config:', error);
  return getDefaultConfig();
}
```

### 7.3 Data Corruption Handling

**Scenarios:**
- User manually edits LocalStorage
- Data becomes corrupted
- Invalid values stored

**Recovery Strategy:**
```javascript
function loadWithValidation(key, validator, defaultValue) {
  const value = storageService.load(key, defaultValue);

  if (validator(value)) {
    return value;
  } else {
    console.warn(`Invalid data for ${key}, using default`);
    storageService.remove(key);  // Remove corrupted data
    return defaultValue;
  }
}

// Usage
const highScore = loadWithValidation(
  'memory-game_highscore',
  (val) => isValidScore(val, 8, 100),
  null
);
```

---

## 8. Performance Considerations ✅

### 8.1 Read/Write Optimization

**Best Practices:**

1. **Batch Updates:**
   - Don't save on every state change
   - Save only when necessary (game end, milestone)

2. **Lazy Loading:**
   - Load LocalStorage data only when needed
   - Cache loaded values in memory

3. **Minimize Serialization:**
   - Store primitive values when possible
   - Avoid complex object serialization

**Example:**
```javascript
// ❌ Bad: Save on every score increment
function incrementScore() {
  score++;
  storageService.save('game_score', score);  // Too frequent
}

// ✅ Good: Save only at game end
function gameEnd() {
  const isNewRecord = saveHighScore(score);
  if (isNewRecord) {
    showNewRecordAnimation();
  }
}
```

### 8.2 Memory Management

**In-Memory State:**
- Keep state objects lean
- Clear intervals/timeouts on cleanup
- Remove event listeners on page unload

**Cleanup Pattern:**
```javascript
// Game cleanup function
function cleanup() {
  // Clear timers
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Clear timeouts
  if (spawnTimeout) {
    clearTimeout(spawnTimeout);
    spawnTimeout = null;
  }

  // Reset state
  resetGameState();
}

// Call on game end or page unload
window.addEventListener('beforeunload', cleanup);
```

### 8.3 JSON Loading Performance

**Optimization Strategies:**

1. **Cache Loaded Data:**
   - Load JSON once, cache in memory
   - Don't reload on every page render

2. **Use Static Hosting:**
   - GitHub Pages serves with CDN
   - Automatic caching headers

3. **Minimize File Size:**
   - Remove unnecessary whitespace (minify)
   - Keep JSON files small (< 50KB)

**Caching Example:**
```javascript
let cachedGames = null;

async function getGames() {
  if (cachedGames) {
    return cachedGames;  // Return cached
  }

  cachedGames = await configLoader.loadGamesData();
  return cachedGames;
}
```

---

## 9. Data Migration Strategy ✅

### 9.1 Version Management

**Purpose:** Handle data format changes between versions

**Version Storage:**
```javascript
{
  "bgc_app_version": "1.0.0"  // Store app version
}
```

**Migration Function:**
```javascript
function migrateData(fromVersion, toVersion) {
  console.log(`Migrating data from ${fromVersion} to ${toVersion}`);

  // Example: v1.0.0 → v1.1.0
  if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
    // Rename old keys
    const oldScore = localStorage.getItem('memorygame_score');
    if (oldScore) {
      storageService.save('memory-game_highscore', oldScore);
      localStorage.removeItem('memorygame_score');
    }
  }

  // Update version
  storageService.save('app_version', toVersion);
}
```

### 9.2 Backward Compatibility

**Strategy:**
- New features: Add new keys, don't modify existing
- Breaking changes: Migrate old data to new format
- Deprecation: Warn users, maintain old format for 1-2 versions

**Example:**
```javascript
// v1.0.0: Used 'score' key
// v1.1.0: Now use 'highscore' key (more descriptive)

function loadHighScore() {
  // Try new key first
  let score = storageService.load('memory-game_highscore', null);

  // Fallback to old key
  if (score === null) {
    score = storageService.load('memory-game_score', null);

    // Migrate to new key
    if (score !== null) {
      storageService.save('memory-game_highscore', score);
      storageService.remove('memory-game_score');
    }
  }

  return score;
}
```

---

## 10. Testing Strategies ✅

### 10.1 Unit Tests

**Test Coverage:**
- StorageService CRUD operations
- Data validation functions
- JSON parsing and validation

**Example Test Cases:**
```javascript
// Test: Save and load number
test('StorageService saves and loads numbers', () => {
  storageService.save('test_score', 42);
  const loaded = storageService.loadNumber('test_score', 0);
  expect(loaded).toBe(42);
});

// Test: Handle missing key
test('StorageService returns default for missing key', () => {
  const loaded = storageService.loadNumber('nonexistent', 99);
  expect(loaded).toBe(99);
});

// Test: Validate score range
test('isValidScore rejects out-of-range values', () => {
  expect(isValidScore(50, 0, 100)).toBe(true);
  expect(isValidScore(-1, 0, 100)).toBe(false);
  expect(isValidScore(101, 0, 100)).toBe(false);
});
```

### 10.2 Integration Tests

**Test Scenarios:**
- Load config → Initialize app → Verify UI
- Play game → Save score → Reload → Verify persistence
- Simulate LocalStorage full → Verify error handling

### 10.3 Manual Testing

**Test Checklist:**
- [ ] High score saves correctly
- [ ] High score persists across page reload
- [ ] Statistics update correctly
- [ ] Invalid data handled gracefully
- [ ] Works in private/incognito mode (no LocalStorage)
- [ ] Data migration works when updating app version

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed
  - Data Storage Architecture: Three-tier storage model
  - LocalStorage Schema: Game-specific and global storage
  - External JSON Files: games.json and site-config.json specifications
  - In-Memory State: Game state objects for all three games
  - Data Access Layer: StorageService, GameDataService, ConfigLoader
  - Data Validation: Input validation and JSON schema validation
  - Error Handling: LocalStorage and JSON loading errors
  - Performance: Read/write optimization, memory management
  - Migration Strategy: Version management and backward compatibility
  - Testing: Unit tests, integration tests, manual testing checklist
- 2026-02-22: Internal review and fixes
  - Fixed games.json schema to match actual file structure (root object with "games" array)
  - Fixed difficulty values to lowercase ("easy", "medium", "hard")
  - Fixed category values to lowercase ("puzzle", "action", "strategy")
  - Updated ConfigLoader.loadGamesData() to access data.games
  - Added category validation function
  - Enhanced validateGamesJSON to check root structure and category field
  - Added user warning when games.json fails to load
