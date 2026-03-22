/**
 * GameCard.js
 * Reusable game card component for top page
 */

/**
 * Create game card element
 * @param {object} game - Game metadata
 * @param {number|null} highScore - High score to display
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Game card element
 */
export function createGameCard(game, highScore, onClick) {
  const card = document.createElement('article');
  card.className = 'game-card';
  card.setAttribute('data-game-id', game.id);

  // Build card HTML
  card.innerHTML = `
    <div class="game-card__thumbnail">
      <img src="${game.thumbnail}"
           alt="${game.title}"
           onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22380%22 height=%22214%22%3E%3Crect width=%22380%22 height=%22214%22 fill=%22%233498db%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22%3E${game.title}%3C/text%3E%3C/svg%3E'"
           loading="lazy">
    </div>
    <div class="game-card__content">
      <h3 class="game-card__title">${game.title}</h3>
      <div class="game-card__difficulty">
        ${renderDifficulty(game.difficulty)}
      </div>
      <p class="game-card__description">${game.description}</p>
      <div class="game-card__meta">
        <span>⏱ ${game.estimatedTime}</span>
        <span>🏆 Best: ${formatHighScore(game.id, highScore)}</span>
      </div>
      <button class="game-card__button">PLAY NOW</button>
    </div>
  `;

  // Attach event listener
  const button = card.querySelector('.game-card__button');
  button.addEventListener('click', (e) => {
    e.preventDefault();
    onClick(game);
  });

  return card;
}

/**
 * Render difficulty stars
 * @param {string} difficulty - "easy", "normal", "medium", "hard", or range like "easy - hard"
 * @returns {string} HTML string with stars
 */
function renderDifficulty(difficulty) {
  // Handle range difficulty (e.g. "easy - hard")
  if (difficulty && difficulty.includes(' - ')) {
    return `<span class="stars">★☆☆～★★★</span> ${capitalize(difficulty)}`;
  }
  const levels = { easy: 1, normal: 2, medium: 2, hard: 3 };
  const stars = levels[difficulty] || 1;
  const filled = '★'.repeat(stars);
  const empty = '☆'.repeat(3 - stars);
  return `<span class="stars">${filled}${empty}</span> ${capitalize(difficulty)}`;
}

/**
 * Format high score based on game type
 * @param {string} gameId - Game ID
 * @param {number|null} highScore - High score value
 * @returns {string} Formatted high score
 */
function formatHighScore(gameId, highScore) {
  if (highScore === null || highScore === undefined) {
    return '--';
  }

  // Memory Game: lower is better (moves)
  if (gameId === 'memory-game') {
    return `${highScore} moves`;
  }

  // Tic-Tac-Toe: show win/loss/draw stats
  if (gameId === 'tic-tac-toe') {
    if (typeof highScore === 'object') {
      return `W${highScore.wins || 0}/L${highScore.losses || 0}/D${highScore.draws || 0}`;
    }
    return '--';
  }

  // Whack-a-Mole: higher is better (points)
  if (gameId === 'whack-a-mole') {
    return `${highScore} pts`;
  }

  // Number Nine: lower is better (moves)
  if (gameId === 'number-nine') {
    return `${highScore} moves`;
  }

  // Runner Game: higher is better (distance in meters)
  if (gameId === 'runner-game') {
    return `${highScore}m`;
  }

  return String(highScore);
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
