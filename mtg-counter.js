class MTGCounter {
    constructor() {
        this.players = Array.from({length: 4}, (_, i) => ({
            id: i + 1,
            life: 40,
            timer: 0,
            timerInterval: null
        }));
        this.currentPlayer = null;
        this.gameStarted = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Life counter buttons
        document.querySelectorAll('.player-container').forEach((container, index) => {
            const decrementBtn = container.querySelector('.decrement');
            const incrementBtn = container.querySelector('.increment');
            
            decrementBtn.addEventListener('click', () => this.updateLife(index, -1));
            incrementBtn.addEventListener('click', () => this.updateLife(index, 1));
        });

        // Game control button
        const gameControlBtn = document.getElementById('gameControl');
        gameControlBtn.addEventListener('click', () => this.handleGameControl());
    }

    updateLife(playerIndex, change) {
        this.players[playerIndex].life += change;
        const playerElement = document.querySelector(`#player${playerIndex + 1}`);
        playerElement.querySelector('.life').textContent = this.players[playerIndex].life;
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
            this.currentPlayer = 0;
            gameControlBtn.textContent = 'End Turn';
            this.setActivePlayer(this.currentPlayer);
            this.startTimer(this.currentPlayer);
        } else {
            // End current turn
            this.stopTimer(this.currentPlayer);
            this.currentPlayer = (this.currentPlayer + 1) % 4;
            this.setActivePlayer(this.currentPlayer);
            this.startTimer(this.currentPlayer);
        }
    }
}

// Initialize the counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MTGCounter();
});
