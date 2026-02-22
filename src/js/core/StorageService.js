/**
 * StorageService.js
 * Provides abstraction for LocalStorage operations with error handling
 */

class StorageService {
  /**
   * Constructor
   * @param {string} prefix - Prefix for all storage keys
   */
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
      console.error(`Failed to save to LocalStorage (key: ${key}):`, error);

      // Handle QuotaExceededError
      if (error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Consider clearing old data.');
      }

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
      console.error(`Failed to load from LocalStorage (key: ${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Load numeric value from LocalStorage
   * @param {string} key - Key without prefix
   * @param {number} defaultValue - Default value if key doesn't exist or is not a number
   * @returns {number} Stored number or defaultValue
   */
  loadNumber(key, defaultValue = 0) {
    const value = this.load(key, defaultValue);
    const number = Number(value);
    return isNaN(number) ? defaultValue : number;
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
      console.error(`Failed to remove from LocalStorage (key: ${key}):`, error);
      return false;
    }
  }

  /**
   * Clear all data with this service's prefix
   * @returns {boolean} Success status
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));

      prefixedKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error('Failed to clear LocalStorage:', error);
      return false;
    }
  }

  /**
   * Check if LocalStorage is available
   * @returns {boolean} True if LocalStorage is available and working
   */
  isAvailable() {
    try {
      const testKey = this.prefix + '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('LocalStorage is not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService('bgc_');
