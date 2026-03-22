/**
 * RunnerGameController.js
 * Horizontal scrolling action game - Run and jump to reach the goal
 */

import GameController from './GameController.js';
import Modal from '../ui/Modal.js';

// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_Y = 320;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 50;
const PLAYER_X = 100;

const GRAVITY = 0.6;
const JUMP_POWER = -13;
const SCROLL_SPEED = 5;
const GOAL_DISTANCE = 500; // 500 meters

export default class RunnerGameController extends GameController {
  constructor(gameDataService) {
    super('runner-game', gameDataService);

    this.canvas = null;
    this.ctx = null;

    this.state = {
      gameState: 'ready', // ready | running | gameover | goal | falling | hit

      // Player
      player: {
        x: PLAYER_X,
        y: 0,
        velocityY: 0,
        isJumping: false,
        isGrounded: true,
        animFrame: 0, // For running animation
        isFalling: false, // Falling into pit
        fallOffset: 0 // How far fallen into pit
      },

      // Scroll & distance
      scrollOffset: 0,
      distance: 0,
      scrollSpeed: SCROLL_SPEED,

      // Obstacles
      obstacles: [],
      nextObstacleDistance: 10, // First obstacle at 10m

      // Score
      bestDistance: null,

      // Game loop
      animationId: null,
      lastFrameTime: 0,
      frameCount: 0,
      flashCount: 0 // For hit flash animation
    };
  }

  /**
   * Initialize game
   */
  async init() {
    // Load high score
    this.state.bestDistance = this.gameDataService.loadRunnerGameHighScore();

    // Get canvas
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    // Setup event listeners
    this.setupCommonListeners();
    this.setupGameListeners();

    // Update displays
    this.updateDistanceDisplay();
    this.updateBestDisplay();

    // Draw initial screen
    this.drawStartScreen();
  }

  /**
   * Setup game-specific event listeners
   */
  setupGameListeners() {
    // Space key for jump
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state.gameState === 'ready') {
          this.startGame();
        } else if (this.state.gameState === 'running') {
          this.jump();
        }
      }
    });

    // Click/tap for jump (mobile support)
    this.canvas.addEventListener('click', () => {
      if (this.state.gameState === 'ready') {
        this.startGame();
      } else if (this.state.gameState === 'running') {
        this.jump();
      }
    });
  }

  /**
   * Start new game
   */
  startGame() {
    // Reset state
    this.state.gameState = 'running';
    this.state.player.y = 0;
    this.state.player.velocityY = 0;
    this.state.player.isJumping = false;
    this.state.player.isGrounded = true;
    this.state.player.isFalling = false; // Reset falling state
    this.state.player.fallOffset = 0; // Reset fall offset
    this.state.scrollOffset = 0;
    this.state.distance = 0;
    this.state.obstacles = [];
    this.state.nextObstacleDistance = 10; // First obstacle at 10m
    this.state.lastFrameTime = performance.now();
    this.state.frameCount = 0;
    this.state.flashCount = 0; // Reset flash count

    // Start game loop
    this.gameLoop(performance.now());
  }

  /**
   * Jump action
   */
  jump() {
    if (this.state.player.isGrounded) {
      this.state.player.velocityY = JUMP_POWER;
      this.state.player.isGrounded = false;
      this.state.player.isJumping = true;
    }
  }

  /**
   * Main game loop
   */
  gameLoop(timestamp) {
    if (this.state.gameState !== 'running') return;

    const deltaTime = timestamp - this.state.lastFrameTime;
    this.state.lastFrameTime = timestamp;
    this.state.frameCount++;

    // Update physics
    this.updatePlayerPhysics();

    // Update scroll
    this.state.scrollOffset += this.state.scrollSpeed;
    this.state.distance = Math.floor(this.state.scrollOffset / 10);

    // Update obstacles
    this.updateObstacles();

    // Generate new obstacles
    this.generateObstacles();

    // Check collisions
    this.checkCollisions();

    // Check goal
    if (this.state.distance >= GOAL_DISTANCE) {
      this.handleGoal();
      return;
    }

    // Render
    this.render();

    // Update UI
    this.updateDistanceDisplay();

    // Continue loop
    this.state.animationId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  /**
   * Update player physics
   */
  updatePlayerPhysics() {
    if (!this.state.player.isGrounded) {
      // Apply gravity
      this.state.player.velocityY += GRAVITY;
      this.state.player.y -= this.state.player.velocityY; // Subtract to make positive Y go up

      // Check ground collision
      if (this.state.player.y <= 0) {
        this.state.player.y = 0;
        this.state.player.velocityY = 0;
        this.state.player.isGrounded = true;
        this.state.player.isJumping = false;
      }
    }

    // Update animation frame (for running)
    if (this.state.frameCount % 10 === 0) {
      this.state.player.animFrame = (this.state.player.animFrame + 1) % 4;
    }
  }

  /**
   * Update obstacles (move left, remove off-screen)
   */
  updateObstacles() {
    // Remove obstacles that are far behind the player
    this.state.obstacles = this.state.obstacles.filter(
      obs => obs.worldX + obs.width > this.state.scrollOffset - 100
    );
  }

  /**
   * Generate new obstacles
   */
  generateObstacles() {
    const currentDistance = this.state.distance;

    // Check if it's time to generate next obstacle
    if (currentDistance >= this.state.nextObstacleDistance) {
      const type = this.getRandomObstacleType();
      const obstacle = this.createObstacle(type);
      this.state.obstacles.push(obstacle);

      // Set next obstacle distance (15-35m ahead for more frequent obstacles)
      this.state.nextObstacleDistance = currentDistance + 15 + Math.random() * 20;
    }
  }

  /**
   * Get random obstacle type based on distance
   */
  getRandomObstacleType() {
    const distance = this.state.distance;

    // Early game (0-100m): mostly ground obstacles, no birds
    if (distance < 100) {
      const rand = Math.random();
      if (rand < 0.6) return 'rock';
      if (rand < 0.9) return 'pit';
      return 'step';
    }

    // Mid game (100-300m): add birds
    if (distance < 300) {
      const rand = Math.random();
      if (rand < 0.35) return 'rock';
      if (rand < 0.65) return 'pit';
      if (rand < 0.85) return 'step';
      return 'bird';
    }

    // Late game (300m+): all types with balanced distribution
    const rand = Math.random();
    if (rand < 0.3) return 'rock';
    if (rand < 0.55) return 'pit';
    if (rand < 0.75) return 'step';
    return 'bird';
  }

  /**
   * Create obstacle object
   */
  createObstacle(type) {
    // Store absolute position (world coordinates)
    const obstacle = {
      type: type,
      worldX: this.state.scrollOffset + CANVAS_WIDTH, // Absolute position in world
      passed: false
    };

    switch (type) {
      case 'rock':
        obstacle.y = GROUND_Y - 40;
        obstacle.width = 40;
        obstacle.height = 40;
        obstacle.color = '#696969';
        break;

      case 'pit':
        obstacle.y = GROUND_Y;
        obstacle.width = 60 + Math.random() * 40; // 60-100px wide
        obstacle.height = 100; // Deep pit
        obstacle.color = '#000000';
        break;

      case 'step':
        obstacle.y = GROUND_Y - 60;
        obstacle.width = 80;
        obstacle.height = 60;
        obstacle.color = '#8B4513';
        break;

      case 'bird':
        obstacle.y = GROUND_Y - 120; // Flying height
        obstacle.width = 30;
        obstacle.height = 20;
        obstacle.color = '#FFD700';
        break;
    }

    return obstacle;
  }

  /**
   * Check collisions
   */
  checkCollisions() {
    const playerRect = {
      x: this.state.player.x,
      y: GROUND_Y - this.state.player.y - PLAYER_HEIGHT,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };

    for (const obstacle of this.state.obstacles) {
      // Calculate obstacle's screen position
      const obstacleScreenX = obstacle.worldX - this.state.scrollOffset;

      // Skip if obstacle is behind player
      if (obstacleScreenX + obstacle.width < playerRect.x) {
        if (!obstacle.passed) {
          obstacle.passed = true;
        }
        continue;
      }

      // Skip if obstacle is far ahead
      if (obstacleScreenX > playerRect.x + playerRect.width) continue;

      // Create obstacle rect with screen position
      const obstacleRect = {
        x: obstacleScreenX,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height
      };

      // Check collision based on type
      if (obstacle.type === 'pit') {
        // Check if player is over pit and falling
        if (this.checkPitCollision(playerRect, obstacleRect)) {
          this.handleFallIntoPit(obstacleRect);
          return;
        }
      } else {
        // Standard AABB collision for rock, step, bird
        if (this.checkAABBCollision(playerRect, obstacleRect)) {
          this.handleHitObstacle();
          return;
        }
      }
    }
  }

  /**
   * Check AABB collision
   */
  checkAABBCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Check pit collision
   */
  checkPitCollision(playerRect, pit) {
    // Calculate how much of player is over the pit
    const playerCenter = playerRect.x + playerRect.width / 2;
    const playerLeft = playerRect.x;
    const playerRight = playerRect.x + playerRect.width;

    // Calculate overlap
    const overlapLeft = Math.max(playerLeft, pit.x);
    const overlapRight = Math.min(playerRight, pit.x + pit.width);
    const overlapWidth = Math.max(0, overlapRight - overlapLeft);

    // Player must be at least 60% over the pit to fall
    const overlapRatio = overlapWidth / playerRect.width;

    // Player is falling (not high enough to clear pit)
    const falling = playerRect.y + playerRect.height >= pit.y;

    return overlapRatio >= 0.6 && falling;
  }

  /**
   * Handle falling into pit
   */
  handleFallIntoPit(pit) {
    this.state.gameState = 'falling';
    this.state.player.isFalling = true;
    this.state.player.fallOffset = 0;

    // Animate falling
    this.animateFalling();
  }

  /**
   * Animate falling into pit
   */
  animateFalling() {
    const fallSpeed = 3;
    const maxFall = 100;

    const fall = () => {
      if (this.state.gameState !== 'falling') return;

      this.state.player.fallOffset += fallSpeed;
      this.render();

      if (this.state.player.fallOffset < maxFall) {
        requestAnimationFrame(fall);
      } else {
        this.handleGameOver('Fell into pit');
      }
    };

    requestAnimationFrame(fall);
  }

  /**
   * Handle hitting obstacle
   */
  handleHitObstacle() {
    this.state.gameState = 'hit';
    this.state.flashCount = 0;

    // Flash effect (6 times)
    const maxFlashes = 6;

    const flash = () => {
      if (this.state.flashCount < maxFlashes) {
        this.state.flashCount++;
        this.render();
        setTimeout(flash, 100);
      } else {
        this.handleGameOver('Hit obstacle');
      }
    };

    flash();
  }

  /**
   * Handle game over
   */
  handleGameOver(reason) {
    this.state.gameState = 'gameover';

    // Cancel animation loop
    if (this.state.animationId) {
      cancelAnimationFrame(this.state.animationId);
      this.state.animationId = null;
    }

    // Check and save high score
    const isNewRecord = this.checkAndSaveHighScore();

    // Show result modal
    setTimeout(() => {
      this.showResultModal({
        reason: reason,
        distance: this.state.distance,
        bestDistance: this.state.bestDistance,
        isNewRecord: isNewRecord
      });
    }, 500);
  }

  /**
   * Handle goal reached
   */
  handleGoal() {
    this.state.gameState = 'goal';

    // Cancel animation loop
    if (this.state.animationId) {
      cancelAnimationFrame(this.state.animationId);
      this.state.animationId = null;
    }

    // Save 500m as high score (if better)
    const isNewRecord = this.checkAndSaveHighScore();

    // Show goal modal
    setTimeout(() => {
      this.showGoalModal({
        distance: GOAL_DISTANCE,
        bestDistance: this.state.bestDistance,
        isNewRecord: isNewRecord
      });
    }, 500);
  }

  /**
   * Check and save high score
   */
  checkAndSaveHighScore() {
    const currentDistance = this.state.distance;
    const currentBest = this.state.bestDistance;

    if (currentBest === null || currentDistance > currentBest) {
      this.gameDataService.saveRunnerGameScore(currentDistance);
      this.state.bestDistance = currentDistance;
      this.updateBestDisplay();
      return true;
    }

    return false;
  }

  /**
   * Show result modal (game over)
   */
  showResultModal(result) {
    const content = this.buildGameOverContent(result);
    const buttons = this.buildModalButtons();

    if (!this.resultModal) {
      this.resultModal = new Modal('result-modal');
    }

    this.resultModal.show('Game Over!', content, buttons);
  }

  /**
   * Show goal modal
   */
  showGoalModal(result) {
    const content = this.buildGoalContent(result);
    const buttons = this.buildModalButtons();

    if (!this.resultModal) {
      this.resultModal = new Modal('result-modal');
    }

    this.resultModal.show('🎉 Goal Reached!', content, buttons);
  }

  /**
   * Build game over modal content
   */
  buildGameOverContent(result) {
    let html = '';

    if (result.isNewRecord) {
      html += '<div class="new-record">⭐ NEW RECORD! ⭐</div>';
    }

    html += `<p class="result-message">You ran ${result.distance}m!</p>`;

    html += '<div class="result-stats">';
    html += `
      <div class="stat-item">
        <span class="stat-label">Distance:</span>
        <span class="stat-value">${result.distance}m</span>
      </div>
    `;

    if (result.bestDistance !== null) {
      html += `
        <div class="stat-item">
          <span class="stat-label">Best Distance:</span>
          <span class="stat-value">${result.bestDistance}m</span>
        </div>
      `;
    }

    html += '</div>';
    html += '<div class="ad-container"><!-- Ad placement --></div>';

    return html;
  }

  /**
   * Build goal modal content
   */
  buildGoalContent(result) {
    let html = '';

    if (result.isNewRecord) {
      html += '<div class="new-record">⭐ NEW RECORD! ⭐</div>';
    }

    html += `<p class="result-message">Congratulations! You reached the ${GOAL_DISTANCE}m goal!</p>`;

    html += '<div class="result-stats">';
    html += `
      <div class="stat-item">
        <span class="stat-label">Goal Distance:</span>
        <span class="stat-value">${GOAL_DISTANCE}m</span>
      </div>
    `;

    if (result.bestDistance !== null) {
      html += `
        <div class="stat-item">
          <span class="stat-label">Best Distance:</span>
          <span class="stat-value">${result.bestDistance}m</span>
        </div>
      `;
    }

    html += '</div>';
    html += '<div class="ad-container"><!-- Ad placement --></div>';

    return html;
  }

  /**
   * Reset game
   */
  resetGame() {
    this.state.gameState = 'ready';
    this.drawStartScreen();
  }

  /**
   * End game
   */
  endGame() {
    if (this.state.animationId) {
      cancelAnimationFrame(this.state.animationId);
      this.state.animationId = null;
    }
    this.state.gameState = 'ready';
  }

  /**
   * Update distance display
   */
  updateDistanceDisplay() {
    const distanceEl = document.getElementById('distance-value');
    const remainingEl = document.getElementById('remaining-value');

    if (distanceEl) {
      distanceEl.textContent = `${this.state.distance}m`;
    }

    if (remainingEl) {
      const remaining = Math.max(0, GOAL_DISTANCE - this.state.distance);
      remainingEl.textContent = `${remaining}m`;
    }
  }

  /**
   * Update best distance display
   */
  updateBestDisplay() {
    const bestEl = document.getElementById('best-value');
    if (bestEl) {
      bestEl.textContent =
        this.state.bestDistance !== null ? `${this.state.bestDistance}m` : '--';
    }
  }

  /**
   * Render game frame
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    this.drawBackground();

    // Draw ground
    this.drawGround();

    // Draw obstacles
    this.drawObstacles();

    // Draw player
    this.drawPlayer();
  }

  /**
   * Draw background (sky)
   */
  drawBackground() {
    // Sky
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // Clouds (scrolling)
    this.ctx.fillStyle = '#FFFFFF';
    const cloudOffset = (this.state.scrollOffset * 0.3) % (CANVAS_WIDTH + 200);

    // Cloud 1
    this.drawCloud(CANVAS_WIDTH + 100 - cloudOffset, 50);
    this.drawCloud(100 - cloudOffset, 50);
    this.drawCloud(-200 - cloudOffset, 50);

    // Cloud 2
    this.drawCloud(CANVAS_WIDTH + 400 - cloudOffset, 80);
    this.drawCloud(400 - cloudOffset, 80);
    this.drawCloud(100 - cloudOffset, 80);
  }

  /**
   * Draw a single cloud
   */
  drawCloud(x, y) {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
    this.ctx.arc(x + 30, y, 25, 0, Math.PI * 2);
    this.ctx.arc(x + 60, y, 20, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw ground
   */
  drawGround() {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Ground line
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, GROUND_Y);
    this.ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    this.ctx.stroke();
  }

  /**
   * Draw obstacles
   */
  drawObstacles() {
    for (const obstacle of this.state.obstacles) {
      // Calculate screen position
      const screenX = obstacle.worldX - this.state.scrollOffset;

      // Skip if off-screen
      if (screenX + obstacle.width < 0 || screenX > CANVAS_WIDTH) continue;

      this.ctx.fillStyle = obstacle.color;

      if (obstacle.type === 'pit') {
        // Draw pit as black rectangle
        this.ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.type === 'bird') {
        // Draw bird as simple triangle
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, obstacle.y + obstacle.height / 2);
        this.ctx.lineTo(screenX + obstacle.width / 2, obstacle.y);
        this.ctx.lineTo(screenX + obstacle.width, obstacle.y + obstacle.height / 2);
        this.ctx.lineTo(screenX + obstacle.width / 2, obstacle.y + obstacle.height);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Draw rock/step as rectangle
        this.ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height);
      }
    }
  }

  /**
   * Draw player (stickman)
   */
  drawPlayer() {
    const x = this.state.player.x + PLAYER_WIDTH / 2;
    let y = GROUND_Y - this.state.player.y - PLAYER_HEIGHT;

    // If falling into pit, adjust y position
    if (this.state.player.isFalling) {
      y += this.state.player.fallOffset;
    }

    // Determine stroke color based on state
    let strokeColor = '#000000';
    let lineWidth = 3;

    if (this.state.player.isFalling) {
      // White outline when falling
      strokeColor = '#FFFFFF';
      lineWidth = 4;
    } else if (this.state.gameState === 'hit') {
      // Flash red when hit (alternating)
      strokeColor = this.state.flashCount % 2 === 0 ? '#FF0000' : '#000000';
      lineWidth = 4;
    }

    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = 'round';

    // Head
    this.ctx.beginPath();
    this.ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
    this.ctx.stroke();

    // Body
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 18);
    this.ctx.lineTo(x, y + 35);
    this.ctx.stroke();

    // Arms
    const armAngle = this.state.player.animFrame * 0.3;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 22);
    this.ctx.lineTo(x - 8, y + 28 + Math.sin(armAngle) * 3);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 22);
    this.ctx.lineTo(x + 8, y + 28 - Math.sin(armAngle) * 3);
    this.ctx.stroke();

    // Legs (running animation when grounded and not falling)
    if (this.state.player.isGrounded && !this.state.player.isFalling) {
      const legAngle = this.state.player.animFrame * 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + 35);
      this.ctx.lineTo(x - 5, y + 50 + Math.sin(legAngle) * 5);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(x, y + 35);
      this.ctx.lineTo(x + 5, y + 50 - Math.sin(legAngle) * 5);
      this.ctx.stroke();
    } else {
      // Legs together when jumping or falling
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + 35);
      this.ctx.lineTo(x - 3, y + 50);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(x, y + 35);
      this.ctx.lineTo(x + 3, y + 50);
      this.ctx.stroke();
    }
  }

  /**
   * Draw start screen
   */
  drawStartScreen() {
    // Clear canvas
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    this.drawBackground();
    this.drawGround();

    // Draw player in starting position
    this.drawPlayer();

    // Draw instructions
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Runner Game', CANVAS_WIDTH / 2, 100);

    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press SPACE or Click to Start', CANVAS_WIDTH / 2, 140);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#666666';
    this.ctx.fillText('Jump over obstacles and reach 500m!', CANVAS_WIDTH / 2, 170);
  }
}
