import { resetGhosts } from "./enemyDeath.js";
import { createStartCountdown, endGame } from "./gameScreens.js"; 


/**
 * Handles character's death sequence.
 * Stops movement, plays the death animation, and then calls resetAfterDeath after a delay.
 */
export function pacmanDies() {
    if (!this.isPacmanAlive)
        return;

     // Stop character's movement.
    this.pacman.setVelocityY(0);
    this.pacman.setVelocityX(0);

    // Mark character as not alive and stop any current animations.
    this.isPacmanAlive = false;
    this.pacman.anims.stop();

    // Play the death animation (farmBoyDeath) with immediate start.
    this.pacman.play("farmBoyDeath", true);

      // ✅ Play death sound ONLY here
  if (this.deathSfx && this.sound) {
    if (this.deathSfx.isPlaying) {
      this.deathSfx.stop();
    }
    this.deathSfx.play();
  }

    // After 2000ms, call resetAfterDeath to handle respawn or game over.
    this.time.delayedCall(2000, () => {
        resetAfterDeath.call(this);
    });
}


/**
 * Handles the reset (respawn) of character after death.
 * Decreases the life count, resets ghost positions, and initiates a countdown before restarting play.
 */
export function resetAfterDeath() {
  // Decrement the number of lives.
  this.lives -= 1;

  // If lives have decreased to 1 or 2, remove one of the life counter images.
  if (this.lives === 1) this.lifeCounter1.destroy();
  if (this.lives === 2) this.lifeCounter2.destroy();

  // If character still has lives remaining:
  if (this.lives > 0) {
    this.pacman.setPosition(230, 432);

    // Reset ghosts to their initial positions
    resetGhosts.call(this); 

     // Reset game mode to "scatter" so ghosts are in scatter mode.
    this.currentMode = "scatter";

    // Mark that character has respawned.
    this.hasRespawned = true;

    // Set the game into a "starting" state (e.g., pause movement during countdown).
    this.isStarting = true;

    // Start the countdown before resuming the game.
    // Once the countdown completes, update the flags to resume play.
    createStartCountdown.call(this, () => {
      this.isStarting = false;
      this.isPacmanAlive = true; // Mark character as alive again.
    });
  } else {
    // If no lives remain, end the game with a "lose" condition.
    endGame.call(this, "lose");
  }
}

  