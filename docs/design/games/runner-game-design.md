# Runner Game - Requirements & Design Document

## Document Information

- **Game Name**: Runner Game (ランナーゲーム)
- **Game Type**: Horizontal Scrolling Action Game
- **Created**: 2026-02-27
- **Status**: Requirements Approved, Ready for Implementation

---

## Game Overview

### Concept

スティックマンを操作して500mのコースを走り抜けるアクションゲーム。地面の障害物、落とし穴、段差、空中の障害物など、様々な障害をジャンプで回避しながらゴールを目指します。

### Core Gameplay

1. キャラクター（スティックマン）が画面左側を一定速度で走り続ける
2. 背景とコースが右から左へスクロール
3. スペースキーでジャンプして障害物を回避
4. 500m走りきるとゴール（ステージクリア）
5. 障害物に当たるか穴に落ちるとゲームオーバー

---

## Requirements Specification

### Functional Requirements

#### FR-1: キャラクター制御
- スティックマン（棒人間）デザイン
- 走るアニメーション（足を動かす）
- ジャンプアニメーション（放物線を描く）
- スペースキーでジャンプ（ホールド不可、1回押し＝1ジャンプ）
- ジャンプ高さ: 固定（約2-3キャラクター分）
- ジャンプ時間: 約0.5-0.7秒
- 地面着地後のみ次のジャンプ可能（空中2段ジャンプ不可）

#### FR-2: スクロールシステム
- 横スクロール速度: 一定（秒速約10m相当）
- キャラクターは画面左側1/4の位置に固定
- 背景・地面・障害物が右から左へ流れる
- スクロール速度は変化しない（難易度調整なし）

#### FR-3: 障害物システム

**1. 地面の障害物（岩、箱）**
- 高さ: キャラクターの約1-1.5倍
- ジャンプで飛び越える
- 接触するとゲームオーバー
- 出現頻度: 高め

**2. 落とし穴**
- 幅: キャラクターの約2-4倍
- ジャンプで飛び越える
- 落ちるとゲームオーバー（落下アニメーション）
- 出現頻度: 中程度

**3. 段差（階段、坂）**
- 高さ: 地面より1段高い（ジャンプで登る）
- 登れなかった場合、画面左端に押し出されてゲームオーバー
- 出現頻度: 低め

**4. 空中の障害物（鳥）**
- 高さ: 地面から約1.5-2キャラクター分
- ジャンプの頂点付近に位置
- タイミングを見てジャンプで避ける、またはジャンプせず下をくぐる
- 出現頻度: 低め

**障害物配置ルール**:
- ランダム配置だが、必ずクリア可能な配置
- 連続する障害物間には適切な間隔
- 開始100mは障害物少なめ（練習区間）
- 後半（300m以降）は障害物密度増加

#### FR-4: 距離・スコアシステム
- 走行距離をリアルタイム表示（1m単位）
- 目標: 500m
- ゴール到達でステージクリア
- ハイスコア: 最長到達距離（例: 450m地点でゲームオーバー）
- LocalStorageに保存

#### FR-5: ゲームオーバー条件
- 地面の障害物に衝突
- 落とし穴に落下
- 空中の障害物に衝突
- 段差を登れず画面左端に押し出される

#### FR-6: ゲーム終了・結果表示
- ゲームオーバー時:
  - 到達距離表示
  - ハイスコア表示
  - 新記録の場合「New Record!」バッジ
  - リトライボタン、ホームボタン
- ゴール時:
  - 「Goal!」表示
  - クリアタイム表示（オプション）
  - 「Next Challenge」（将来的な拡張用）

#### FR-7: UI表示
- 現在の走行距離（画面上部）
- ハイスコア（最長距離記録）
- ゴールまでの残り距離
- 簡易説明（開始前）: 「SPACE to Jump」

### Non-Functional Requirements

#### NFR-1: Performance
- 60 FPS での滑らかなアニメーション
- スクロール遅延なし
- キー入力の即時反応

#### NFR-2: Visual Design
- シンプルでミニマルなデザイン
- 背景: 青空と地面
- キャラクター: 黒のスティックマン
- 障害物: 識別しやすい色・形状
- レトロ風のドット絵スタイル（オプション）

#### NFR-3: Accessibility
- キーボード操作のみ（スペースキー1つ）
- 画面サイズに応じたレスポンシブ対応
- 色覚異常者にも識別しやすい配色

#### NFR-4: Browser Compatibility
- Modern browsers: Chrome, Firefox, Edge, Safari
- Canvas API使用
- requestAnimationFrame使用

---

## User Interface Design

### Game Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│  Distance: 245m  |  Best: 450m  |  Goal: 500m           │ ← Header
├─────────────────────────────────────────────────────────┤
│                                                           │
│                      🐦 ← Bird (flying)                  │
│                                                           │
│                                                           │
│          🏃 ← Stickman (running)                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │ ← Ground
│                    📦     ⛰️      [  ]                   │ ← Obstacles
│                          (pit)                            │
└─────────────────────────────────────────────────────────┘
```

### Character States
1. **Running** - 地面を走る（足を動かすアニメーション）
2. **Jumping** - 空中に浮いている（放物線軌道）
3. **Falling** - 穴に落ちる（ゲームオーバー）
4. **Dead** - 障害物に衝突（ゲームオーバー）

### Color Scheme
- **Sky**: #87CEEB (水色)
- **Ground**: #8B4513 (茶色)
- **Stickman**: #000000 (黒)
- **Obstacles**: #696969 (灰色)
- **Pit**: #000000 (黒、穴）
- **Bird**: #FFD700 (金色)

---

## Game Logic & Algorithms

### State Management

```javascript
state = {
  // Game state
  gameState: 'ready', // ready | running | gameover | goal

  // Player data
  player: {
    x: 100,           // Fixed X position (screen left 1/4)
    y: 0,             // Y position (0 = ground)
    velocityY: 0,     // Vertical velocity
    isJumping: false,
    isGrounded: true
  },

  // Scroll & distance
  scrollOffset: 0,    // Total scrolled distance
  distance: 0,        // Current distance in meters
  scrollSpeed: 5,     // Pixels per frame (~10m/s)

  // Obstacles
  obstacles: [],      // Array of obstacle objects

  // Score
  bestDistance: null, // High score (longest distance)

  // Physics
  gravity: 0.6,
  jumpPower: -12,

  // Game loop
  animationId: null,
  lastFrameTime: 0
}
```

### Game Loop (requestAnimationFrame)

```javascript
function gameLoop(timestamp) {
  const deltaTime = timestamp - state.lastFrameTime;
  state.lastFrameTime = timestamp;

  if (state.gameState !== 'running') return;

  // 1. Update player physics
  updatePlayerPhysics();

  // 2. Update scroll
  state.scrollOffset += state.scrollSpeed;
  state.distance = Math.floor(state.scrollOffset / 10); // Convert to meters

  // 3. Update obstacles (move left, remove off-screen)
  updateObstacles();

  // 4. Generate new obstacles
  generateObstacles();

  // 5. Collision detection
  checkCollisions();

  // 6. Check goal
  if (state.distance >= 500) {
    handleGoal();
    return;
  }

  // 7. Render
  render();

  // 8. Continue loop
  state.animationId = requestAnimationFrame(gameLoop);
}
```

### Player Physics

```javascript
function updatePlayerPhysics() {
  // Apply gravity
  if (!state.player.isGrounded) {
    state.player.velocityY += state.gravity;
    state.player.y += state.player.velocityY;

    // Check ground collision
    if (state.player.y >= 0) {
      state.player.y = 0;
      state.player.velocityY = 0;
      state.player.isGrounded = true;
      state.player.isJumping = false;
    }
  }
}

function jump() {
  if (state.player.isGrounded) {
    state.player.velocityY = state.jumpPower;
    state.player.isGrounded = false;
    state.player.isJumping = true;
  }
}
```

### Obstacle Generation

```javascript
function generateObstacles() {
  // Generate obstacle when screen right is empty
  const lastObstacle = state.obstacles[state.obstacles.length - 1];
  const screenRight = state.scrollOffset + CANVAS_WIDTH;

  if (!lastObstacle || lastObstacle.x < screenRight - 200) {
    const type = getRandomObstacleType();
    const obstacle = createObstacle(type, screenRight);
    state.obstacles.push(obstacle);
  }
}

function getRandomObstacleType() {
  const distance = state.distance;

  // Early game: mostly ground obstacles
  if (distance < 100) {
    return Math.random() < 0.8 ? 'rock' : 'pit';
  }

  // Mid game: add variety
  if (distance < 300) {
    const rand = Math.random();
    if (rand < 0.4) return 'rock';
    if (rand < 0.7) return 'pit';
    if (rand < 0.85) return 'step';
    return 'bird';
  }

  // Late game: all types
  const rand = Math.random();
  if (rand < 0.3) return 'rock';
  if (rand < 0.5) return 'pit';
  if (rand < 0.7) return 'step';
  return 'bird';
}
```

### Collision Detection

```javascript
function checkCollisions() {
  const playerRect = {
    x: state.player.x,
    y: GROUND_Y - state.player.y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT
  };

  for (const obstacle of state.obstacles) {
    if (obstacle.x > playerRect.x + playerRect.width) continue;
    if (obstacle.x + obstacle.width < playerRect.x) continue;

    // Check type-specific collision
    if (obstacle.type === 'pit') {
      // Check if player is over pit and falling
      if (checkPitCollision(playerRect, obstacle)) {
        handleGameOver('Fell into pit');
        return;
      }
    } else {
      // Standard AABB collision
      if (checkAABBCollision(playerRect, obstacle)) {
        handleGameOver('Hit obstacle');
        return;
      }
    }
  }
}
```

### High Score Management

```javascript
function saveHighScore(distance) {
  const currentBest = loadHighScore();

  if (currentBest === null || distance > currentBest) {
    storageService.save('runner-game_highscore', distance);
    return true; // New record!
  }

  return false;
}

function loadHighScore() {
  return storageService.loadNumber('runner-game_highscore', null);
}
```

---

## Technical Architecture

### File Structure

```
browser-game-collection/
├── games/
│   └── runner-module.html              # Game entry point
├── src/
│   ├── js/
│   │   └── controllers/
│   │       └── RunnerGameController.js # Game logic
│   ├── css/
│   │   └── games/
│   │       └── runner-game.css         # Game styles
│   └── assets/
│       └── images/
│           └── thumbnails/
│               └── runner-game.svg     # Thumbnail
└── docs/
    └── design/
        └── games/
            └── runner-game-design.md   # This document
```

### Dependencies

**Reused Components:**
- `GameController.js` - Base class
- `GameDataService.js` - High score persistence
- `Modal.js` - Result modal
- `common.css` - Shared styles
- `footer.css` - Site footer

**New Files:**
- `RunnerGameController.js` - Game logic with Canvas rendering
- `runner-game.css` - Canvas container styles
- `runner-module.html` - Game page with SEO
- `runner-game.svg` - Thumbnail

### Canvas Implementation

```javascript
// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Rendering layers
function render() {
  // 1. Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Draw background (sky)
  drawBackground();

  // 3. Draw ground
  drawGround();

  // 4. Draw obstacles
  drawObstacles();

  // 5. Draw player
  drawPlayer();

  // 6. Draw UI overlay
  drawUI();
}
```

---

## SEO Implementation

### Required Meta Tags

```html
<meta name="description" content="Play Runner Game, an exciting endless runner where you jump over obstacles and pits. Test your reflexes and reach the goal! Free browser game.">
<meta name="keywords" content="runner game, endless runner, jumping game, obstacle course, action game, free online game, browser game">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://naolab-webgames.github.io/browser-game-collection/games/runner-module.html">
<meta property="og:title" content="Runner Game - Jump and Run to the Goal">
<meta property="og:description" content="Fast-paced running game! Jump over obstacles, avoid pits, and reach the 500m goal!">
<meta property="og:image" content="https://naolab-webgames.github.io/browser-game-collection/src/assets/images/thumbnails/runner-game.svg">
<meta property="og:site_name" content="Naolab Browser Games">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://naolab-webgames.github.io/browser-game-collection/games/runner-module.html">
<meta name="twitter:title" content="Runner Game - Jump and Run to the Goal">
<meta name="twitter:description" content="Fast-paced running game! Jump over obstacles, avoid pits, and reach the 500m goal!">
<meta name="twitter:image" content="https://naolab-webgames.github.io/browser-game-collection/src/assets/images/thumbnails/runner-game.svg">
```

### Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Runner Game",
  "description": "Horizontal scrolling action game where players control a stickman to jump over obstacles and reach the 500m goal.",
  "url": "https://naolab-webgames.github.io/browser-game-collection/games/runner-module.html",
  "image": "https://naolab-webgames.github.io/browser-game-collection/src/assets/images/thumbnails/runner-game.svg",
  "gamePlatform": "Web Browser",
  "genre": "Action",
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

**Player Control**
- [ ] Space key triggers jump
- [ ] Jump has correct height and duration
- [ ] Cannot jump while already jumping
- [ ] Player lands correctly on ground
- [ ] Running animation plays smoothly

**Scrolling**
- [ ] Background scrolls at constant speed
- [ ] Distance counter increases correctly
- [ ] Obstacles move from right to left

**Obstacles**
- [ ] Ground obstacles block player
- [ ] Pits cause game over when fallen into
- [ ] Steps can be jumped onto
- [ ] Birds can be avoided by jumping or ducking

**Collision Detection**
- [ ] Collision with ground obstacles triggers game over
- [ ] Falling into pit triggers game over
- [ ] Hitting bird triggers game over
- [ ] Successful jumps clear obstacles

**Game Flow**
- [ ] Game starts correctly
- [ ] 500m goal triggers completion
- [ ] Game over displays correctly
- [ ] High score saves to LocalStorage
- [ ] High score persists after reload
- [ ] New record badge shows when appropriate

### Edge Cases
- [ ] Rapid space key presses (no double jump)
- [ ] Jump at exact moment of collision
- [ ] Multiple obstacles on screen simultaneously
- [ ] First time playing (no high score)

### Performance Tests
- [ ] Consistent 60 FPS
- [ ] No lag during obstacle generation
- [ ] Canvas rendering smooth
- [ ] Memory usage stable over long play

---

## Implementation Priority

**Phase 1 (Core Gameplay):**
1. Canvas setup and game loop
2. Player character (stickman) with jump physics
3. Ground obstacles (rocks)
4. Basic collision detection
5. Distance tracking

**Phase 2 (Obstacles):**
6. Falling pits
7. Steps/platforms
8. Flying birds

**Phase 3 (Polish):**
9. Animations (running, jumping)
10. Visual effects
11. Sound effects (optional)
12. High score system

---

## Future Enhancements

### Phase 2 Features
- **Multiple stages**: 500m, 1000m, 2000m options
- **Power-ups**: Shield, double jump, slow motion
- **Different characters**: Various stickman designs
- **Day/Night cycle**: Visual variety

### Phase 3 Features
- **Endless mode**: Compete for longest distance
- **Speed increase**: Gradually faster gameplay
- **Leaderboard**: Global high scores
- **Achievements**: "First 500m", "Perfect run", etc.

---

## Approval & Sign-off

**Requirements Gathered**: 2026-02-27
**Requirements Approved By**: User
**Status**: Ready for Implementation

**Implementation Details**:
- Game Mode: Stage-based (500m goal)
- Control: Space key only
- Character: Stickman with running animation
- Obstacles: 4 types (ground, pit, step, bird)
- Speed: Constant
- High Score: Longest distance reached

---

## References

- **CLAUDE.md**: Development rules and workflow
- **module-design.md**: Architecture patterns
- **data-design.md**: LocalStorage schemas

---

**Document Version**: 1.0
**Last Updated**: 2026-02-27
