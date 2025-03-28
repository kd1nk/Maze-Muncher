class PauseMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'PauseMenu' });
    }
  
    create() {
        const { width, height } = this.scale;
      
        // Dim the background
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.5)');
      
        // Pause Title
        this.add.text(width / 2, height / 2 - 100, 'Game Paused', {
            fontFamily: 'Lobster',
            fontSize: '55px',
            color: '#ffffff'
        }).setOrigin(0.5);
      
        // Return to Game button
        const resumeButton = this.add.text(width / 2, height / 2, 'Return to Game', {
            fontSize: '32px',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
      
        resumeButton.on('pointerdown', () => {
          this.scene.stop();              // Stop the PauseMenu
          this.scene.resume('Pacman');    // Resume the Pacman scene
        });

        // Main Menu button
        const menuButton = this.add.text(width / 2, height / 2 + 80, 'Return to Main Menu', {
            fontSize: '28px',
            backgroundColor: '#ffffff',
            color: '#000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerdown', () => {
            window.location.href = 'mainMenu.html';
        });
      }
      
  }
  