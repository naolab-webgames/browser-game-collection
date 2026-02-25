# Naolab Browser Game Collection

A collection of classic browser-based games built with modern web technologies. Play instantly in your browser - no downloads or installations required!

🎮 **Live Demo**: [https://naolab-webgames.github.io/browser-game-collection/](https://naolab-webgames.github.io/browser-game-collection/index-module.html)

## 🎯 Features

- **Three Fun Games**: Memory Game, Tic-Tac-Toe, and Whack-a-Mole
- **No Registration**: Play instantly without creating an account
- **Offline Progress**: Game scores and statistics saved locally on your device
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern Tech Stack**: Built with modern JavaScript and CSS3
- **Privacy-Focused**: No data collection, all saves are client-side only

## 🎲 Available Games

### Memory Game
- Match pairs of cards to win
- 8×2 grid layout with smooth flip animations
- Track your best score (minimum moves)
- Difficulty: Easy

### Tic-Tac-Toe
- Classic X's and O's gameplay
- Play against intelligent CPU opponent (medium difficulty)
- Choose your symbol (X or O)
- Track wins, losses, and draws
- Difficulty: Easy

### Whack-a-Mole
- Fast-paced arcade action
- 30-second time limit
- Random mole spawning with varied intervals
- "Hit!!" visual feedback animation
- Track your high score
- Difficulty: Easy

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local HTTP server
- (Optional) Email for contact form setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/browser-game-collection.git
cd browser-game-collection
```

2. Start a local HTTP server:

**Option 1: Python 3**
```bash
python -m http.server 8000
```

**Option 2: Node.js with http-server**
```bash
npx http-server -p 8000
```

**Option 3: PHP**
```bash
php -S localhost:8000
```

3. Open your browser and navigate to:
```
http://localhost:8000/index-module.html
```

4. Contact form is already configured:

The contact form uses [Formspree.io](https://formspree.io/) (free service) to handle form submissions without a backend server.

**Current Setup:**
- Form endpoint: `https://formspree.io/f/xzdaywee`
- Submissions go to: `labnaoto@gmail.com`
- Monthly limit: 50 submissions (free plan)
- No additional setup needed - ready to use!

**To create your own Formspree form:**

a. Create a free account at [Formspree.io](https://formspree.io/)

b. Create a new form in the dashboard

c. Copy your form endpoint (e.g., `https://formspree.io/f/xxxxx`)

d. Update `contact.html` line 183:
```html
<form action="https://formspree.io/f/YOUR-FORM-ID" method="POST" class="contact-form">
```

**Formspree Features:**
- Spam protection (reCAPTCHA)
- Email notifications
- Form submissions dashboard
- File uploads support
- Custom redirect after submission

## 📁 Project Structure

```
browser-game-collection/
├── games/                          # Game HTML entry points
│   ├── memory-game-module.html
│   ├── tic-tac-toe-module.html
│   └── whack-a-mole-module.html
├── src/
│   ├── assets/
│   │   └── data/
│   │       ├── games.json          # Game metadata
│   │       └── site-config.json    # Site configuration
│   ├── css/
│   │   ├── common.css              # Shared styles (typography, colors, buttons)
│   │   ├── footer.css              # Footer styles
│   │   ├── top-page.css            # Homepage styles
│   │   └── games/
│   │       ├── memory-game.css
│   │       ├── tic-tac-toe.css
│   │       └── whack-a-mole.css
│   └── js/
│       ├── controllers/            # Game logic controllers
│       │   ├── GameController.js   # Base controller class
│       │   ├── MemoryGameController.js
│       │   ├── TicTacToeController.js
│       │   ├── WhackAMoleController.js
│       │   └── TopPageController.js
│       ├── core/                   # Core services
│       │   ├── StorageService.js   # LocalStorage wrapper
│       │   ├── GameDataService.js  # Game data management
│       │   └── ConfigLoader.js     # JSON config loader
│       ├── ui/                     # UI components
│       │   ├── Modal.js            # Result modal component
│       │   └── GameCard.js         # Game card component
│       └── utils/
│           └── helpers.js          # Utility functions (shuffle, etc.)
├── index-module.html               # Homepage
├── about.html                      # About page
├── contact.html                    # Contact page
├── privacy-policy.html             # Privacy policy
├── terms-of-service.html           # Terms of service
├── sitemap.xml                     # SEO sitemap
└── README.md                       # This file
```

## 🏗️ Architecture

### Modular Design
The project uses modern JavaScript modules for clean, maintainable code:
- **Controllers**: Game logic and state management
- **Services**: Data persistence (LocalStorage) and configuration
- **Components**: Reusable UI elements (Modal, GameCard)
- **Utilities**: Shared helper functions

### Design Patterns
- **MVC Pattern**: Separation of game logic (Controller), data (Service), and UI (HTML/CSS)
- **Singleton Pattern**: StorageService and GameDataService
- **Class Inheritance**: GameController base class extended by game-specific controllers
- **Component-Based UI**: Reusable Modal and GameCard components

### Data Storage
All game data is stored locally using browser LocalStorage:
- Memory Game: High score (minimum moves)
- Tic-Tac-Toe: Win/loss/draw statistics
- Whack-a-Mole: High score (maximum points)

Storage keys use the format: `bgc_{game-id}_{data-type}`

## 🎨 Technologies Used

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with CSS Grid, Flexbox, custom properties, and animations
- **JavaScript**: Modules, classes, async/await, arrow functions
- **LocalStorage API**: Client-side data persistence
- **Google AdSense**: Non-intrusive advertising (ready for integration)

## 📱 Browser Support

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## 🛠️ Development

### Adding a New Game

1. Create game design document in `docs/design/games/`
2. Implement controller extending `GameController`:
```javascript
import GameController from './GameController.js';

export default class MyGameController extends GameController {
  constructor(gameDataService) {
    super('my-game-id', gameDataService);
  }

  async init() { /* ... */ }
  startGame() { /* ... */ }
  endGame() { /* ... */ }
  resetGame() { /* ... */ }
}
```
3. Create game-specific CSS in `src/css/games/`
4. Create HTML entry point in `games/`
5. Add game metadata to `src/assets/data/games.json`
6. Update sitemap.xml

### Code Style

- Use modern JavaScript features (const/let, arrow functions, template literals)
- Follow existing naming conventions (camelCase for variables, PascalCase for classes)
- Add JSDoc comments for functions
- Keep functions small and focused

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Naoto Lab**
- Website: Naolab Browser Game Collection
- Contact: See [Contact Page](contact.html)

## 🙏 Acknowledgments

- Inspired by classic arcade and casual games
- Built with modern web standards
- Designed for accessibility and user privacy

## 📞 Support

For questions, feedback, or bug reports, please visit our [Contact Page](contact.html).

## 🗺️ Roadmap

Future improvements planned:
- [ ] Additional games (Snake, Tetris, Breakout)
- [ ] Leaderboards and achievements
- [ ] Multiplayer game modes
- [ ] Customizable themes
- [ ] Sound effects and music
- [ ] Game difficulty levels

---

**Enjoy the games!** 🎮

Made with ❤️ by Naoto Lab | © 2026 Naolab Browser Game Collection
