# Screen Design Document - Browser Game Collection

## Overview
This document defines the screen layouts, UI components, and visual design specifications for the Browser Game Collection website.

---

## 1. Common Design Elements ✅

### 1.1 Layout Structure

**Overall Page Structure:**
```
┌─────────────────────────────────────────────────┐
│                   HEADER                        │ ← 共通ヘッダー
├─────────────────────────────────────────────────┤
│                                                 │
│              MAIN CONTENT AREA                  │ ← ページごとに異なる
│            (max-width: 1200px)                  │
│                                                 │
├─────────────────────────────────────────────────┤
│                   FOOTER                        │ ← 共通フッター
└─────────────────────────────────────────────────┘
```

### 1.2 Header Design

**Structure:**
```
┌─────────────────────────────────────────────────┐
│  [Logo] Browser Games        [Home] [About]    │
└─────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 60px
- Background: Primary color (Blue gradient)
- Logo: Text-based "Browser Games" (left aligned)
- Navigation: Home link (right aligned, optional About link)
- Shadow: Subtle drop shadow for depth

### 1.3 Footer Design

**Structure:**
```
┌─────────────────────────────────────────────────┐
│  © 2026 Browser Games Collection                │
│  Made with ❤️ | Privacy Policy | Contact        │
└─────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 80px
- Background: Dark gray (#2c3e50)
- Text color: Light gray (#ecf0f1)
- Font size: 14px
- Center aligned

### 1.4 Color Palette

**Primary Colors:**
- Primary Blue: #3498db
- Primary Dark: #2980b9
- Primary Light: #5dade2

**Secondary Colors:**
- Success Green: #27ae60
- Warning Orange: #f39c12
- Danger Red: #e74c3c

**Neutral Colors:**
- Background: #ecf0f1 (light gray)
- Text: #2c3e50 (dark gray)
- Border: #bdc3c7 (medium gray)
- White: #ffffff

**Game-Specific Colors:**
- Memory Game: Blue (#3498db)
- Tic-Tac-Toe: Purple (#9b59b6)
- Whack-a-Mole: Green (#27ae60)

### 1.5 Typography

**Font Family:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Helvetica Neue', Arial, sans-serif;
```

**Font Sizes:**
- H1 (Page Title): 36px, font-weight: 700
- H2 (Section Title): 28px, font-weight: 600
- H3 (Subsection): 20px, font-weight: 600
- Body Text: 16px, font-weight: 400
- Small Text: 14px, font-weight: 400
- Button Text: 16px, font-weight: 600

**Line Height:**
- Headings: 1.2
- Body: 1.6

### 1.6 Button Styles

**Primary Button:**
```
┌──────────────────┐
│  PLAY NOW        │  ← Rounded corners (border-radius: 8px)
└──────────────────┘
```

**Specifications:**
- Padding: 12px 24px
- Border-radius: 8px
- Background: Primary Blue (#3498db)
- Text color: White
- Font-size: 16px
- Hover: Darken to #2980b9
- Active: Scale down slightly (transform: scale(0.98))
- Transition: all 0.2s ease

**Secondary Button:**
- Same as primary but with outlined style
- Border: 2px solid #3498db
- Background: transparent
- Text color: #3498db
- Hover: Fill with #3498db, text white

**Disabled Button:**
- Background: #bdc3c7
- Text color: #7f8c8d
- Cursor: not-allowed
- No hover effect

### 1.7 Card Component

**Game Card:**
```
┌─────────────────────────────────┐
│                                 │
│       [Thumbnail Image]         │ ← Aspect ratio 16:9
│                                 │
├─────────────────────────────────┤
│  Game Title                     │ ← Bold, 20px
│  Short description...           │ ← 14px, gray
│                                 │
│  High Score: 42                 │ ← 14px, blue
│                                 │
│      [PLAY]                     │ ← Button
└─────────────────────────────────┘
```

**Specifications:**
- Border-radius: 12px
- Background: White
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Hover: Lift effect (transform: translateY(-4px))
- Hover shadow: 0 4px 16px rgba(0,0,0,0.15)
- Transition: all 0.3s ease

### 1.8 Common UI Components

**Loading Indicator:**
- Spinner animation (CSS-based)
- Color: Primary Blue
- Size: 40px

**Modal/Popup:**
- Overlay: rgba(0,0,0,0.6)
- Container: White, centered, border-radius: 12px
- Shadow: 0 8px 32px rgba(0,0,0,0.3)

**Toast Notification:**
- Position: Top-right corner
- Background: Success/Warning/Error color
- Text: White
- Animation: Slide in from right, auto-dismiss after 3s

## 2. Top Page Design ✅

### 2.1 Overall Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Browser Games                           [Home]      │ ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Free Browser Games Collection                       │  │ ← Hero Section
│  │  Play fun and casual games right in your browser.   │  │
│  │  No downloads required!                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────[Advertisement Banner]───────────────────┐  │ ← Ad (optional)
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  GAMES                              │   │ ← Games Section
│  ├─────────────────────────────────────────────────────┤   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                      │   │
│  │  │Game 1│  │Game 2│  │Game 3│   ← 3-column grid   │   │
│  │  │Card  │  │Card  │  │Card  │                      │   │
│  │  └──────┘  └──────┘  └──────┘                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  © 2026 Browser Games Collection                            │ ← Footer
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Hero Section

**Content:**
- Site Title: "Free Browser Games Collection" (H1, 36px)
- Tagline: "Play fun and casual games right in your browser. No downloads required!"
- Background: Gradient (light blue to white)
- Padding: 40px 20px
- Text alignment: Center

**Specifications:**
```html
<section class="hero">
  <h1>Free Browser Games Collection</h1>
  <p class="tagline">Play fun and casual games right in your browser.<br>
     No downloads required!</p>
</section>
```

### 2.3 Advertisement Banner

**Position:** Below hero section, above games grid
**Type:** Banner ad (728x90 or responsive)
**Implementation:** Google AdSense placeholder
**Margin:** 24px top and bottom

### 2.4 Games Grid Section

**Layout:**
- 3-column grid on desktop (1200px container)
- Gap between cards: 24px
- Each card width: ~380px (calculated: (1200 - 48) / 3)

**Grid CSS:**
```css
.games-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
```

### 2.5 Game Card Detail

**Structure:**
```
┌─────────────────────────────────┐
│  ┌──────────────────────────┐  │
│  │                          │  │ ← Thumbnail (16:9)
│  │   [Game Thumbnail]       │  │   Height: 214px
│  │                          │  │
│  └──────────────────────────┘  │
│                                 │
│  Memory Game                    │ ← Title (20px, bold)
│  ★★★☆☆ Easy                    │ ← Difficulty
│                                 │
│  Find matching pairs of cards   │ ← Description
│  by flipping them over. Test    │   (14px, 2 lines max)
│  your memory!                   │
│                                 │
│  ⏱ 1-2 min  │  🏆 Best: 12     │ ← Metadata
│                                 │
│        [PLAY NOW]               │ ← CTA Button
└─────────────────────────────────┘
```

**Card Specifications:**
- Width: 100% (flex to grid)
- Height: Auto (content-based)
- Border-radius: 12px
- Background: White
- Padding: 16px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Hover shadow: 0 4px 16px rgba(0,0,0,0.15)
- Hover transform: translateY(-4px)

**Thumbnail:**
- Aspect ratio: 16:9
- Object-fit: cover
- Border-radius: 8px (top corners)
- Background: Placeholder color if no image

**Title:**
- Font-size: 20px
- Font-weight: 700
- Color: #2c3e50
- Margin: 12px 0 8px 0

**Difficulty Badge:**
- Display: inline-block
- Font-size: 14px
- Color: #7f8c8d
- Stars + text label

**Description:**
- Font-size: 14px
- Color: #7f8c8d
- Line-height: 1.5
- Max lines: 2 (overflow: ellipsis)
- Margin: 8px 0

**Metadata Row:**
- Display: flex
- Justify-content: space-between
- Font-size: 14px
- Color: #3498db
- Icons + text

**Play Button:**
- Width: 100%
- Margin-top: 16px
- See button styles in section 1.6

### 2.6 Responsive Behavior (PC only)

**1200px+ (Desktop):**
- 3-column grid
- Full features

**1024px - 1199px (Small Desktop):**
- 2-column grid
- Container padding: 16px

**Note:** Mobile/tablet support is not included in initial release

## 3. Game Screen Common Design ✅

### 3.1 Overall Game Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Browser Games                 [Back to Home]        │ ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Game Title                   Score: 0    Time: 30s  │  │ ← Game Header
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                                                       │  │
│  │              GAME PLAY AREA                          │  │ ← Game Canvas
│  │           (Game-specific layout)                     │  │
│  │                                                       │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Retry]  [Pause]  [Settings]                        │  │ ← Game Controls
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  © 2026 Browser Games Collection                            │ ← Footer
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Game Header Bar

**Structure:**
```
┌────────────────────────────────────────────────────────┐
│  Memory Game           Score: 12      Best: 8    ⏱ 0s │
└────────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 60px
- Background: White
- Border-bottom: 2px solid #ecf0f1
- Display: flex
- Justify-content: space-between
- Align-items: center
- Padding: 0 24px

**Game Title (Left):**
- Font-size: 24px
- Font-weight: 700
- Color: Game theme color

**Score/Stats (Right):**
- Display: flex
- Gap: 24px
- Font-size: 18px
- Font-weight: 600

**Score Display:**
- Label: "Score:" or "Moves:" or "Wins:"
- Value: Large number
- Color: #2c3e50

**High Score Display:**
- Label: "Best:"
- Value: Number
- Color: #3498db

**Timer Display (if applicable):**
- Icon: ⏱
- Value: Time remaining
- Color: Normal (green) / Warning (orange, < 10s) / Critical (red, < 5s)

### 3.3 Game Play Area

**Container:**
- Max-width: 800px (most games)
- Margin: 40px auto
- Padding: 24px
- Background: White (or game-specific)
- Border-radius: 12px
- Box-shadow: 0 4px 16px rgba(0,0,0,0.1)

**Note:** Each game has its own specific layout (see individual game designs)

### 3.4 Game Controls Bar

**Structure:**
```
┌────────────────────────────────────────────────────────┐
│  [← Back to Home]         [Retry]  [Pause]  [Help]    │
└────────────────────────────────────────────────────────┘
```

**Specifications:**
- Position: Below game area or sticky bottom
- Display: flex
- Justify-content: space-between
- Padding: 16px 24px
- Background: #f8f9fa

**Back Button:**
- Text: "← Back to Home"
- Style: Secondary button (outlined)
- Position: Left

**Action Buttons:**
- Position: Right
- Display: flex
- Gap: 12px

**Retry Button:**
- Icon: ↻
- Text: "Retry"
- Action: Reset current game

**Pause Button (if applicable):**
- Icon: ⏸/▶
- Text: "Pause" / "Resume"
- Action: Pause/resume game timer

**Help Button (optional):**
- Icon: ?
- Text: "Help"
- Action: Show game rules modal

### 3.5 Game Result Modal

**Structure:**
```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗  │
│  ║                                   ║  │
│  ║        🎉 Game Complete! 🎉       ║  │
│  ║                                   ║  │
│  ║      Your Score: 15               ║  │
│  ║      Best Score: 12               ║  │
│  ║                                   ║  │
│  ║      ⭐ NEW RECORD! ⭐           ║  │ ← If high score
│  ║                                   ║  │
│  ║   [Play Again]  [Back to Home]   ║  │
│  ║                                   ║  │
│  ║   [Advertisement Space]           ║  │ ← Post-game ad
│  ║                                   ║  │
│  ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘
```

**Specifications:**
- Overlay: rgba(0,0,0,0.7)
- Modal width: 500px
- Background: White
- Border-radius: 16px
- Padding: 32px
- Text-align: center
- Animation: Fade in + scale up

**Title:**
- Font-size: 32px
- Font-weight: 700
- Color: #27ae60 (success)
- Margin-bottom: 24px

**Score Display:**
- Font-size: 48px
- Font-weight: 800
- Color: #3498db
- Margin: 16px 0

**New Record Badge:**
- Display: Only if high score beaten
- Animation: Pulse/glow effect
- Color: Gold (#f39c12)
- Font-size: 20px

**Buttons:**
- Display: flex
- Justify-content: center
- Gap: 16px
- Margin-top: 24px

**Advertisement:**
- Position: Bottom of modal
- Type: Banner or small display ad
- Margin-top: 24px

### 3.6 Pre-Game Advertisement Screen

**Structure:**
```
┌─────────────────────────────────────────┐
│                                         │
│     [Advertisement Display Area]        │
│           (Google AdSense)              │
│                                         │
│       Loading game in 5 seconds...      │
│                                         │
│            [Skip Ad] (after 5s)         │
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- Full-screen overlay or modal
- Background: White or semi-transparent
- Ad container: Center aligned
- Skip button: Appears after 5 seconds
- Auto-close: After skip or timeout
- Loading indicator: Progress bar or countdown

## 4. Advertisement Display Design ✅

### 4.1 Ad Placement Strategy

**Placement Locations:**
1. Top Page: Banner ad below hero section
2. Pre-Game: Interstitial ad before game starts
3. Post-Game: Ad in result modal
4. (Future) Sidebar: Display ad on game screens

### 4.2 Top Page Banner Ad

**Position:** Between hero section and games grid
**Size:** 728x90 (Leaderboard) or Responsive
**Implementation:**
```html
<div class="ad-container">
  <!-- Google AdSense code here -->
</div>
```

**Styling:**
```css
.ad-container {
  max-width: 728px;
  margin: 24px auto;
  padding: 16px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
}
```

### 4.3 Pre-Game Interstitial Ad

**Trigger:** When user clicks "PLAY" button on game card
**Display:** Full-screen overlay with ad
**Duration:** 5 seconds (then skip button appears)
**Dismissal:** Auto-dismiss after skip or 10 second timeout

**Layout:**
```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗  │
│  ║                                   ║  │
│  ║   [Advertisement Display]         ║  │ ← Google AdSense
│  ║   (300x250 or responsive)         ║  │
│  ║                                   ║  │
│  ║   Starting game in 5 seconds...   ║  │
│  ║   ████░░░░ 50%                    ║  │ ← Progress bar
│  ║                                   ║  │
│  ║   [Skip Ad]  (appears after 5s)   ║  │
│  ║                                   ║  │
│  ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘
```

### 4.4 Post-Game Result Ad

**Position:** Bottom of game result modal
**Size:** 300x250 (Medium Rectangle) or 320x50 (Mobile Banner)
**Timing:** Displays immediately with result
**Note:** Does not block "Play Again" or "Back to Home" buttons

### 4.5 Ad Styling Standards

**Container Styling:**
```css
.ad-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.ad-container::before {
  content: "Advertisement";
  display: block;
  font-size: 12px;
  color: #95a5a6;
  text-align: center;
  margin-bottom: 8px;
}
```

**Ad Placeholder (Development):**
- Background: Light gray
- Text: "Ad Placeholder" centered
- Same dimensions as actual ads

## 5. Design Specifications ✅

### 5.1 Spacing System

**Base Unit:** 8px

**Spacing Scale:**
- xs: 4px (0.5 unit)
- sm: 8px (1 unit)
- md: 16px (2 units)
- lg: 24px (3 units)
- xl: 32px (4 units)
- xxl: 48px (6 units)

**Usage:**
- Padding inside components: sm-md
- Margin between components: md-lg
- Section spacing: xl-xxl

### 5.2 Border Radius System

**Radius Scale:**
- Small: 4px (inputs, small buttons)
- Medium: 8px (buttons, badges)
- Large: 12px (cards, modals)
- XLarge: 16px (major containers)
- Round: 50% (circles, pills)

### 5.3 Shadow System

**Elevation Levels:**

**Level 1 (Subtle):**
```css
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
```
Usage: Inputs, subtle borders

**Level 2 (Card):**
```css
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
```
Usage: Cards at rest

**Level 3 (Card Hover):**
```css
box-shadow: 0 4px 16px rgba(0,0,0,0.15);
```
Usage: Cards on hover

**Level 4 (Modal):**
```css
box-shadow: 0 8px 32px rgba(0,0,0,0.3);
```
Usage: Modals, overlays

### 5.4 Animation Standards

**Transition Timing:**
- Fast: 0.15s (button press, small UI changes)
- Normal: 0.3s (hover effects, card animations)
- Slow: 0.5s (page transitions, major changes)

**Easing Functions:**
- Default: ease (general purpose)
- ease-out: For entrances
- ease-in: For exits
- ease-in-out: For transformations

**Example Transitions:**
```css
/* Button hover */
transition: all 0.2s ease;

/* Card hover */
transition: transform 0.3s ease, box-shadow 0.3s ease;

/* Modal entrance */
transition: opacity 0.3s ease-out, transform 0.3s ease-out;
```

### 5.5 Accessibility Standards

**Color Contrast:**
- Text on background: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

**Focus Indicators:**
```css
:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
```

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus visible at all times

**Screen Reader Support:**
- Semantic HTML elements (header, main, nav, etc.)
- ARIA labels for icons and interactive elements
- Alt text for all images

### 5.6 Responsive Breakpoints

**Desktop (Primary Target):**
- Large Desktop: 1200px+
- Small Desktop: 1024px - 1199px

**Not Supported (Initial Release):**
- Tablet: 768px - 1023px
- Mobile: < 768px

### 5.7 Icon System

**Source:** Unicode characters or simple SVG icons
**Size:** 16px (small), 24px (medium), 32px (large)

**Common Icons:**
- ⏱ Timer
- 🏆 Trophy/High Score
- ↻ Retry/Refresh
- ⏸ Pause
- ▶ Play
- ? Help
- ✕ Close
- ← Back
- ⭐ Star (rating)

### 5.8 Loading States

**Spinner:**
```
   ⌛
Loading...
```

**Progress Bar:**
```
████░░░░ 50%
```

**Skeleton Screen:**
- Animated gradient placeholder
- Matches final content layout
- Smooth transition to actual content

### 5.9 Error States

**Error Message:**
- Background: #ffe6e6 (light red)
- Border: 2px solid #e74c3c
- Icon: ✕ or ⚠
- Text color: #c0392b

**Example:**
```
┌────────────────────────────────────┐
│  ⚠ Error: Failed to load game     │
│     Please try again later.        │
│     [Retry]                        │
└────────────────────────────────────┘
```

### 5.10 Empty States

**No Games Available:**
```
┌────────────────────────────────────┐
│          🎮                        │
│   No games available yet           │
│   Check back soon!                 │
└────────────────────────────────────┘
```

**No High Score:**
- Display: "--" or "N/A"
- Encouraging text: "Play to set your first record!"

## 6. SEO Considerations ✅

### 6.1 HTML Meta Tags

**Every Page:**
```html
<head>
  <!-- Basic Meta Tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free Browser Games Collection - Play Fun Games Online</title>
  <meta name="description" content="Play fun and casual games right in your browser. No downloads required! Enjoy Memory Game, Tic-Tac-Toe, Whack-a-Mole and more free games.">
  <meta name="keywords" content="browser games, free games, casual games, online games, no download games">
  <meta name="author" content="Browser Games Collection">
  <link rel="canonical" href="https://yourdomain.github.io/">

  <!-- Open Graph (Social Media) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Free Browser Games Collection">
  <meta property="og:description" content="Play fun and casual games right in your browser. No downloads required!">
  <meta property="og:image" content="https://yourdomain.github.io/assets/og-image.png">
  <meta property="og:url" content="https://yourdomain.github.io/">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Free Browser Games Collection">
  <meta name="twitter:description" content="Play fun and casual games right in your browser.">
  <meta name="twitter:image" content="https://yourdomain.github.io/assets/og-image.png">
</head>
```

**Game-Specific Pages (Example: Memory Game):**
```html
<title>Memory Game - Free Online Card Matching Game | Browser Games</title>
<meta name="description" content="Test your memory with this classic card matching game. Find all 8 pairs with the fewest moves. Play free in your browser, no download needed.">
<meta name="keywords" content="memory game, card matching, concentration game, brain game, free online game">
<link rel="canonical" href="https://yourdomain.github.io/games/memory-game.html">

<!-- Open Graph -->
<meta property="og:title" content="Memory Game - Free Online Card Matching">
<meta property="og:description" content="Test your memory with this classic card matching game.">
<meta property="og:url" content="https://yourdomain.github.io/games/memory-game.html">
```

### 6.2 Semantic HTML Structure

**Use Proper HTML5 Elements:**
```html
<!-- Top Page -->
<header>
  <nav>
    <a href="/">Browser Games</a>
    <a href="#games">Games</a>
  </nav>
</header>

<main>
  <section class="hero">
    <h1>Free Browser Games Collection</h1>
    <p>Play fun and casual games right in your browser.</p>
  </section>

  <section id="games" class="games-section">
    <h2>Available Games</h2>
    <div class="games-grid">
      <article class="game-card">
        <h3>Memory Game</h3>
        <p>Find matching pairs...</p>
      </article>
    </div>
  </section>
</main>

<footer>
  <p>&copy; 2026 Browser Games Collection</p>
</footer>
```

**Heading Hierarchy:**
- H1: Only one per page (page title)
- H2: Major sections (e.g., "Available Games", "Game Rules")
- H3: Game titles in cards, subsections
- Maintain logical hierarchy (no skipping levels)

### 6.3 URL Structure

**Clean, Descriptive URLs:**
- Top Page: `https://yourdomain.github.io/`
- Game Pages: `https://yourdomain.github.io/games/memory-game.html`
- About Page: `https://yourdomain.github.io/about.html`

**URL Naming Rules:**
- Use lowercase only
- Use hyphens (-) to separate words (not underscores)
- Keep URLs short and descriptive
- Match game ID from games.json

### 6.4 Image Optimization

**Image Requirements:**
- File format: WebP (modern browsers), JPEG fallback
- Compression: Optimize with tools (TinyPNG, ImageOptim)
- Dimensions: Match display size (no oversized images)
- File size: < 100KB per image

**Image SEO:**
```html
<img src="assets/images/memory-game-thumbnail.webp"
     alt="Memory Game - Card matching puzzle with colorful cards"
     width="380"
     height="214"
     loading="lazy">
```

**Requirements:**
- Always include descriptive `alt` text
- Specify width and height to prevent layout shift
- Use `loading="lazy"` for images below the fold
- Descriptive file names (memory-game-thumbnail.webp, not img001.jpg)

### 6.5 Performance Optimization (SEO Impact)

**Core Web Vitals (Google Ranking Factors):**
- **LCP (Largest Contentful Paint)**: < 2.5s
  - Optimize hero images
  - Minimize CSS/JS blocking

- **FID (First Input Delay)**: < 100ms
  - Minimize JavaScript execution
  - Use code splitting if needed

- **CLS (Cumulative Layout Shift)**: < 0.1
  - Set image dimensions
  - Reserve space for ads
  - Avoid inserting content above existing content

**Performance Techniques:**
- Minify CSS and JavaScript
- Enable Gzip/Brotli compression (GitHub Pages automatic)
- Lazy load images and iframes
- Defer non-critical JavaScript
- Use browser caching (Cache-Control headers)

### 6.6 Structured Data (Schema.org)

**VideoGame Schema for Each Game:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Memory Game",
  "description": "Find matching pairs of cards by flipping them over. Test your memory!",
  "genre": "Puzzle",
  "url": "https://yourdomain.github.io/games/memory-game.html",
  "gamePlatform": "Web Browser",
  "author": {
    "@type": "Organization",
    "name": "Browser Games Collection"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "ratingCount": "100"
  }
}
</script>
```

**WebSite Schema for Top Page:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Browser Games Collection",
  "url": "https://yourdomain.github.io/",
  "description": "Play fun and casual games right in your browser. No downloads required!",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://yourdomain.github.io/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### 6.7 Sitemap and Robots.txt

**sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.github.io/</loc>
    <lastmod>2026-02-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.github.io/games/memory-game.html</loc>
    <lastmod>2026-02-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.github.io/games/tic-tac-toe.html</loc>
    <lastmod>2026-02-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.github.io/games/whack-a-mole.html</loc>
    <lastmod>2026-02-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /assets/
Disallow: /node_modules/

Sitemap: https://yourdomain.github.io/sitemap.xml
```

### 6.8 Content SEO Best Practices

**Text Content:**
- Minimum 300 words on top page (including game descriptions)
- Unique content for each game page
- Use target keywords naturally in content
- Include game instructions and rules on game pages

**Internal Linking:**
- Link from top page to all game pages
- Include "Back to Home" links on all game pages
- Use descriptive anchor text ("Play Memory Game" not "Click Here")

**External Linking:**
- Link to relevant external resources (optional)
- Use rel="noopener" for external links

### 6.9 Mobile-Friendly Considerations (Future)

**Viewport Meta Tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**Note:** Mobile support is not in initial release, but meta tag ensures Google doesn't penalize

**Google Mobile-Friendly Test:**
- Test URL after deployment
- Address any mobile usability issues in future iterations

### 6.10 Analytics and Search Console

**Google Search Console:**
- Submit sitemap.xml
- Monitor indexing status
- Check for crawl errors
- Track search performance

**Google Analytics (Optional):**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 6.11 SEO Checklist

**Before Launch:**
- [ ] All pages have unique title tags (50-60 characters)
- [ ] All pages have unique meta descriptions (150-160 characters)
- [ ] All images have descriptive alt text
- [ ] Sitemap.xml created and submitted
- [ ] Robots.txt configured
- [ ] Canonical URLs set on all pages
- [ ] Open Graph tags for social sharing
- [ ] Structured data (Schema.org) implemented
- [ ] Page load time < 3 seconds
- [ ] No broken links
- [ ] HTTPS enabled (GitHub Pages automatic)
- [ ] Google Search Console verified

**Ongoing:**
- [ ] Update sitemap when adding new games
- [ ] Monitor search rankings and traffic
- [ ] Update content based on analytics
- [ ] Build backlinks from gaming communities

---

**Update History**
- 2026-02-22: Template created
- 2026-02-22: All sections completed
  - Common Design Elements: Header, Footer, Colors, Typography, Buttons, Cards
  - Top Page Design: Hero section, Games grid, Card layout
  - Game Screen Common Design: Game header, Play area, Controls, Result modal
  - Advertisement Display: Pre-game, Post-game, Banner ads
  - Design Specifications: Spacing, Shadows, Animations, Accessibility
  - SEO Considerations: Meta tags, Structured data, Sitemap, Performance
