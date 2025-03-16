# Match-3 RPG Game

A modern match-3 puzzle game with RPG elements, built with React, TypeScript, and Vite. This project was initiated using Lovable and continued development with Cursor, embracing the vibe-coding style.

## Features

### Core Gameplay
- Match 3 or more tiles of the same color to clear them
- Tiles cascade down to fill empty spaces
- Special matches of 4 or more tiles create powerful effects
- Multiple tile colors with unique effects:
  - Red/Purple: Deal damage to enemy
  - Green: Heal the player
  - Blue: Gain experience points
  - Yellow: Earn gold
  - Grey: Triple value multiplier

### Special Tiles
- Bomb tiles: Explode in a 2-tile radius when matched
- Bolt tiles: Clear all tiles of the same color from the board

### Combo System
Two different combo modes:
1. Per-Color Mode (5-second timer)
   - Each color has its own combo multiplier
   - Matching the same color consecutively increases its multiplier
   - Timer resets to 5 seconds with each match
   - Multipliers reset when timer expires

2. Unified Mode (3-second timer)
   - Single combo multiplier for all colors
   - Any match increases the global multiplier
   - Timer resets to 3 seconds with each match
   - Multiplier resets when timer expires

### RPG Elements
- Level progression system
- Player health and enemy health management
- Experience points and leveling up
- Enemy combat with periodic attacks
- Gold accumulation
- Base block value increases with levels
- Enemy scaling with increased health and damage

### Visual Effects
- Level up animations
- Enemy defeat animations
- Attack warnings
- Combo timers
- Match highlighting
- Score tracking

## Development

This project is built with modern web technologies and follows best practices for game development. The codebase is organized into components and utilities for maintainability and extensibility.

### Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd match-3-rpg
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Development Options

You can develop this project using:
- Your preferred IDE or code editor
- GitHub Codespaces
- Direct GitHub web editor

### Deployment

You can deploy this project using any static site hosting service:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### Key Files
- `src/hooks/useGameState.tsx`: Core game logic and state management
- `src/utils/gameUtils.ts`: Game mechanics and utility functions
- `src/components/`: UI components and game elements

## Technologies Used
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui

## Game Controls
- Click or tap to select a tile
- Click or tap an adjacent tile to swap
- Match 3 or more tiles to clear them
- Create special combinations for powerful effects
- Watch your health and enemy's attacks
- Level up to increase your power

## Contributing

Feel free to submit issues and enhancement requests!

## Project info

**URL**: https://lovable.dev/projects/dba26f54-b252-40a3-ab86-aa01b5eed37d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dba26f54-b252-40a3-ab86-aa01b5eed37d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dba26f54-b252-40a3-ab86-aa01b5eed37d) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
