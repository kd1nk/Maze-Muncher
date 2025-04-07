
/**
 * Creates a countdown overlay before the game starts (or restarts).
 * It displays a full-screen overlay and a large countdown text,
 * updates the number every second, then fades out the overlay and text,
 * and finally calls the onComplete callback if provided.
 *
 * @param {function} onComplete - A callback function to call when the countdown finishes.
 */
export function createStartCountdown(onComplete) {
    // Get the width and height of the game canvas from the scale manager.
    const { width, height } = this.scale;
    // Set the initial countdown value.
    let count = 3;
  
    // Create a semi-transparent overlay that covers the entire screen.
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(10);
  
    // Create a text object for the countdown, centered on the screen.
    const countdownText = this.add.text(width / 2, height / 2, count, {
      fontSize: '100px',
      color: '#ffffff',
      fontFamily: 'Chewy'
    }).setOrigin(0.5).setDepth(11);
  
    // Create a timer event that fires every 1000ms (1 second), repeating 3 times.
    this.time.addEvent({
      delay: 1000,
      repeat: 3,
      callback: () => {
        count--;
        
        // If there is still time left, update the text.
        if (count > 0) {
          countdownText.setText(count);
        } else if (count === 0) {
          // When count reaches 0, display "GO!".
          countdownText.setText("GO!");
        } else {
          // After the countdown, fade out the overlay and text.
          this.tweens.add({
            targets: [overlay, countdownText],
            alpha: 0,
            duration: 500,
            onComplete: () => {
              // Destroy the overlay and text objects after fading out.
              overlay.destroy();
              countdownText.destroy();
              // Call the onComplete callback if provided.
              if (onComplete) onComplete(); // <- ✅ Call the callback
            }
          });
        }
      }
    });
  }
  


  /**
 * Handles ending the game, either when the player wins or loses.
 * It creates an overlay, fades it in, and displays a result message and buttons.
 * For a loss, it provides a "Try Again" button that restarts the scene.
 * For a win, it provides a "Return to Main Menu" button.
 *
 * @param {string} outcome - A string indicating the outcome ("win" or any other value for loss).
 */
export function endGame(outcome) {
   // Get the canvas dimensions.
    const { width, height } = this.scale;

    // Create an overlay with an initial alpha of 0.
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setAlpha(0).setDepth(10);

    //Fade in the overlay
    this.tweens.add({
        targets: overlay,
        alpha: 0.8,
        duration: 800,
        onComplete: () => {
          //Determine if outcome is a win
            const isWin = outcome === 'win';
            const message = isWin ? 'You Win!' : 'Game Over';
            const color = isWin ? '#00ff00' : '#ff0000';

            // Display the result message.
            const resultText = this.add.text(width / 2, height / 2 - 60, message, {
                fontSize: '64px',
                color,
                fontFamily: 'Chewy'
            }).setOrigin(0.5).setDepth(11);

            // Create a button to return to the main menu.
            const returnBtn = this.add.text(width / 2, height / 2 + (isWin ? 40 : 80), 'Return to Main Menu', {
                fontSize: '28px',
                backgroundColor: '#fff',
                color: '#000',
                padding: { x: 20, y: 10 },
                fontFamily: 'Chewy'
            }).setOrigin(0.5).setDepth(11).setInteractive();

             // When the return button is clicked, navigate to the main menu.
            returnBtn.on('pointerdown', () => {
                window.location.href = 'mainMenu.html';
            });

            // If the outcome is a loss, create an additional "Try Again" button.
            if (!isWin) {
                const tryAgainBtn = this.add.text(width / 2, height / 2 + 20, 'Try Again', {
                    fontSize: '28px',
                    backgroundColor: '#fff',
                    color: '#000',
                    padding: { x: 20, y: 10 },
                    fontFamily: 'Chewy'
                }).setOrigin(0.5).setDepth(11).setInteractive();

                // On clicking "Try Again", reset game-related flags, reset lives and score, and restart the scene.
                tryAgainBtn.on('pointerdown', () => {
                    // Reset flags BEFORE restarting
                    this.isStarting = true;
                    this.isPacmanAlive = true;
                    this.hasRespawned = false;
                    this.lives = 3;
                    this.score = 0;
                    this.scene.restart();
                });
            }
        }
    });

    // Pause the physics and mark Pacman as not alive.
    this.physics.pause();
    this.isPacmanAlive = false;
}


/**
 * Sets up a listener for the pause menu.
 * When the "P" key is pressed, it launches the PauseMenu scene and pauses the current scene.
 */
export function pauseMenu() {
  this.input.keyboard.on('keydown-P', () => {
      // Launch the pause menu scene.
      this.scene.launch('PauseMenu');
      // Pause the current scene.
      this.scene.pause();
  });
}