# Nine Game - Requirements & Design Document

## Document Information

- **Game Name**: Nine (ナイン)
- **Game Type**: 2-Player Strategic Card Game
- **Inspiration**: Based on the card game from manga "Ten" (天 天和通りの快男児)
- **Created**: 2026-02-27
- **Status**: Requirements Approved, Ready for Implementation

---

## Game Overview

### Concept

Nine is a strategic card game where the player competes against a CPU opponent. Each player has cards numbered 1-9 and must use strategy to win the highest total score over 9 turns.

### Core Gameplay

1. Both players have cards numbered 1 through 9 (one of each)
2. Each turn, both players select a card and place it face-down
3. Cards are revealed simultaneously
4. The player with the higher card wins both cards' values as points
5. After 9 turns, all cards are used and the player with the highest total score wins

### Strategic Elements

- **Card Management**: Decide when to use high vs low cards
- **Pattern Recognition**: CPU follows a basic strategy that can be learned
- **Risk/Reward**: Save high cards for important turns or use them early
- **Turn Order Advantage**: First player changes each turn, affecting strategy

---

## Requirements Specification

### Functional Requirements

#### FR-1: Game Setup
- Each player (Human and CPU) receives cards numbered 1-9
- Cards are displayed in a horizontal row
- Player's cards shown at bottom, CPU's cards shown at top
- All cards start face-up and visible
- Turn counter initialized to "Turn 1/9"

#### FR-2: Card Selection
- Player clicks on one of their available cards to select it
- Selected card shows visual feedback (highlight/border)
- Player can change selection before confirming
- "Confirm" button becomes active after card selection
- Selected card cannot be used in future turns

#### FR-3: CPU Turn
- CPU takes 1 second to "think" before selecting
- CPU uses medium-difficulty strategy:
  - Basic card value tracking
  - Simple comparative logic (play higher card when behind)
  - Some randomness to avoid predictability
- CPU selection hidden until reveal phase

#### FR-4: Card Reveal & Scoring
- After both players confirm, cards are revealed simultaneously
- Cards flip from face-down to face-up with animation
- Higher card value wins the sum of both cards
- If tied, no points awarded (or split points)
- Scores updated in real-time
- Used cards marked as unavailable

#### FR-5: Turn Progression
- Turn order alternates: Player goes first on odd turns (1, 3, 5, 7, 9)
- CPU goes first on even turns (2, 4, 6, 8)
- Turn counter updates: "Turn X/9 - Your turn" or "Turn X/9 - CPU's turn"
- Game continues for exactly 9 turns

#### FR-6: Game End & Results
- After turn 9, game ends automatically
- Result modal displays:
  - Final scores (Player vs CPU)
  - Win/Loss/Draw result
  - High score comparison (if new record)
- High score saved to LocalStorage
- Options: "New Game" or "Back to Home"

#### FR-7: High Score Persistence
- High score (maximum points in a single game) saved to LocalStorage
- Key format: `bgc_nine-game_highscore`
- Display high score in game header ("Best: XX")
- Show "New Record!" badge if current score beats high score

### Non-Functional Requirements

#### NFR-1: Performance
- Game loads in under 1 second
- Card flip animations run at 60fps
- CPU response time: 1 second (simulates thinking)
- No lag during card selection or reveal

#### NFR-2: Visual Design
- Card design: Trump-style with alternating Red/Black colors
- Cards 1, 3, 5, 7, 9: Red
- Cards 2, 4, 6, 8: Black
- Arabic numerals (not Roman numerals)
- Responsive layout for various screen sizes

#### NFR-3: Accessibility
- Clear visual feedback for selected cards
- Disabled state for "Confirm" button when no card selected
- Clear turn indicator showing whose turn it is
- Screen reader compatible (ARIA labels)

#### NFR-4: Browser Compatibility
- Modern browsers: Chrome, Firefox, Edge, Safari (latest versions)
- ES6 module support required
- LocalStorage support required

---

## User Interface Design

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│                 Nine - Game Header               │
│  Score: 0   CPU Score: 0   Best: --   Turn: 1/9│
├─────────────────────────────────────────────────┤
│                                                  │
│  CPU Cards (Face-down during selection):        │
│  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]   │
│                                                  │
│  ─────────── Scoring Area ─────────────         │
│   [Player Card]  vs  [CPU Card]                 │
│      Result: Player wins 12 points!             │
│                                                  │
│  Player Cards (Face-up, clickable):             │
│  [1] [2] [3] [4] [5] [6] [7] [8] [9]           │
│     └─ Selected (highlighted)                   │
│                                                  │
├─────────────────────────────────────────────────┤
│  [Confirm Selection]  [New Game]  [Back to Home]│
└─────────────────────────────────────────────────┘
```

### Card States

1. **Available** - Default state, clickable, full opacity
2. **Selected** - Blue border, slight scale, awaiting confirmation
3. **Used** - Grayed out, not clickable, reduced opacity
4. **Face-down** - Back design showing, during reveal phase
5. **Revealed** - Face-up with animation, showing value

### Color Scheme

- **Background**: #ecf0f1 (light gray)
- **Card Background**: White (#ffffff)
- **Red Cards**: #e74c3c
- **Black Cards**: #2c3e50
- **Selected Border**: #3498db (primary blue)
- **Used Cards**: #95a5a6 (gray, 50% opacity)
- **Win Text**: #27ae60 (green)
- **Lose Text**: #e74c3c (red)

---

## Game Logic & Algorithms

### State Management

```javascript
state = {
  // Card data
  playerCards: [1,2,3,4,5,6,7,8,9],     // Available cards
  cpuCards: [1,2,3,4,5,6,7,8,9],        // Available cards
  playerUsedCards: [],                   // Already played
  cpuUsedCards: [],                      // Already played

  // Turn data
  currentTurn: 1,                        // 1-9
  isPlayerTurn: true,                    // Turn order

  // Selection data
  playerSelectedCard: null,              // Current selection
  cpuSelectedCard: null,                 // Hidden until reveal

  // Score data
  playerScore: 0,
  cpuScore: 0,
  highScore: null,

  // Game state
  gamePhase: 'selection',  // selection | reveal | complete
  isLocked: false,         // During animations

  // DOM cache
  playerCardElements: [],
  cpuCardElements: [],
  confirmButton: null,
  scoreDisplays: {}
}
```

### Game Flow

```
1. INITIALIZATION
   └→ Load high score
   └→ Render cards
   └→ Set turn 1, player first
   └→ Enable player card selection

2. SELECTION PHASE
   └→ Player clicks card → Visual feedback
   └→ Player clicks "Confirm" → Lock selection
   └→ CPU thinks (1 second) → CPU selects card
   └→ Transition to REVEAL PHASE

3. REVEAL PHASE
   └→ Both cards flip face-down
   └→ Brief pause (500ms)
   └→ Both cards flip face-up
   └→ Compare values → Determine winner
   └→ Update scores with animation
   └→ Mark cards as used
   └→ If turn < 9: Next turn
   └→ If turn = 9: Transition to COMPLETE

4. COMPLETE PHASE
   └→ Check if new high score
   └→ Show result modal
   └→ Offer "New Game" or "Back to Home"
```

### CPU Strategy (Medium Difficulty)

```javascript
function cpuSelectCard(gameState) {
  const availableCards = gameState.cpuCards;
  const playerScore = gameState.playerScore;
  const cpuScore = gameState.cpuScore;
  const remainingTurns = 10 - gameState.currentTurn;

  // Strategy rules (priority order):

  // 1. If behind by a lot (>15 points), play high card
  if (cpuScore < playerScore - 15) {
    return getRandomFromTop3(availableCards);
  }

  // 2. If ahead by a lot (>15 points), save high cards
  if (cpuScore > playerScore + 15) {
    return getRandomFromBottom3(availableCards);
  }

  // 3. If last 3 turns, play aggressively
  if (remainingTurns <= 3 && cpuScore <= playerScore) {
    return Math.max(...availableCards);
  }

  // 4. Default: Play middle-range card with randomness
  const middleCards = availableCards.filter(c => c >= 4 && c <= 6);
  if (middleCards.length > 0) {
    return randomChoice(middleCards);
  }

  // 5. Fallback: Random card
  return randomChoice(availableCards);
}
```

### Scoring Logic

```javascript
function resolveRound(playerCard, cpuCard) {
  const totalPoints = playerCard + cpuCard;

  if (playerCard > cpuCard) {
    return {
      winner: 'player',
      playerPoints: totalPoints,
      cpuPoints: 0,
      message: `You win ${totalPoints} points!`
    };
  } else if (cpuCard > playerCard) {
    return {
      winner: 'cpu',
      playerPoints: 0,
      cpuPoints: totalPoints,
      message: `CPU wins ${totalPoints} points!`
    };
  } else {
    // Tie: No points awarded (or could split points)
    return {
      winner: 'tie',
      playerPoints: 0,
      cpuPoints: 0,
      message: `Tie! No points awarded.`
    };
  }
}
```

### High Score Management

```javascript
// Save high score (higher is better for Nine)
function saveHighScore(score) {
  const currentBest = loadHighScore();

  if (currentBest === null || score > currentBest) {
    storageService.save('bgc_nine-game_highscore', score);
    return true; // New record!
  }

  return false;
}

// Load high score
function loadHighScore() {
  return storageService.loadNumber('bgc_nine-game_highscore');
}
```

---

## Technical Architecture

### File Structure

```
browser-game-collection/
├── games/
│   └── nine-module.html                    # Game entry point
├── src/
│   ├── js/
│   │   └── controllers/
│   │       └── NineGameController.js       # Game logic
│   ├── css/
│   │   └── games/
│   │       └── nine-game.css               # Game styles
│   └── assets/
│       └── images/
│           └── thumbnails/
│               └── nine-game.svg           # Thumbnail (red/black cards)
└── docs/
    └── design/
        └── games/
            └── nine-game-design.md         # This document
```

### Dependencies

**Reused Components:**
- `GameController.js` - Base class for game controllers
- `GameDataService.js` - LocalStorage persistence
- `Modal.js` - Result modal display
- `common.css` - Shared styles and design system
- `footer.css` - Site footer

**New Files:**
- `NineGameController.js` - Nine-specific game logic
- `nine-game.css` - Card design, layout, animations
- `nine-module.html` - Game page with SEO
- `nine-game.svg` - Thumbnail image

### Module Interface

```javascript
// NineGameController.js
class NineGameController extends GameController {
  constructor(gameDataService) {
    super('nine-game', gameDataService);
  }

  // Lifecycle methods (from GameController)
  async init()           // Load data, render, start game
  startGame()            // Initialize new game
  endGame()              // Handle game completion
  resetGame()            // Reset to initial state

  // Nine-specific methods
  renderCards()          // Draw all cards
  handleCardClick(card)  // Player selects card
  handleConfirm()        // Player confirms selection
  cpuSelectCard()        // CPU strategy
  revealCards()          // Card flip animation
  resolveRound()         // Determine winner, update scores
  nextTurn()             // Advance to next turn
  checkGameComplete()    // Check if 9 turns done
}
```

---

## SEO Implementation

### Required Meta Tags

```html
<meta name="description" content="Play Nine, a strategic card game inspired by manga Ten. Use cards 1-9 wisely to outscore the CPU opponent. Free browser game, no download required.">
<meta name="keywords" content="nine card game, ten manga game, strategy card game, number cards, free online game, brain game">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://naolab-webgames.github.io/browser-game-collection/games/nine-module.html">
<meta property="og:title" content="Nine - Strategic Card Game">
<meta property="og:description" content="Strategic card game inspired by manga Ten. Use cards 1-9 to outscore your opponent!">
<meta property="og:image" content="https://naolab-webgames.github.io/browser-game-collection/src/assets/images/thumbnails/nine-game.svg">
<meta property="og:site_name" content="Naolab Browser Games">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://naolab-webgames.github.io/browser-game-collection/games/nine-module.html">
<meta name="twitter:title" content="Nine - Strategic Card Game">
<meta name="twitter:description" content="Strategic card game inspired by manga Ten. Use cards 1-9 to outscore your opponent!">
<meta name="twitter:image" content="https://naolab-webgames.github.io/browser-game-collection/src/assets/images/thumbnails/nine-game.svg">
```

### Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Nine",
  "description": "Strategic card game where players use cards numbered 1-9 to outscore opponents. Inspired by the card game from manga Ten.",
  "url": "https://naolab-webgames.github.io/browser-game-collection/games/nine-module.html",
  "image": "https://naolab-webgames.github.io/browser-game-collection/src/assets/images/thumbnails/nine-game.svg",
  "gamePlatform": "Web Browser",
  "genre": "Strategy",
  "playMode": "SinglePlayer",
  "publisher": {
    "@type": "Organization",
    "name": "Naoto Lab"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

---

## Testing Checklist

### Functional Tests

- [ ] Game loads without errors
- [ ] All 9 player cards displayed correctly (1-9)
- [ ] Cards alternate red/black colors correctly
- [ ] Player can click cards to select
- [ ] Selected card shows visual feedback
- [ ] "Confirm" button disabled until card selected
- [ ] "Confirm" button enabled after selection
- [ ] Player can change selection before confirming
- [ ] CPU takes 1 second to select after player confirms
- [ ] Both cards revealed simultaneously with animation
- [ ] Correct winner determined (higher card wins)
- [ ] Points calculated correctly (sum of both cards)
- [ ] Scores update in real-time
- [ ] Used cards marked unavailable
- [ ] Turn counter increments correctly (1/9 → 2/9 → ... → 9/9)
- [ ] Turn order alternates correctly
- [ ] Game ends after exactly 9 turns
- [ ] Result modal shows correct final scores
- [ ] High score saved to LocalStorage
- [ ] High score persists after page refresh
- [ ] "New Record!" badge shows when appropriate
- [ ] "New Game" button resets game completely
- [ ] "Back to Home" navigates to index page

### Edge Cases

- [ ] Player tries to click used card (should ignore)
- [ ] Player tries to click during reveal phase (should be locked)
- [ ] Tie on card value (no points awarded or split)
- [ ] Perfect game (winning all 9 turns)
- [ ] Worst game (losing all 9 turns)
- [ ] Close game (1-point difference)
- [ ] First time playing (no high score, shows "--")

### Visual Tests

- [ ] Card flip animation smooth (60fps)
- [ ] Score update animations visible
- [ ] Layout responsive on various screen sizes
- [ ] Cards readable on mobile devices
- [ ] Turn indicator clearly visible
- [ ] Modal appears centered and readable

### Performance Tests

- [ ] Page load < 1 second
- [ ] No console errors
- [ ] No memory leaks (play 10 games in a row)
- [ ] Animations don't block UI

---

## Implementation Priority

**Priority 1 (Core Gameplay):**
1. NineGameController.js - Game logic
2. nine-game.css - Card design and layout
3. nine-module.html - Game page structure

**Priority 2 (Polish):**
4. nine-game.svg - Thumbnail image
5. Animations and transitions
6. Sound effects (optional)

**Priority 3 (Future Enhancements):**
- Difficulty selection (Easy/Medium/Hard)
- Game history/statistics
- Multiplayer mode (local or online)
- Tournament mode (best of 3/5)
- Card back design customization

---

## Known Limitations

1. **CPU Strategy**: Medium difficulty only (no Easy/Hard modes initially)
2. **Single Player Only**: No multiplayer support in v1
3. **No Undo**: Once confirmed, card selection is final
4. **Fixed Rules**: No rule variations (e.g., tie handling, bonus points)

---

## Future Enhancements

### Phase 2 Features
- **Difficulty Levels**: Easy (random), Medium (current), Hard (near-optimal play)
- **Statistics Page**: Win rate, average score, cards used most
- **Achievements**: "Perfect Game", "Comeback King", "Close Call"
- **Tutorial Mode**: Interactive guide for new players

### Phase 3 Features
- **Local Multiplayer**: Two humans on same device
- **AI Personalities**: Aggressive, Defensive, Balanced styles
- **Custom Rules**: Point multipliers, special cards, bonus turns
- **Leaderboard**: Global high scores (requires backend)

---

## Approval & Sign-off

**Requirements Gathered**: 2026-02-27
**Requirements Approved By**: User
**Status**: Ready for Implementation

**Implementation Team**: Claude Sonnet 4.5 + User
**Expected Files**: 4 files (HTML, JS, CSS, SVG)
**Testing Method**: Local browser testing before deployment
**Deployment**: After user approval (per CLAUDE.md rules)

---

## References

- **CLAUDE.md**: Development rules and workflow
- **module-design.md**: Architecture and patterns
- **data-design.md**: LocalStorage schemas
- **Manga "Ten"**: Original inspiration for Nine game

---

**Document Version**: 1.0
**Last Updated**: 2026-02-27
