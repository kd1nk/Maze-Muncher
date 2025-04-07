import * as EnemyMovement from "./enemyMovement.js";
import * as GhostBehavior from "./ghostBehaviors.js";
import * as characterDeath from "./characterDeath.js";


// Handles the collision between character and a enemy.
// If character is in "scared" mode and the enemy hasn’t been eaten yet,
// the enemy is deactivated and then later respawned.
// Otherwise, if the enemy has already been eaten, character dies.
export function handlePacmanGhostCollision(pacman, ghost) {
    if (this.currentMode === "scared" && !ghost.hasBeenEaten) {
        // Deactivate the enemy: make it non-active and invisible.
        ghost.setActive(false);
        ghost.setVisible(false);

        // After a delay (1000ms), call the respawn function to bring the enemy back.
        this.time.delayedCall(1000, () => {
            respawnGhost.call(this, ghost);
        });
    } else if (ghost.hasBeenEaten) {
        // If the enemy has been eaten already, Pacman dies.
        characterDeath.pacmanDies.call(this);
    }
}


// Resets all enemies to their initial positions and state after a life loss.
// It resets each enemy's position, texture, and state flags, and updates their path.
// Finally, it restarts the enemy entry sequence and resets the enemy mode.
export function resetGhosts() {
    // Reset positions for each enemy individually.
    this.redGhost.setPosition(232, 290);
    this.pinkGhost.setPosition(220, 290);
    this.blueGhost.setPosition(255, 290);
    this.orangeGhost.setPosition(210, 290);

    // Update the global enemy array with the current enemy objects.
    this.ghosts = [this.pinkGhost, this.redGhost, this.orangeGhost, this.blueGhost];

    // For each enemy, reset its state:
    this.ghosts.forEach(ghost => {
        // Restore the ghost's default texture.
        ghost.setTexture(ghost.originalTexture);

        // Mark enemy as "eaten" (so that the game logic knows it hasn't re-entered yet).
        ghost.hasBeenEaten = true;

        // Mark enemy as not having entered the maze.
        ghost.enteredMaze = false;

        // Clear any blinking intervals (if in scared mode).
        clearInterval(ghost.blinkInterval);

        // Get the scatter target for the enemy and update its path accordingly.
        let target = GhostBehavior.getScatterTarget.call(this, ghost);
        GhostBehavior.updateGhostPath.call(this, ghost, target);

        // Set a default movement direction (e.g., "left").
        ghost.direction = "left";
    });

    // Restart enemy entry timers so they re-enter the maze.
    EnemyMovement.startGhostEntries.call(this);

    // Reset the enemy mode timer to begin scatter mode.
    GhostBehavior.setModeTimer.call(this, this.scatterModeDuration);

    // Set the current mode to "scatter" and update previous mode tracking.
    this.currentMode = "scatter";
    this.previouseMode = this.currentMode;
}

// Respawns a single enemy after it has been temporarily deactivated.
// It resets the enemy's position, reactivates it, and recalculates its movement path.
export function respawnGhost(ghost) {
    // Reset the enemy's position to a predefined starting point.
    ghost.setPosition(232, 290);
    // Reactivate and make the enemy visible.
    ghost.setActive(true);
    ghost.setVisible(true);
    // Restore the enemy's default texture.
    ghost.setTexture(ghost.originalTexture);
    // Mark the enemy as "eaten" to indicate it is in a respawn state.
    ghost.hasBeenEaten = true;
    // Call the function that handles the enemy's entry into the maze.
    EnemyMovement.enterMaze.call(this, ghost);
    // Determine the new target based on the current mode: 
    // If the mode is "chase", use the chase target; otherwise, use the scatter target.
    let target = this.currentMode === "chase" ?
        GhostBehavior.getChaseTarget.call(this, ghost) :
        GhostBehavior.getScatterTarget.call(this, ghost);
    // Update the enemy's movement path using the calculated target.
    GhostBehavior.updateGhostPath.call(this, ghost, target);
}