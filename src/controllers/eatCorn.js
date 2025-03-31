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