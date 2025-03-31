import * as EnemyMovement from "./enemyMovement.js";
import * as GhostBehavior from "./ghostBehaviors.js";

export function handlePacmanGhostCollision(pacman, ghost) {
    if (this.currentMode === "scared" && !ghost.hasBeenEaten) {
        ghost.setActive(false);
        ghost.setVisible(false);
        this.time.delayedCall(1000, () => {
            respawnGhost.call(this, ghost);
        });
    } else if (ghost.hasBeenEaten) {
        characterDeath.pacmanDies.call(this);
    }
}

export function resetGhosts() {
    this.redGhost.setPosition(232, 290);
    this.pinkGhost.setPosition(220, 290);
    this.blueGhost.setPosition(255, 290);
    this.orangeGhost.setPosition(210, 290);

    this.ghosts = [this.pinkGhost, this.redGhost, this.orangeGhost, this.blueGhost];

    this.ghosts.forEach(ghost => {
        ghost.setTexture(ghost.originalTexture);
        ghost.hasBeenEaten = true;
        ghost.enteredMaze = false;
        clearInterval(ghost.blinkInterval);
        let target = GhostBehavior.getScatterTarget.call(this, ghost);
        GhostBehavior.updateGhostPath.call(this, ghost, target);
        ghost.direction = "left";
    });
    EnemyMovement.startGhostEntries.call(this);
    GhostBehavior.setModeTimer.call(this, this.scatterModeDuration);
    this.currentMode = "scatter";
    this.previouseMode = this.currentMode;
}

export function respawnGhost(ghost) {
    ghost.setPosition(232, 290);
    ghost.setActive(true);
    ghost.setVisible(true);
    ghost.setTexture(ghost.originalTexture);
    ghost.hasBeenEaten = true;
    EnemyMovement.enterMaze.call(this, ghost);
    let target = this.currentMode === "chase" ?
        GhostBehavior.getChaseTarget.call(this, ghost) : GhostBehavior.getScatterTarget.call(this, ghost);
    GhostBehavior.updateGhostPath.call(this, ghost, target);
}