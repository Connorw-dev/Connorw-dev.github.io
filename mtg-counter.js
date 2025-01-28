class MTGCounter {
    constructor() {
        this.loadState();
        this.setupEventListeners();
        this.longPressTimer = null;
        this.longPressDelay = 500; // ms before triggering long press
        this.playerOrder = [1, 0, 3, 2]; // top-left, top-right, bottom-right, bottom-left
    }

    loadState() {
        const savedState = localStorage.getItem('mtgCounterState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.players = state.players.map(p => ({...p, timerInterval: null}));
            this.currentPlayer = state.currentPlayer;
            this.gameStarted = state.gameStarted;
            this.currentTurn = state.currentTurn || 0;
            
            // Update UI before starting timer
            this.updateAllDisplays();
            
            // Restore game state
            if (this.gameStarted && this.currentPlayer !== null) {
                document.getElementById('gameControl').textContent = 'End Turn';
                this.setActivePlayer(this.currentPlayer);
                requestAnimationFrame(() => this.startTimer(this.currentPlayer));
            }
        } else {
            this.players = Array.from({length: 4}, (_, i) => ({
                id: i + 1,
                life: 40,
                timer: 0,
                timerInterval: null,
                turn: 0
            }));
            this.currentPlayer = null;
            this.gameStarted = false;
            this.currentTurn = 0;
        }
    }

    saveState() {
        const state = {
            players: this.players.map(p => ({
                ...p,
                timerInterval: null // Don't save interval IDs
            })),
            currentPlayer: this.currentPlayer,
            gameStarted: this.gameStarted,
            currentTurn: this.currentTurn
        };
        localStorage.setItem('mtgCounterState', JSON.stringify(state));
    }

    resetGame() {
        // Stop all timers
        this.players.forEach((_, index) => {
            this.stopTimer(index);
        });

        // Reset to initial state
        this.players = Array.from({length: 4}, (_, i) => ({
            id: i + 1,
            life: 40,
            timer: 0,
            timerInterval: null,
            turn: 0
        }));
        this.currentPlayer = null;
        this.gameStarted = false;
        this.currentTurn = 0;

        // Reset UI
        document.getElementById('gameControl').textContent = 'Start Game';
        document.querySelectorAll('.player-container').forEach(container => {
            container.classList.remove('active-player');
        });

        // Update displays
        this.updateAllDisplays();

        // Clear localStorage
        localStorage.removeItem('mtgCounterState');
    }

    setupEventListeners() {
        // Reset game button
        document.getElementById('restartGame').addEventListener('click', () => this.resetGame());

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

        const gameControlBtn = document.getElementById('gameControl');
        gameControlBtn.addEventListener('click', () => this.handleGameControl());

        // Load saved state when page loads
        this.updateAllDisplays();
    }

    startLongPress(playerIndex, change) {
        this.updateLife(playerIndex, change);
        this.longPressTimer = setTimeout(() => {
            this.updateLife(playerIndex, change * 9); // Additional 9 for total of 10
        }, this.longPressDelay);
    }

    endLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    updateLife(playerIndex, change) {
        this.players[playerIndex].life += change;
        const playerElement = document.querySelector(`#player${playerIndex + 1}`);
        playerElement.querySelector('.life').textContent = this.players[playerIndex].life;
        this.saveState();
    }

    updateAllDisplays() {
        this.players.forEach((player, index) => {
            const playerElement = document.querySelector(`#player${index + 1}`);
            playerElement.querySelector('.life').textContent = player.life;
            this.updateTimerDisplay(index);
            if (player.turn > 0) {
                playerElement.querySelector('.turn-counter').textContent = `Turn ${player.turn}`;
            }
        });
        
        if (this.gameStarted) {
            document.getElementById('gameControl').textContent = 'End Turn';
            if (this.currentPlayer !== null) {
                this.setActivePlayer(this.currentPlayer);
            }
        }
    }

    startTimer(playerIndex) {
        if (this.players[playerIndex].timerInterval) return;
        
        this.players[playerIndex].timerInterval = setInterval(() => {
            this.players[playerIndex].timer++;
            this.updateTimerDisplay(playerIndex);
        }, 1000);
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

    handleGameControl() {
        const gameControlBtn = document.getElementById('gameControl');
        
        if (!this.gameStarted) {
            // Start game
            this.gameStarted = true;
            this.currentTurn = 1;
            this.currentPlayer = this.playerOrder[0];
            gameControlBtn.textContent = 'End Turn';
            this.setActivePlayer(this.currentPlayer);
            this.startTimer(this.currentPlayer);
            this.players[this.currentPlayer].turn = this.currentTurn;
        } else {
            // End current turn
            this.stopTimer(this.currentPlayer);
            const currentPlayerIndex = this.playerOrder.indexOf(this.currentPlayer);
            this.currentPlayer = this.playerOrder[(currentPlayerIndex + 1) % 4];
            
            // Increment turn counter when we loop back to first player
            if (currentPlayerIndex === 3) {
                this.currentTurn++;
            }
            
            this.players[this.currentPlayer].turn = this.currentTurn;
            this.setActivePlayer(this.currentPlayer);
            this.startTimer(this.currentPlayer);
        }
        this.saveState();
    }
}

// Initialize the counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MTGCounter();
});
