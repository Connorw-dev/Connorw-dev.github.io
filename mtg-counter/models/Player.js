export class Player {
    constructor(id, life = 40) {
        this.id = id;
        this.life = life;
        this.timer = 0;
        this.timerInterval = null;
        this.turn = 0;
    }

    resetState() {
        this.life = 40;
        this.timer = 0;
        this.timerInterval = null;
        this.turn = 0;
    }

    toJSON() {
        return {
            id: this.id,
            life: this.life,
            timer: this.timer,
            turn: this.turn
        };
    }
}
