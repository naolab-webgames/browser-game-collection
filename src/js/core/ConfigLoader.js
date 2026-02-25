/**
 * ConfigLoader.js
 * Loads and caches external JSON configuration files
 */

class ConfigLoader {
  /**
   * Constructor
   */
  constructor() {
    // Cache for loaded configurations
    this.cache = {
      siteConfig: null,
      gamesData: null
    };
  }

  /**
   * Load site configuration
   * @returns {Promise<object>} Site config object
   */
  async loadSiteConfig() {
    // Return cached if available
    if (this.cache.siteConfig) {
      return this.cache.siteConfig;
    }

    try {
      const response = await fetch('/src/assets/data/site-config.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const config = await response.json();
      this.cache.siteConfig = config;
      return config;
    } catch (error) {
      console.error('Failed to load site config, using defaults:', error);
      const defaultConfig = this.getDefaultSiteConfig();
      this.cache.siteConfig = defaultConfig;
      return defaultConfig;
    }
  }

  /**
   * Load games metadata
   * @returns {Promise<object>} Games data object with games array
   */
  async loadGamesData() {
    // Return cached if available
    if (this.cache.gamesData) {
      return this.cache.gamesData;
    }

    try {
      const response = await fetch('/src/assets/data/games.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache and return the data object
      this.cache.gamesData = data;
      return data;
    } catch (error) {
      console.error('Failed to load games data:', error);
      this.showWarning('Failed to load games list. Please refresh the page.');
      return { games: [] };
    }
  }

  /**
   * Get default site config (fallback)
   * @returns {object} Default configuration
   */
  getDefaultSiteConfig() {
    return {
      site: {
        title: 'Naolab\'s Free Browser Games Collection',
        description: 'Play fun and casual games right in your browser',
        version: '1.0.0',
        language: 'en',
        author: 'Your Name',
        keywords: ['browser games', 'free games', 'casual games']
      },
      features: {
        adsEnabled: true,
        soundEnabled: false,
        darkModeEnabled: false,
        responsiveEnabled: false
      },
      ads: {
        provider: 'Google AdSense',
        showOnTopPage: true,
        showBeforeGame: true,
        showAfterGame: true,
        skipDelay: 5
      },
      storage: {
        provider: 'localStorage',
        prefix: 'bgc_'
      }
    };
  }

  /**
   * Show warning to user
   * @param {string} message - Warning message
   */
  showWarning(message) {
    console.warn(message);
    // Could show UI notification here if Notification component is available
  }

  /**
   * Clear cached data (useful for development/testing)
   */
  clearCache() {
    this.cache.siteConfig = null;
    this.cache.gamesData = null;
  }
}

// Export singleton instance
export const configLoader = new ConfigLoader();
