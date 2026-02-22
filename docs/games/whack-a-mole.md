# Whack-a-Mole (もぐら叩き) - Game Requirements

## Game Overview
An action game where players click on moles that randomly appear from holes to score points within a time limit.

---

## 1. Game Specifications ✅

### 1.1 Basic Information
| Item | Specification |
|------|---------------|
| Game ID | whack-a-mole |
| Game Name | Whack-a-Mole |
| Category | Action |
| Difficulty | Easy |
| Estimated Play Time | 30 seconds |
| Number of Holes | 9 holes (3×3 grid) |
| Time Limit | 30 seconds |
| Mole Display Duration | 1 second |

### 1.2 Game Features
- Fast-paced clicking action game
- Random mole appearance pattern
- Real-time score and timer display
- High score tracking
- Simple visual feedback (mole disappears when hit)
- No penalty for misclicks

### 1.3 Gameplay Characteristics
- **Pace**: Fast and exciting
- **Difficulty**: Easy to understand, challenging to master
- **Replayability**: High (short duration encourages multiple plays)

## 2. Game Rules ✅

### 2.1 Objective
Click on as many moles as possible within the 30-second time limit to achieve the highest score.

### 2.2 How to Play
1. **Game Start**: Click "Start" button or game starts automatically
2. **Timer Starts**: 30-second countdown begins
3. **Moles Appear**: Moles randomly pop up from holes
4. **Click Moles**: Click on visible moles to score points
5. **Mole Disappears**: Hit moles disappear immediately
6. **Auto-Hide**: Moles that aren't hit disappear after 1 second
7. **Game End**: Timer reaches 0, final score is displayed

### 2.3 Scoring Rules
- **Hit Mole**: +1 point
- **Miss Click**: No penalty (clicking empty hole does nothing)
- **Auto-Disappear**: No penalty (mole disappears after 1 second)

### 2.4 Game Constraints
- Cannot stop timer once started
- Moles appear one at a time (no simultaneous moles initially)
- Each mole visible for exactly 1 second
- No extra time bonuses

## 3. UI/UX Design ✅

### 3.1 Layout Structure
```
┌─────────────────────────────────────────────────┐
│  Whack-a-Mole                                   │
│  [Back to Home]                                 │
│                                                 │
│  Score: 0                      Time: 30s        │
├─────────────────────────────────────────────────┤
│                                                 │
│              ┌─────┬─────┬─────┐                │
│              │  O  │     │     │                │
│              ├─────┼─────┼─────┤                │
│              │     │     │  O  │                │
│              ├─────┼─────┼─────┤                │
│              │     │  O  │     │                │
│              └─────┴─────┴─────┘                │
│                                                 │
│                [Start Game]                     │
│                                                 │
│           High Score: 15                        │
└─────────────────────────────────────────────────┘
```

### 3.2 Hole States
| State | Visual | Description |
|-------|--------|-------------|
| Empty | Dark circle/hole | No mole present, clickable but no effect |
| Mole Visible | Mole character/icon | Mole is up, clickable for points |
| Mole Hit | Brief flash or disappear | Visual feedback when hit |

### 3.3 Visual Elements
- **Holes**: 3×3 grid of circular holes
- **Mole**: Simple character (circle with eyes, or brown circle)
- **Score Display**: Large, prominent number
- **Timer**: Countdown display (30, 29, 28...)
- **High Score**: Displayed below game board

### 3.4 Visual Feedback
- **Mole Appears**: Pop-up animation (optional, or instant)
- **Mole Hit**: Immediate disappearance
- **Mole Miss**: Mole sinks back down after 1 second
- **Timer Warning**: Change color when < 10 seconds (red)

### 3.5 Color Scheme
- Background: Green (grass-like)
- Holes: Dark brown or black
- Moles: Brown or gray
- Score: Large blue or black text
- Timer: Green normally, red when < 10s

## 4. Game Logic ✅

### 4.1 Game Flow
```
1. Game Initialize
   ↓
2. Display Start Screen
   ↓
3. User clicks "Start" (or auto-start)
   ↓
4. Start 30-second timer
   ↓
5. Random Mole Spawning Loop:
   - Wait random interval (0.5-1.5 seconds)
   - Choose random hole (0-8)
   - Show mole in that hole
   - Start 1-second visibility timer
   ↓
6. User Input Handling:
   - Click on mole → Score +1, mole disappears
   - Click on empty hole → No effect
   ↓
7. Mole Auto-Hide:
   - After 1 second, hide mole if not clicked
   ↓
8. Timer Check:
   - If time > 0 → Continue loop (step 5)
   - If time = 0 → Game Over
   ↓
9. Game Over
   - Stop spawning moles
   - Display final score
   - Check and update high score
   - Show "Play Again" button
```

### 4.2 Mole Spawning Algorithm
**Random Appearance:**
- **Spawn Interval**: Random between 0.5-1.5 seconds
- **Hole Selection**: Random from 0-8 (3×3 grid)
- **Display Duration**: Exactly 1 second
- **Pattern**: Purely random (no difficulty scaling)

**Implementation:**
```javascript
function spawnMole() {
  if (gameActive && timeRemaining > 0) {
    const randomHole = Math.floor(Math.random() * 9);
    showMoleAt(randomHole);

    // Auto-hide after 1 second
    setTimeout(() => hideMoleAt(randomHole), 1000);

    // Schedule next mole
    const nextDelay = 500 + Math.random() * 1000; // 0.5-1.5s
    setTimeout(spawnMole, nextDelay);
  }
}
```

### 4.3 Click Detection
- Detect click on hole element
- Check if mole is currently visible in that hole
- If yes: Increment score, hide mole immediately
- If no: No action (no penalty)

### 4.4 Timer Management
- Countdown from 30 seconds
- Update display every second
- When reaches 0: End game
- Visual warning at 10 seconds remaining

## 5. Scoring System ✅

### 5.1 Score Calculation
**Simple Point System:**
- Each mole hit = +1 point
- No bonuses, no combos
- No penalties for misses

**Example Scores:**
- Beginner: 5-10 moles hit
- Average: 10-15 moles hit
- Expert: 15-20 moles hit

### 5.2 High Score
- Track highest score achieved
- Save to LocalStorage
- Display on game screen
- Update immediately after game ends if new record
- Key: `bgc_whack-a-mole_highscore`

### 5.3 Score Display
- Real-time update during gameplay
- Large, easy-to-read numbers
- Final score shown prominently at game end
- "New Record!" message if high score beaten

## 6. Data Management ✅

### 6.1 LocalStorage Schema
```javascript
{
  "bgc_whack-a-mole_highscore": 18,    // Best score
  "bgc_whack-a-mole_plays": 12          // Total games played (optional)
}
```

### 6.2 Game State (In-Memory)
```javascript
{
  holes: [false, false, false, false, false, false, false, false, false],  // Mole visible?
  score: 0,                    // Current score
  timeRemaining: 30,           // Seconds left
  gameActive: false,           // Game running?
  highScore: 0,                // Best score from storage
  timerInterval: null,         // Timer reference
  spawnTimeout: null           // Mole spawn reference
}
```

### 6.3 Data Operations
- **Save high score**: After game ends, if current score > saved score
- **Load high score**: On page load, display in UI
- **Update score**: Increment immediately when mole is hit
- **Reset game state**: On "Play Again"

## 7. Performance Requirements ✅

### 7.1 Load Time
- Page load: < 1 second
- All assets (HTML/CSS/JS): < 40KB total
- Mole images (if used): < 20KB total

### 7.2 Runtime Performance
- Click response: < 50ms
- Mole spawn timing: Accurate to ±50ms
- Timer accuracy: ±100ms acceptable
- Frame rate: 30fps minimum
- Memory usage: < 15MB

### 7.3 Timing Precision
- **Critical**: Mole visibility duration must be consistent (1 second ±50ms)
- **Important**: Spawn intervals should feel random but fair
- **Acceptable**: Timer can be slightly inaccurate (±100ms over 30s)

### 7.4 Browser Compatibility
- Chrome, Edge, Firefox, Safari (latest 2 versions)
- CSS Grid support required
- setTimeout/setInterval support required
- LocalStorage API required

### 7.5 Accessibility
- Holes have aria-label describing position
- Score and timer announced to screen readers
- Keyboard support: Tab to navigate, Space/Enter to "click" hole
- Focus indicators visible
- Color-blind friendly colors

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed and committed
  - Game Specifications: 9 holes (3×3), 30 second time limit, 1 second mole display
  - Game Rules: Click moles for points, no penalties, random spawning
  - UI/UX Design: 3×3 grid layout, score and timer display
  - Game Logic: Random spawning (0.5-1.5s intervals), click detection
  - Scoring: Simple +1 per mole hit, high score tracking
  - Data Management: LocalStorage schema
  - Performance: Load time, timing precision, compatibility
