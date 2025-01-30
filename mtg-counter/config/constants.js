export const GAME_CONSTANTS = {
    DEFAULT_LIFE: 40,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 6,
    LONG_PRESS_DELAY: 500,
    CHANGE_INDICATOR_DURATION: 3000,
    LONG_PRESS_MULTIPLIER: 9,
    TIMER_INTERVAL: 1000,
    
    PLAYER_ORDERS: {
        2: [0, 1],                    // Left to right
        3: [0, 1, 2],                 // Top left, top right, bottom center
        4: [0, 1, 2, 3],             // Numbers in turn order, CSS handles visual layout
        5: [0, 1, 2, 3, 4],          // Numbers in turn order, CSS handles visual layout
        6: [0, 1, 2, 3, 4, 5]        // Numbers in turn order, CSS handles visual layout
    }
};
