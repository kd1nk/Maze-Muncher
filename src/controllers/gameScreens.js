/**
 * Creates a countdown overlay before the game starts (or restarts).
 */
export function createStartCountdown(onComplete) {
    const { width, height } = this.scale;
    let count = 3;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(10);
    const countdownText = this.add.text(width / 2, height / 2, count, {
        fontSize: '100px',
        color: '#ffffff',
        fontFamily: 'Chewy'
    }).setOrigin(0.5).setDepth(11).setName("countdown-text");

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
                        if (onComplete) onComplete();
                    }
                });
            }
        }
    });
}

/**
 * Displays a custom name prompt for saving the player's score.
 */
function showNamePrompt(scene, callback) {
    const { width, height } = scene.scale;

    // Disable all input events in the scene
    scene.input.enabled = false;

    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(12);
    const promptBox = scene.add.rectangle(width / 2, height / 2, 400, 200, 0xffffff).setDepth(13).setStrokeStyle(4, 0x000000);

    const promptText = scene.add.text(width / 2, height / 2 - 60, 'Enter Your Name:', {
        fontSize: '28px',
        fontFamily: 'Chewy',
        color: '#000',
    }).setOrigin(0.5).setDepth(14);

    const inputBox = scene.add.rectangle(width / 2, height / 2, 360, 40, 0xeeeeee).setDepth(13).setStrokeStyle(2, 0xcccccc);

    let playerName = '';
    const inputText = scene.add.text(width / 2, height / 2, playerName, {
        fontSize: '24px',
        fontFamily: 'Chewy',
        color: '#000',
    }).setOrigin(0.5).setDepth(14);

    const instructions = scene.add.text(width / 2, height / 2 + 60, 'Press Enter to confirm', {
        fontSize: '18px',
        fontFamily: 'Chewy',
        color: '#888',
    }).setOrigin(0.5).setDepth(14);

    const keyboard = scene.input.keyboard.addKeys('A-Z,SPACE,BACKSPACE,ENTER');

    scene.input.keyboard.on('keydown', (event) => {
        if (event.key === 'Backspace') {
            playerName = playerName.slice(0, -1);
        } else if (event.key === 'Enter' && playerName.length > 0) {
            // Re-enable scene input before callback
            scene.input.enabled = true;
            callback(playerName);

            // Clean up the prompt UI
            overlay.destroy();
            promptBox.destroy();
            promptText.destroy();
            inputBox.destroy();
            inputText.destroy();
            instructions.destroy();


        } else if (playerName.length < 20 && /^[a-zA-Z\s]$/.test(event.key)) {
            playerName += event.key;
        }
        inputText.setText(playerName);
    });
}

/**
 * Handles ending the game, either when the player wins or loses.
 */
export function endGame(outcome) {

    // stop game music
    if (this.gameMusic.isPlaying) {
        this.gameMusic.stop();
    }

    // win/lose jingle
    this.sound.play(
        outcome === 'win' ? 'winJingle' : 'loseJingle',
        { volume: sfxVol }
    );

    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setAlpha(0).setDepth(10);

    this.tweens.add({
        targets: overlay,
        alpha: 0.8,
        duration: 800,
        onComplete: () => {
            const finalScore = Math.floor(this.score * this.scoreMultiplier);
            const isWin = outcome === 'win';

            // Check for new high score
            if (isNewHighScore(finalScore)) {
                showNewHighScoreScreen(this, finalScore, () => { // Pass the scene and the score
                    // After the player enters their name and clicks OK, go to the main menu
                    window.location.href = 'mainMenu.html';
                });
            }
            else {
                // Original endGame logic
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
                        this.isStarting = true;
                        this.isPacmanAlive = true;
                        this.hasRespawned = false;
                        this.lives = 3;
                        this.score = 0;
                        this.scene.restart();
                    });
                }
            }
        }
    });

    this.physics.pause();
    this.isPacmanAlive = false;
}

/**
 * Sets up a listener for the pause menu.
 */
export function pauseMenu() {
    this.input.keyboard.on('keydown-P', () => {
        this.scene.launch('PauseMenu');
        this.scene.pause();
    });
}

function getHighScore() {
    const leaderboardData = JSON.parse(localStorage.getItem('mazeMuncherLeaderboard')) || [];
    if (leaderboardData.length === 0) return 0;
    let highScore = leaderboardData[0].score;
    for (let i = 1; i < leaderboardData.length; i++){
        if (leaderboardData[i].score > highScore){
            highScore = leaderboardData[i].score;
        }
    }
    return highScore;
}

function isNewHighScore(score) {
    const currentHighScore = getHighScore();
    return score > currentHighScore;
}


function showNewHighScoreScreen(scene, score, onComplete) {
    const { width, height } = scene.scale;

    // Disable all input events in the scene
    scene.input.enabled = false;

    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(12);
    const hsPromptBox = scene.add.rectangle(width / 2, height / 2, 400, 300, 0xffffff).setDepth(13).setStrokeStyle(4, 0x000000);

    const hsPromptText = scene.add.text(width / 2, height / 2 - 100, 'New High Score!', {
        fontSize: '36px',
        fontFamily: 'Chewy',
        color: '#ff8800',
    }).setOrigin(0.5).setDepth(14);

    const scoreText = scene.add.text(width / 2, height / 2 - 40, `Your Score: ${score}`, {
        fontSize: '28px',
        fontFamily: 'Chewy',
        color: '#000',
    }).setOrigin(0.5).setDepth(14);

    const nameInputBox = scene.add.rectangle(width / 2, height / 2 + 20, 360, 40, 0xeeeeee).setDepth(13).setStrokeStyle(2, 0xcccccc);

    let playerName = '';
    const nameInputText = scene.add.text(width / 2, height / 2 + 20, playerName, {
        fontSize: '24px',
        fontFamily: 'Chewy',
        color: '#000',
    }).setOrigin(0.5).setDepth(14);

    const hsInstructions = scene.add.text(width / 2, height / 2 + 80, 'Enter Your Name:', {
        fontSize: '24px',
        fontFamily: 'Chewy',
        color: '#888',
    }).setOrigin(0.5).setDepth(14);

    const okButton = scene.add.text(width / 2, height / 2 + 130, 'Press Enter to Continue', {
        fontSize: '28px',
        color: '#000',
        padding: { x: 20, y: 10 },
        fontFamily: 'Chewy'
    }).setOrigin(0.5).setDepth(14);


    const keyboard = scene.input.keyboard.addKeys('A-Z,SPACE,BACKSPACE,ENTER');

    scene.input.keyboard.on('keydown', (event) => {
        if (event.key === 'Backspace') {
            playerName = playerName.slice(0, -1);
        } else if (event.key === 'Enter' && playerName.length > 0) {
            // Re-enable scene input before callback
            scene.input.enabled = true;
            updateLeaderboard(playerName, score); // Use the passed-in score
            onComplete(); // Use the passed-in callback
            // Clean up the prompt UI
            overlay.destroy();
            hsPromptBox.destroy();
            hsPromptText.destroy();
            scoreText.destroy();
            nameInputBox.destroy();
            nameInputText.destroy();
            hsInstructions.destroy();
            okButton.destroy();

        } else if (playerName.length < 20 && /^[a-zA-Z\s]$/.test(event.key)) {
            playerName += event.key;
        }
        nameInputText.setText(playerName);
    });

}
