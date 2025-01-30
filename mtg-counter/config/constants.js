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
        4: [0, 1, 3, 2],             // Top left, top right, bottom left, bottom right (clockwise)
        5: [0, 1, 3, 2, 4],          // Top left, top right, bottom left, bottom right, bottom center (clockwise)
        6: [0, 1, 3, 5, 4, 2]        // Top left, top right, bottom left, bottom middle left, bottom right, middle right (clockwise)
    }
};
