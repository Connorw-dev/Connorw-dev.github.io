import { Player } from './models/Player.js';
import { GameState } from './services/GameState.js';
import { GAME_CONSTANTS } from './config/constants.js';

/**
 * MTG Life Counter Application
 * Tracks life totals, turn order, and game time for Magic: The Gathering games
 */
class MTGCounter {

    /**
     * Initialize the MTG Counter application
     */
    constructor() {
        this.gameState = new GameState();
        this.playerCount = 4;
        this.longPressTimer = null;
        this.isPaused = false;
        this.undoStack = [];
        this.changeIndicatorTimers = [];
        this.currentChanges = [];
        this.lastChangeTime = [];
        this.players = [];
        this.currentPlayer = null;
        this.gameStarted = false;
        this.currentTurn = 0;

        // Initialize the menu in a closed state
        const menuDialog = document.getElementById('menuDialog');
        if (menuDialog && menuDialog.open) {
            menuDialog.close();
        }

        this.initializeArrays();
        this.createPlayerElements();
        this.setupEventListeners();
        
        // Try to load saved state, or initialize new game if none exists
        const savedState = this.gameState.load();
        if (savedState) {
            this.loadState(savedState);
        } else {
            this.initializeNewGame();
        }
    }

    initializeArrays() {
        this.changeIndicatorTimers = new Array(this.playerCount).fill(null);
        this.currentChanges = new Array(this.playerCount).fill(0);
        this.lastChangeTime = new Array(this.playerCount).fill(0);
    }

    loadState(savedState) {
        this.playerCount = savedState.playerCount;
        this.players = savedState.players.map(p => new Player(p.id, p.life));
        this.currentPlayer = savedState.currentPlayer;
        this.gameStarted = savedState.gameStarted;
        this.currentTurn = savedState.currentTurn;
        
        this.initializeArrays();
        this.createPlayerElements();
        
        // Update UI elements
        const gameControlBtn = document.getElementById('gameControl');
        gameControlBtn.textContent = this.gameStarted ? 'End Turn' : 'Start Game';
        document.getElementById('playerCount').textContent = this.playerCount;
        
        // Update all displays first
        this.updateAllDisplays();
        
        // If game is in progress, restore active player and timer
        if (this.gameStarted && this.currentPlayer !== null) {
            this.setActivePlayer(this.currentPlayer);
            // Start timer on next frame to ensure DOM is ready
            setTimeout(() => this.startTimer(this.currentPlayer), 0);
        }
    }

    initializeNewGame() {
        this.players = Array.from(
            { length: this.playerCount }, 
            (_, i) => {
                const player = new Player(i);
                // Ensure player has required properties
                player.life = 40;
                player.timer = 0;
                player.turn = 0;
                return player;
            }
        );
        this.currentPlayer = null;
        this.gameStarted = false;
        this.currentTurn = 0;
        this.initializeArrays();
        this.createPlayerElements();
    }

    createPlayerElements() {
        console.log('Creating player elements for', this.playerCount, 'players');
        
        const container = document.querySelector('.players-container');
        console.log('Container before clearing:', container);
        console.log('Current container className:', container.className);
        
        container.innerHTML = '';
        const newClassName = `players-container players-${this.playerCount}`;
        console.log('Setting container className to:', newClassName);
        container.className = newClassName;
        
        for (let i = 0; i < this.playerCount; i++) {
            console.log('Creating player element', i + 1);
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-container';
            playerDiv.id = `player${i + 1}`;
            
            playerDiv.innerHTML = `
                <div class="life-counter">
                    <button class="decrement">-</button>
                    <span class="life">40</span>
                    <button class="increment">+</button>
                </div>
                <div class="timer">00:00</div>
                <div class="turn-counter"></div>
            `;
            
            container.appendChild(playerDiv);
            console.log('Added player', i + 1, 'element:', playerDiv);
        }
        
        console.log('Final container state:', container);
        console.log('Setting up player event listeners...');
        this.setupPlayerEventListeners();
    }

    setupPlayerEventListeners() {
        document.querySelectorAll('.player-container').forEach((container, index) => {
            const decrementBtn = container.querySelector('.decrement');
            const incrementBtn = container.querySelector('.increment');
            
            // Mouse events for decrement
            decrementBtn.addEventListener('mousedown', () => this.startLongPress(index, -1));
            decrementBtn.addEventListener('mouseup', () => this.endLongPress(index, -1));
            decrementBtn.addEventListener('mouseleave', () => this.endLongPress(index, -1));
            
            // Mouse events for increment
            incrementBtn.addEventListener('mousedown', () => this.startLongPress(index, 1));
            incrementBtn.addEventListener('mouseup', () => this.endLongPress(index, 1));
            incrementBtn.addEventListener('mouseleave', () => this.endLongPress(index, 1));
            
            // Touch events for mobile
            decrementBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startLongPress(index, -1);
            });
            decrementBtn.addEventListener('touchend', () => this.endLongPress(index, -1));
            
            incrementBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startLongPress(index, 1);
            });
            incrementBtn.addEventListener('touchend', () => this.endLongPress(index, 1));
        });
    }

    saveState() {
        this.gameState.state = {
            players: this.players.map(p => p.toJSON()),
            currentPlayer: this.currentPlayer,
            gameStarted: this.gameStarted,
            currentTurn: this.currentTurn,
            playerCount: this.playerCount
        };
        this.gameState.save();
    }

    resetGame() {
        // Stop all timers
        this.players.forEach((_, index) => {
            this.stopTimer(index);
        });

        // Reset to initial state
        this.players = Array.from(
            { length: this.playerCount }, 
            (_, i) => {
                const player = new Player(i);
                player.life = 40;
                player.timer = 0;
                player.turn = 0;
                return player;
            }
        );
        this.currentPlayer = null;
        this.gameStarted = false;
        this.currentTurn = 0;

        // Reset UI
        document.getElementById('gameControl').textContent = 'Start Game';

        // Clear localStorage
        localStorage.removeItem('mtgCounterState');
    }

    setupEventListeners() {
        // Menu controls
        document.getElementById('menuButton').addEventListener('click', () => this.toggleMenu());
        document.getElementById('closeMenu').addEventListener('click', () => this.toggleMenu());
        document.getElementById('increasePlayers').addEventListener('click', () => this.changePlayerCount(1));
        document.getElementById('decreasePlayers').addEventListener('click', () => this.changePlayerCount(-1));
        
        // Game control buttons
        document.getElementById('restartGame').addEventListener('click', () => this.resetGame());
        document.getElementById('pauseGame').addEventListener('click', () => this.togglePause());
        document.getElementById('undoAction').addEventListener('click', () => this.undo());


        const gameControlBtn = document.getElementById('gameControl');
        gameControlBtn.addEventListener('click', () => this.handleGameControl());

        // Load saved state when page loads
        this.updateAllDisplays();
    }

    toggleMenu() {
        const menuOverlay = document.getElementById('menuOverlay');
        menuOverlay.classList.toggle('hidden');
    }

    changePlayerCount(change) {
        console.log('changePlayerCount called with change:', change);
        console.log('Current player count:', this.playerCount);
        
        const newCount = this.playerCount + change;
        console.log('Proposed new count:', newCount);
        
        if (newCount >= 2 && newCount <= 6) {
            console.log('Changing player count from', this.playerCount, 'to', newCount);
            this.playerCount = newCount;
            
            const countDisplay = document.getElementById('playerCount');
            console.log('Count display element:', countDisplay);
            if (countDisplay) {
                countDisplay.textContent = this.playerCount;
            }
            
            console.log('Resetting game...');
            this.resetGame();
            
            console.log('Creating new player elements...');
            this.createPlayerElements();
            
            console.log('Setting up event listeners...');
            this.setupPlayerEventListeners();
            
            // Update displays after elements are created
            this.updateAllDisplays();
            
            console.log('Saving state...');
            this.saveState();
            
            // Close the menu after changing player count
            this.toggleMenu();
            
            console.log('Player count change complete');
        } else {
            console.log('Invalid player count, staying at:', this.playerCount);
        }
    }

    /**
     * Start tracking a long press on a life change button
     * @param {number} playerIndex - Index of the player
     * @param {number} change - Amount to change life total (+1 or -1)
     */
    startLongPress(playerIndex, change) {
        this.updateLife(playerIndex, change);
        this.longPressTimer = setTimeout(() => {
            this.updateLife(playerIndex, change * GAME_CONSTANTS.LONG_PRESS_MULTIPLIER);
        }, GAME_CONSTANTS.LONG_PRESS_DELAY);
    }

    endLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    updateLife(playerIndex, change) {
        if (!Number.isInteger(change)) {
            console.error('Life change must be an integer');
            return;
        }
        
        const now = Date.now();
        const playerElement = document.querySelector(`#player${playerIndex + 1}`);
        
        if (!playerElement) {
            console.error(`Player element ${playerIndex + 1} not found`);
            return;
        }
        
        // Reset change tracking if more than 3 seconds have passed
        if (now - this.lastChangeTime[playerIndex] > 3000) {
            // If there was a pending change, add it to the undo stack
            if (this.currentChanges[playerIndex] !== 0) {
                this.undoStack.push({
                    type: 'life',
                    playerIndex: playerIndex,
                    oldValue: this.players[playerIndex].life - this.currentChanges[playerIndex],
                    newValue: this.players[playerIndex].life,
                    totalChange: this.currentChanges[playerIndex]
                });
            }
            this.currentChanges[playerIndex] = 0;
        }
        
        // Store old life before any changes
        const oldLife = this.players[playerIndex].life;
        
        this.players[playerIndex].life += change;
        this.currentChanges[playerIndex] += change;
        this.lastChangeTime[playerIndex] = now;
        
        playerElement.querySelector('.life').textContent = this.players[playerIndex].life;
        
        // Update or create change indicator
        let indicator = playerElement.querySelector('.change-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'change-indicator';
            playerElement.querySelector('.life-counter').appendChild(indicator);
        }
        
        const changeText = this.currentChanges[playerIndex] > 0 ? 
            `+${this.currentChanges[playerIndex]}` : 
            this.currentChanges[playerIndex];
        indicator.textContent = changeText;
        indicator.classList.remove('fade-out');
        
        // Clear existing timer
        if (this.changeIndicatorTimers[playerIndex]) {
            clearTimeout(this.changeIndicatorTimers[playerIndex]);
        }
        
        // Set new timer
        this.changeIndicatorTimers[playerIndex] = setTimeout(() => {
            indicator.classList.add('fade-out');
            // Add to undo stack when change sequence ends
            this.undoStack.push({
                type: 'life',
                playerIndex: playerIndex,
                oldValue: oldLife,
                newValue: this.players[playerIndex].life,
                totalChange: this.currentChanges[playerIndex]
            });
            this.currentChanges[playerIndex] = 0;
        }, 3000);
        
        this.saveState();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        
        const lastAction = this.undoStack.pop();
        
        if (lastAction.type === 'life') {
            // Calculate the change that needs to be undone
            const changeToUndo = lastAction.totalChange;
            // Apply the reverse of that change
            this.players[lastAction.playerIndex].life -= changeToUndo;
            const playerElement = document.querySelector(`#player${lastAction.playerIndex + 1}`);
            playerElement.querySelector('.life').textContent = this.players[lastAction.playerIndex].life;
            
            // Show undo indicator
            let indicator = playerElement.querySelector('.change-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'change-indicator';
                playerElement.querySelector('.life-counter').appendChild(indicator);
            }
            indicator.textContent = `UNDO ${changeToUndo > 0 ? '+' : ''}${changeToUndo}`;
            indicator.classList.remove('fade-out');
            
            setTimeout(() => {
                indicator.classList.add('fade-out');
            }, 3000);
        } else if (lastAction.type === 'turn') {
            this.currentPlayer = lastAction.oldPlayer;
            this.currentTurn = lastAction.oldTurn;
            this.players[lastAction.newPlayer].turn = lastAction.oldTurn;
            this.players[lastAction.oldPlayer].turn = lastAction.oldTurn;
            this.stopTimer(lastAction.newPlayer);
            this.players[lastAction.newPlayer].timer = lastAction.newPlayerOldTimer;
            this.players[lastAction.oldPlayer].timer = lastAction.oldPlayerOldTimer;
            this.startTimer(lastAction.oldPlayer);
            this.setActivePlayer(lastAction.oldPlayer);
        }
        
        this.updateAllDisplays();
        this.saveState();
    }

    updateAllDisplays() {
        this.players.forEach((player, index) => {
            const playerElement = document.querySelector(`#player${index + 1}`);
            playerElement.querySelector('.life').textContent = player.life;
            this.updateTimerDisplay(index);
            
            const turnCounter = playerElement.querySelector('.turn-counter');
            if (player.turn > 0) {
                turnCounter.textContent = `Turn ${player.turn}`;
            } else {
                turnCounter.textContent = '';
            }
        });
        
        const gameControlBtn = document.getElementById('gameControl');
        gameControlBtn.textContent = this.gameStarted ? 'End Turn' : 'Start Game';
        
        if (this.gameStarted && this.currentPlayer !== null) {
            this.setActivePlayer(this.currentPlayer);
        }
    }

    /**
     * Start the timer for a player
     * @param {number} playerIndex - Index of the player
     */
    startTimer(playerIndex) {
        if (this.players[playerIndex].timerInterval || this.isPaused) return;
        
        this.players[playerIndex].timerInterval = setInterval(() => {
            this.players[playerIndex].timer++;
            this.updateTimerDisplay(playerIndex);
        }, GAME_CONSTANTS.TIMER_INTERVAL);
    }

    togglePause() {
        const pauseBtn = document.getElementById('pauseGame');
        this.isPaused = !this.isPaused;
        pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        if (this.isPaused) {
            // Stop current timer
            if (this.currentPlayer !== null) {
                this.stopTimer(this.currentPlayer);
            }
        } else {
            // Resume timer for current player
            if (this.gameStarted && this.currentPlayer !== null) {
                this.startTimer(this.currentPlayer);
            }
        }
        this.saveState();
    }

    stopTimer(playerIndex) {
        if (this.players[playerIndex].timerInterval) {
            clearInterval(this.players[playerIndex].timerInterval);
            this.players[playerIndex].timerInterval = null;
        }
    }

    updateTimerDisplay(playerIndex) {
        const minutes = Math.floor(this.players[playerIndex].timer / 60);
        const seconds = this.players[playerIndex].timer % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector(`#player${playerIndex + 1} .timer`).textContent = display;
    }

    setActivePlayer(playerIndex) {
        document.querySelectorAll('.player-container').forEach(container => {
            container.classList.remove('active-player');
        });
        document.querySelector(`#player${playerIndex + 1}`).classList.add('active-player');
    }

    /**
     * Handle game control button click (Start Game/End Turn)
     */
    handleGameControl() {
        const gameControlBtn = document.getElementById('gameControl');
        
        if (!this.gameStarted) {
            this.startNewGame();
        } else {
            this.endCurrentTurn();
        }
        
        this.saveState();
    }

    /**
     * Start a new game
     */
    startNewGame() {
        this.gameStarted = true;
        this.currentTurn = 1;
        this.currentPlayer = GAME_CONSTANTS.PLAYER_ORDERS[this.playerCount][0];
        
        document.getElementById('gameControl').textContent = 'End Turn';
        this.setActivePlayer(this.currentPlayer);
        this.startTimer(this.currentPlayer);
        this.players[this.currentPlayer].turn = this.currentTurn;
        this.updateAllDisplays();
    }

    /**
     * End the current player's turn and start the next player's turn
     */
    endCurrentTurn() {
        // Store state for undo
        const oldPlayer = this.currentPlayer;
        const oldTurn = this.currentTurn;
        
        // End current turn
        this.stopTimer(this.currentPlayer);
        const currentPlayerIndex = GAME_CONSTANTS.PLAYER_ORDERS[this.playerCount].indexOf(this.currentPlayer);
        this.currentPlayer = GAME_CONSTANTS.PLAYER_ORDERS[this.playerCount][(currentPlayerIndex + 1) % this.playerCount];
        
        // Increment turn counter when we loop back to first player
        if (this.currentPlayer === GAME_CONSTANTS.PLAYER_ORDERS[this.playerCount][0]) {
            this.currentTurn++;
        }
            
            // Add to undo stack
            this.undoStack.push({
                type: 'turn',
                oldPlayer: oldPlayer,
                newPlayer: this.currentPlayer,
                oldTurn: oldTurn,
                oldPlayerOldTimer: this.players[oldPlayer].timer,
                newPlayerOldTimer: this.players[this.currentPlayer].timer
            });
            
            this.players[this.currentPlayer].turn = this.currentTurn;
            this.setActivePlayer(this.currentPlayer);
            this.startTimer(this.currentPlayer);
            this.updateAllDisplays();
        }
}

// Initialize the counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MTGCounter();
});
