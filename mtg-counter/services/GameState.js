export class GameState {
    static STORAGE_KEY = 'mtgCounterState';

    constructor() {
        this.state = {
            players: [],
            currentPlayer: null,
            gameStarted: false,
            currentTurn: 0,
            playerCount: 4
        };
    }

    save() {
        try {
            const serializedState = {
                ...this.state,
                players: this.state.players.map(p => p.toJSON())
            };
            localStorage.setItem(GameState.STORAGE_KEY, JSON.stringify(serializedState));
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }

    load() {
        try {
            const savedState = localStorage.getItem(GameState.STORAGE_KEY);
            if (!savedState) return null;
            
            const parsed = JSON.parse(savedState);
            if (!this.validateState(parsed)) {
                throw new Error('Invalid state structure');
            }
            return parsed;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    }

    validateState(state) {
        return state 
            && Array.isArray(state.players)
            && typeof state.currentTurn === 'number'
            && typeof state.playerCount === 'number'
            && typeof state.gameStarted === 'boolean';
    }

    clear() {
        localStorage.removeItem(GameState.STORAGE_KEY);
    }
}
