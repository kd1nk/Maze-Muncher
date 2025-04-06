import { resetGhosts } from "./enemyDeath.js";
import { createStartCountdown, endGame } from "./gameScreens.js"; // Ensure this import is correct

export function pacmanDies() {
    if (!this.isPacmanAlive)
        return;

    this.pacman.setVelocityY(0);
    this.pacman.setVelocityX(0);
    this.isPacmanAlive = false;
    this.pacman.anims.stop();

    this.pacman.play("farmBoyDeath", true);
    this.time.delayedCall(2000, () => {
        resetAfterDeath.call(this);
    });
}
export function resetAfterDeath() {
  this.lives -= 1;

  if (this.lives === 1) this.lifeCounter1.destroy();
  if (this.lives === 2) this.lifeCounter2.destroy();

  if (this.lives > 0) {
    this.pacman.setPosition(230, 432);
    resetGhosts.call(this); // Reset ghosts to their initial positions
    this.currentMode = "scatter";
    this.hasRespawned = true;

    // Set flags and wait for countdown before continuing game
    this.isStarting = true;
    createStartCountdown.call(this, () => {
      this.isStarting = false;
      this.isPacmanAlive = true; // <- was missing before
    });
  } else {
    endGame.call(this, "lose"); 
  }
}

  