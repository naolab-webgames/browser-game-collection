/**
 * GameDataService.js
 * Handles game-specific data operations (high scores, statistics)
 */

import { storageService } from './StorageService.js';

class GameDataService {
  /**
   * Constructor
   * @param {StorageService} storage - Storage service instance
   */
  constructor(storage) {
    this.storage = storage;
  }

  // ====================
  // Memory Game Methods
  // ====================

  /**
   * Save Memory Game score
   * @param {number} moves - Number of moves made
   * @returns {boolean} True if new high score (lower is better)
   */
  saveMemoryGameScore(moves) {
    const currentBest = this.loadMemoryGameHighScore();

    // Lower is better for Memory Game
    if (currentBest === null || moves < currentBest) {
      this.storage.save('memory-game_highscore', moves);
      return true;  // New high score!
    }

    return false;  // Not a new record
  }

  /**
   * Load Memory Game high score
   * @returns {number|null} High score (minimum moves) or null if no score saved
   */
  loadMemoryGameHighScore() {
    const score = this.storage.load('memory-game_highscore', null);
    return score === null ? null : Number(score);
  }

  // ========================
  // Tic-Tac-Toe Methods
  // ========================

  /**
   * Save Tic-Tac-Toe game result
   * @param {string} result - 'win', 'loss', or 'draw'
   * @returns {boolean} Success status
   */
  saveTicTacToeResult(result) {
    const stats = this.loadTicTacToeStats();

    // Increment appropriate counter
    if (result === 'win') {
      stats.wins++;
    } else if (result === 'loss') {
      stats.losses++;
    } else if (result === 'draw') {
      stats.draws++;
    } else {
      console.error(`Invalid result: ${result}`);
      return false;
    }

    // Save updated stats
    return this.storage.save('tic-tac-toe_stats', stats);
  }

  /**
   * Load Tic-Tac-Toe statistics
   * @returns {object} Statistics object {wins, losses, draws}
   */
  loadTicTacToeStats() {
    return this.storage.load('tic-tac-toe_stats', {
      wins: 0,
      losses: 0,
      draws: 0
    });
  }

  // =======================
  // Whack-a-Mole Methods
  // =======================

  /**
   * Save Whack-a-Mole score
   * @param {number} score - Score achieved
   * @returns {boolean} True if new high score (higher is better)
   */
  saveWhackAMoleScore(score) {
    const currentBest = this.loadWhackAMoleHighScore();

    // Higher is better for Whack-a-Mole
    if (score > currentBest) {
      this.storage.save('whack-a-mole_highscore', score);
      return true;  // New high score!
    }

    return false;  // Not a new record
  }

  /**
   * Load Whack-a-Mole high score
   * @returns {number} High score (default 0)
   */
  loadWhackAMoleHighScore() {
    return this.storage.loadNumber('whack-a-mole_highscore', 0);
  }

  // ====================
  // Nine Game Methods
  // ====================

  /**
   * Save Nine Game score
   * @param {number} score - Score achieved
   * @returns {boolean} True if new high score (higher is better)
   */
  saveNineGameScore(score) {
    const currentBest = this.loadNineGameHighScore();

    // Higher is better for Nine Game
    if (currentBest === null || score > currentBest) {
      this.storage.save('nine-game_highscore', score);
      return true;  // New high score!
    }

    return false;  // Not a new record
  }

  /**
   * Load Nine Game high score
   * @returns {number|null} High score or null if no score saved
   */
  loadNineGameHighScore() {
    return this.storage.loadNumber('nine-game_highscore', null);
  }
}

// Export singleton instance
export const gameDataService = new GameDataService(storageService);
