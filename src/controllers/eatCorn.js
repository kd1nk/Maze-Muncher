import * as GhostBehavior from "./ghostBehaviors.js";

export function eatDot(pacman, dot) {
    dot.disableBody(true, true);
    this.score += 100;
    this.scoreText.setText('Score: ' + this.score);
}

export function eatPowerPill(pacman, powerPill) {
    powerPill.disableBody(true, true);
    this.currentMode = "scared";
    GhostBehavior.setGhostsToScaredMode.call(this);
    GhostBehavior.setModeTimer.call(this, this.scaredModeDuration);
    this.ghostSpeed = this.speed * 0.5;
    this.ghosts.forEach((ghost) => {
        ghost.hasBeenEaten = false;
    });
}

//update score multiplier
export function updateMultiplier(delta) {
    this.timeElapsed += delta;

    if (this.timeElapsed >= 1000) {
        this.timeElapsed = 0;

        if (this.scoreMultiplier > 1) {
            this.scoreMultiplier -= this.decreaseRate;
            this.scoreMultiplier = Math.max(this.scoreMultiplier, 1.00);
        }

        this.multiplierText.setText(`Multiplier: x${this.scoreMultiplier.toFixed(2)}`);
    }
}