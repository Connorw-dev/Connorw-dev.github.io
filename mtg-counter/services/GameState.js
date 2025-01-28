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
        const serializedState = {
            ...this.state,
            players: this.state.players.map(p => p.toJSON())
        };
        localStorage.setItem(GameState.STORAGE_KEY, JSON.stringify(serializedState));
    }

    load() {
        const savedState = localStorage.getItem(GameState.STORAGE_KEY);
        if (savedState) {
            return JSON.parse(savedState);
        }
        return null;
    }

    clear() {
        localStorage.removeItem(GameState.STORAGE_KEY);
    }
}
