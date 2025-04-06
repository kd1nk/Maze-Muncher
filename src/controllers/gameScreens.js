export function createStartCountdown(onComplete) {
    const { width, height } = this.scale;
    let count = 3;
  
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(10);
  
    const countdownText = this.add.text(width / 2, height / 2, count, {
      fontSize: '100px',
      color: '#ffffff',
      fontFamily: 'Chewy'
    }).setOrigin(0.5).setDepth(11);
  
    this.time.addEvent({
      delay: 1000,
      repeat: 3,
      callback: () => {
        count--;
        if (count > 0) {
          countdownText.setText(count);
        } else if (count === 0) {
          countdownText.setText("GO!");
        } else {
          this.tweens.add({
            targets: [overlay, countdownText],
            alpha: 0,
            duration: 500,
            onComplete: () => {
              overlay.destroy();
              countdownText.destroy();
              if (onComplete) onComplete(); // <- ✅ Call the callback
            }
          });
        }
      }
    });
  }
  


export function endGame(outcome) {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setAlpha(0).setDepth(10);

    this.tweens.add({
        targets: overlay,
        alpha: 0.8,
        duration: 800,
        onComplete: () => {
            const isWin = outcome === 'win';
            const message = isWin ? 'You Win!' : 'Game Over';
            const color = isWin ? '#00ff00' : '#ff0000';

            const resultText = this.add.text(width / 2, height / 2 - 60, message, {
                fontSize: '64px',
                color,
                fontFamily: 'Chewy'
            }).setOrigin(0.5).setDepth(11);

            const returnBtn = this.add.text(width / 2, height / 2 + (isWin ? 40 : 80), 'Return to Main Menu', {
                fontSize: '28px',
                backgroundColor: '#fff',
                color: '#000',
                padding: { x: 20, y: 10 },
                fontFamily: 'Chewy'
            }).setOrigin(0.5).setDepth(11).setInteractive();

            returnBtn.on('pointerdown', () => {
                window.location.href = 'mainMenu.html';
            });

            if (!isWin) {
                const tryAgainBtn = this.add.text(width / 2, height / 2 + 20, 'Try Again', {
                    fontSize: '28px',
                    backgroundColor: '#fff',
                    color: '#000',
                    padding: { x: 20, y: 10 },
                    fontFamily: 'Chewy'
                }).setOrigin(0.5).setDepth(11).setInteractive();

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

    this.physics.pause();
    this.isPacmanAlive = false;
}


// Pause menu scene
export function pauseMenu() {
    this.input.keyboard.on('keydown-P', () => {
        this.scene.launch('PauseMenu');  // Start the pause menu scene
        this.scene.pause();              // Pause the current scene
    });
}