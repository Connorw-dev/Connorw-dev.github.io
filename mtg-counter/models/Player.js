export class Player {
    constructor(id, life = 40) {
        if (!Number.isInteger(id) || id < 0) {
            throw new Error('Player ID must be a non-negative integer');
        }
        if (!Number.isInteger(life)) {
            throw new Error('Life total must be an integer');
        }
        
        this.id = id;
        this.life = life;
        this.timer = 0;
        this.timerInterval = null;
        this.turn = 0;
        this.isEliminated = false;
        this.eliminatedOnTurn = null;
    }

    resetState() {
        this.life = 40;
        this.timer = 0;
        this.timerInterval = null;
        this.turn = 0;
    }

    toJSON() {
        const json = {
            id: this.id,
            life: this.life,
            timer: this.timer,
            turn: this.turn,
            isEliminated: this.isEliminated,
            eliminatedOnTurn: this.eliminatedOnTurn
        };
        return json;
    }
}
