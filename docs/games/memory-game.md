# Memory Game (神経衰弱) - Game Requirements

## Game Overview
A card-matching memory game where players flip cards to find matching pairs.

---

## 1. Game Specifications ✅

### 1.1 Basic Information
| Item | Specification |
|------|---------------|
| Game ID | memory-game |
| Game Name | Memory Game |
| Category | Puzzle |
| Difficulty | Easy |
| Estimated Play Time | 1-2 minutes |
| Number of Cards | 16 cards (8 pairs) |
| Card Design | Numbers (1-8) |
| Layout | 2×8 grid (horizontal layout) |

### 1.2 Game Features
- Card flip animation with CSS transitions
- Move counter display
- No time limit (relaxed play style)
- Auto flip-back for mismatched cards after 1 second
- High score tracking (minimum moves)

## 2. Game Rules ✅

### 2.1 Objective
Find all 8 matching pairs of cards with the minimum number of moves.

### 2.2 How to Play
1. Click on a face-down card to reveal its number
2. Click on a second card to reveal its number
3. If the two cards match (same number), they remain face-up
4. If the cards don't match, they automatically flip back face-down after 1 second
5. Continue until all pairs are found
6. Complete the game with the fewest moves possible

### 2.3 Win Condition
All 8 pairs of cards are successfully matched.

### 2.4 Game Constraints
- Only 2 cards can be flipped at a time
- Cannot flip already matched cards
- Cannot flip a third card until mismatched cards flip back

## 3. UI/UX Design ✅

### 3.1 Layout Structure
```
┌─────────────────────────────────────────────────┐
│  Memory Game                     Moves: 0       │
│  [Back to Home]                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ ? │ │ ? │ │ ? │ │ ? │ │ ? │ │ ? │ │ ? │ │ ? ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ ? │ │ ? │ │ ? │ │ ? │ │ ? │ │ ? │ │ ? │ │ ? ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.2 Card States
| State | Visual | Description |
|-------|--------|-------------|
| Face Down | "?" symbol or back design | Initial state, clickable |
| Flipping | Rotation animation | 0.3s CSS transition |
| Face Up | Number (1-8) | Revealed state |
| Matched | Number visible, dimmed or highlighted | Cannot be clicked |

### 3.3 Color Scheme
- Card back: Blue or neutral color
- Card front: White background with large number
- Matched cards: Green highlight or reduced opacity
- Active card: Yellow highlight during selection

### 3.4 Responsive Behavior
- Cards scale to fit screen width
- Maintain aspect ratio
- PC-optimized (1280x720 minimum)

## 4. Game Logic ✅

### 4.1 Game Flow
```
1. Initialize
   ↓
2. Shuffle cards
   ↓
3. Display all cards face-down
   ↓
4. Wait for player action
   ↓
5. Player clicks card → flip face-up
   ↓
6. Is this the first card?
   YES → Store card, wait for second card
   NO → Check if match
   ↓
7. Do cards match?
   YES → Keep face-up, increment matches
   NO → Flip both back after 1 second
   ↓
8. Increment move counter
   ↓
9. All pairs matched?
   YES → Game Complete
   NO → Return to step 4
```

### 4.2 Card Shuffling Algorithm
- Fisher-Yates shuffle algorithm
- Randomize positions at game start
- Ensure solvable configuration (always 8 pairs)

### 4.3 Match Detection
- Compare card values (numbers 1-8)
- Exact match required
- Update matched cards array

### 4.4 Move Counting
- Increment by 1 for each pair of cards flipped
- Count starts from 0
- Display in real-time

## 5. Scoring System ✅

### 5.1 Score Calculation
**Score = Number of Moves**

- Lower score is better
- Perfect game: 8 moves (each pair found on first try)
- Average game: 15-20 moves
- Score displayed at game end

### 5.2 High Score
- Track minimum moves (best score)
- Save to LocalStorage
- Display on game complete screen
- Key: `bgc_memory-game_highscore`

### 5.3 Performance Ranks (Optional Display)
| Moves | Rank |
|-------|------|
| 8-10 | Perfect |
| 11-15 | Excellent |
| 16-20 | Good |
| 21-30 | Fair |
| 31+ | Try Again |

## 6. Data Management ✅

### 6.1 LocalStorage Schema
```javascript
{
  "bgc_memory-game_highscore": 12,  // Minimum moves
  "bgc_memory-game_plays": 5         // Total play count (optional)
}
```

### 6.2 Game State (In-Memory)
```javascript
{
  cards: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8],  // Shuffled
  flippedCards: [],          // Currently flipped card indices
  matchedPairs: [],          // Matched card indices
  moves: 0,                  // Move counter
  isLocked: false            // Prevent clicks during flip-back
}
```

### 6.3 Data Operations
- **Save high score**: On game complete, if current moves < saved high score
- **Load high score**: On page load, display on UI
- **Reset data**: Optional feature for future

## 7. Performance Requirements ✅

### 7.1 Load Time
- Page load: < 1 second
- All assets (HTML/CSS/JS): < 50KB total

### 7.2 Runtime Performance
- Card flip animation: 60fps (smooth)
- Click response: < 50ms
- Memory usage: < 20MB

### 7.3 Browser Compatibility
- Chrome, Edge, Firefox, Safari (latest 2 versions)
- CSS Grid support required
- LocalStorage API required

### 7.4 Accessibility
- Cards have aria-label for screen readers
- Keyboard navigation: Tab to move, Enter to flip
- Focus indicators visible

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed and committed
  - Game Specifications: 16 cards, 2×8 grid, number design
  - Game Rules: Match pairs, move counting, no time limit
  - UI/UX Design: Card states, animations, layout
  - Game Logic: Flow, shuffling, match detection
  - Scoring: Move-based scoring, high score tracking
  - Data Management: LocalStorage schema
  - Performance: Load time, runtime, compatibility
