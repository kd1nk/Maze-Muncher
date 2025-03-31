export function pacmanDies() {
    if (!this.isPacmanAlive)
        return;

    this.pacman.setVelocityY(0);
    this.pacman.setVelocityX(0);
    this.isPacmanAlive = false;
    this.pacman.anims.stop();

    this.pacman.play("pacmanDeath");
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
      this.resetGhosts(); // Reset ghosts to their initial positions
      this.currentMode = "scatter";
      this.isPacmanAlive = true;
      this.hasRespawned = true;
  
      // Show countdown screen before resuming
      this.isStarting = true;
      this.createStartCountdown(); // <-- make sure this method exists in your scene
    } else {
      // Game over
      this.endGame("lose"); // <-- make sure this method exists in your scene
    }
  }
  