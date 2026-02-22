/**
 * Modal.js
 * Reusable modal dialog component
 */

export default class Modal {
  /**
   * Constructor
   * @param {string} id - Modal element ID
   */
  constructor(id) {
    this.id = id;
    this.modalElement = document.getElementById(id);

    if (!this.modalElement) {
      console.warn(`Modal element with ID "${id}" not found. Creating dynamically.`);
      this.create();
    }
  }

  /**
   * Show modal
   * @param {string} title - Modal title
   * @param {string|HTMLElement} content - Modal content (HTML string or element)
   * @param {Array<object>} buttons - Button configuration [{label, onClick, primary}]
   */
  show(title, content, buttons = []) {
    if (!this.modalElement) {
      console.error('Modal element not available');
      return;
    }

    // Set title
    const titleElement = this.modalElement.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }

    // Set content
    const contentElement = this.modalElement.querySelector('.modal-body') ||
                           this.modalElement.querySelector('.modal-content > *:not(.modal-title):not(.modal-buttons)');
    if (contentElement) {
      if (typeof content === 'string') {
        contentElement.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        contentElement.innerHTML = '';
        contentElement.appendChild(content);
      }
    }

    // Set buttons
    const buttonsContainer = this.modalElement.querySelector('.modal-buttons');
    if (buttonsContainer && buttons.length > 0) {
      buttonsContainer.innerHTML = '';

      buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.textContent = buttonConfig.label;
        button.className = buttonConfig.primary ? 'btn-primary' : 'btn-secondary';

        button.addEventListener('click', () => {
          if (buttonConfig.onClick) {
            buttonConfig.onClick();
          }
        });

        buttonsContainer.appendChild(button);
      });
    }

    // Show modal
    this.modalElement.classList.remove('hidden');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide modal
   */
  hide() {
    if (!this.modalElement) {
      return;
    }

    this.modalElement.classList.add('hidden');

    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Create modal element dynamically
   */
  create() {
    const modal = document.createElement('div');
    modal.id = this.id;
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <h2 class="modal-title"></h2>
        <div class="modal-body"></div>
        <div class="modal-buttons"></div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalElement = modal;

    // Close on overlay click (optional)
    const overlay = modal.querySelector('.modal-overlay');
    overlay.addEventListener('click', () => this.hide());
  }

  /**
   * Check if modal is currently visible
   * @returns {boolean} True if modal is visible
   */
  isVisible() {
    return this.modalElement && !this.modalElement.classList.contains('hidden');
  }
}
