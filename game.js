// Import modules for handling character movement, enemy behavior/movement, maze utilities, enemy death, pellet consumption, power ups, and game screens.
import * as CharacterMovement from "./src/controllers/characterMovement.js";
import * as EnemyBehavior from "./src/controllers/ghostBehaviors.js";
import * as EnemyMovement from "./src/controllers/enemyMovement.js";
import * as MazeUtils from "./src/controllers/mazeUtils.js";
import * as EnemyDeath from "./src/controllers/enemyDeath.js";
import * as EatCorn from "./src/controllers/eatCorn.js";
import * as GameScreens from "./src/controllers/gameScreens.js";
import * as LoadSprites from "./src/controllers/loadSprites.js";
import * as LoadAnims from "./src/controllers/loadAnims.js";
import * as PowerUpController from "./src/controllers/PowerUpController.js";


class Pacman extends Phaser.Scene {
  constructor() {
    super({ key: 'Pacman' });
    // Initialize properties for the scene.
    this.Pacman = null;
    this.direction = "null";
    this.previousDirection = "left";
    this.blockSize = 16;
    this.board = [];
    this.speed = 170;
    this.ghostSpeed = this.speed * 0.7;
    this.intersections = [];
    this.nextIntersection = null;
    this.oldNextIntersection = null;

    // Define scatter targets for the enemies (using your predefined coordinates)
    this.WHITESHEEP_SCATTER_TARGET = { x: 432, y: 80 };
    this.CYANSHEEP_SCATTER_TARGET = { x: 32, y: 80 };
    this.PINKSHEEP_SCATTER_TARGET = { x: 432, y: 528 };
    this.BROWNSHEEP_SCATTER_TARGET = { x: 32, y: 528 };

    // Define durations for different game modes
    this.scatterModeDuration = 7000;
    this.chaseModeDuration = 20000;
    this.scaredModeDuration = 9000;
    this.entryDelay = 7000;
    this.respawnDelay = 5000;
    this.modeTimer = null;
    this.currentMode = "scatter";

    // Initialize game state variables
    EnemyBehavior.initModeTimers.call(this);

    // Initialize lives and game state
    this.lives = 3;
    this.isPacmanAlive = true;
    this.hasRespawned = false
    this.isStarting = true;

    this.mapConfigs = [
      { key: "map", tileset: "pacman tileset" },
      { key: "map2", tileset: "map2" },
      { key: "map3", tileset: "map3" }
    ];
    
  }


  preload() {

    // Load tilemap 1 and tileset asset
    this.load.image("pacman tileset", "assets/pac man tiles/tileset.png");
    this.load.tilemapTiledJSON("map", "assets/maps/pacman-map.json");

    // Load tilemap 2 and tileset asset
    this.load.tilemapTiledJSON("map2", "assets/maps/map2.json");

    // Load tilemap 2 and tileset asset
    this.load.tilemapTiledJSON("map3", "assets/maps/map3.json");

    //Load Character sprites
    LoadSprites.loadBaseSprites(this);
    LoadSprites.loadPigSprites(this);
    LoadSprites.loadTopHatSprites(this);
    LoadSprites.loadMushroomSprites(this);
    LoadSprites.loadMarioSprites(this);

    //Loads sprites for the enemies
    LoadSprites.loadEnemySprites(this);

    // Kernels|Power Beans
    this.load.image("dot", "assets/pacman items/Corn Kernel-large.png");
    this.load.image("powerPill", "assets/pacman items/Power Bean.png");
    // Power ups...
    this.load.image("potato", "assets/pacman items/potato_yellow.png");
    this.load.image("carrot", "assets/pacman items/carrot_orange.png");
    this.load.image("cabbage", "assets/pacman items/cabbage.png");
    this.load.image("Corn", "assets/pacman items/Corn.png");

    this.load.image("endGameImage", "assets/pac man text/spr_message_2.png");

    // Audio Loads
    this.load.audio('gameMusic',  'assets/audio/game_background.mp3');
    this.load.audio('dotSfx',     'assets/audio/dot.mp3');
    this.load.audio('deathSfx',   'assets/audio/death.mp3');
    this.load.audio('winJingle',  'assets/audio/winJingle.wav');
    this.load.audio('loseJingle', 'assets/audio/loseJingle.wav');
    this.load.audio('powerPillSfx', 'assets/audio/powerup.wav');

  }
  create() {

    GameScreens.createStartCountdown.call(this, () => {
      this.sound.play('dotSfx', { volume: 0 });

      this.deathSfx = this.sound.add('deathSfx', {
        volume: sfxVol
      });


      // This runs after the countdown finishes
      this.isPacmanAlive = true;
      this.isStarting = false;
      EnemyMovement.startGhostEntries.call(this);

    });
    
    const storedIndex = localStorage.getItem("selectedMapIndex");

    if (storedIndex !== null) {
      this.currentMapIndex = parseInt(storedIndex);
    } else {
      // User clicked "Start Game" (not "Level Select") — pick random map
      this.currentMapIndex = Phaser.Math.Between(0, this.mapConfigs.length - 1);
      console.log("Random map index:", this.currentMapIndex);
    }
        
    const currentMap = this.mapConfigs[this.currentMapIndex];
    this.map = this.make.tilemap({ key: currentMap.key });
    const tileset = this.map.addTilesetImage(currentMap.tileset, "pacman tileset");
    const layer = this.map.createLayer("Tile Layer 1", tileset);
    layer.setCollisionByExclusion(-1, true);
    // Create the player character and enable physics
    this.pacman = this.physics.add.sprite(230, 432, "Farm boy0");
    //Create the inventory system...
    this.pacman.powerUp = null;

    this.pacman.usePowerUp = function() {
      if(this.powerUp){
        this.powerUp.activate(this);
        this.powerUp = null
      }
    };

    // Create animations and sprites for the character.
    LoadAnims.loadBaseAnims(this);
    LoadAnims.loadSheepAnims(this);

    // Create the character's death animation.
    LoadAnims.loadBaseDeathAnims(this);


    // Create the enemies and set their properties.
    this.physics.add.collider(this.pacman, layer);

    // Create the ghosts and set their properties.
    this.dots = this.physics.add.group();
    this.powerPills = this.physics.add.group();

    // this.dots.clear(true, true);
    // this.powerPills.clear(true, true);
    this.dotPositions = new Set();  // Reset so it can add fresh dots
    this.board = [];                // Reset the board too
    MazeUtils.populateBoardAndTrackEmptyTiles.call(this, layer);
    // console.log("Dots at start:", this.dots.getChildren().length); // Debug

    // Create the ghosts and set their properties.
    this.physics.add.overlap(this.pacman, this.dots, EatCorn.eatDot, null, this);
    this.physics.add.overlap(this.pacman, this.powerPills, EatCorn.eatPowerPill, null, this);
    this.cursors = this.input.keyboard.createCursorKeys();
    MazeUtils.detectIntersections.call(this);
    EnemyMovement.initializeGhosts.call(this, layer);
    let startPoint = { x: 232, y: 240 };

    // Initialize the enemy's paths using A* algorithm
    this.whiteSheep.path = EnemyBehavior.aStarAlgorithm.call(this, startPoint, this.WHITESHEEP_SCATTER_TARGET);
    this.whiteSheep.nextIntersection = this.whiteSheep.path.shift();

    this.cyanSheep.path = EnemyBehavior.aStarAlgorithm.call(this, startPoint, this.CYANSHEEP_SCATTER_TARGET);
    this.cyanSheep.nextIntersection = this.cyanSheep.path.shift();

    this.pinkSheep.path = EnemyBehavior.aStarAlgorithm.call(this, startPoint, this.PINKSHEEP_SCATTER_TARGET);
    this.pinkSheep.nextIntersection = this.pinkSheep.path.shift();

    this.brownSheep.path = EnemyBehavior.aStarAlgorithm.call(this, startPoint, this.BROWNSHEEP_SCATTER_TARGET);
    this.brownSheep.nextIntersection = this.brownSheep.path.shift();


    // Set the initial direction for the ghosts.
    this.ghosts = [this.whiteSheep, this.cyanSheep, this.brownSheep, this.pinkSheep];

    // Set the initial direction for the ghosts.
    this.ghosts.forEach(ghost => {
      this.physics.add.overlap(this.pacman, ghost, EnemyDeath.handlePacmanGhostCollision, null, this);
    });
    this.lifeCounter1 = this.add.image(32, 32, "Farm boy0");
    this.lifeCounter2 = this.add.image(56, 32, "Farm boy0");

    //SCORE TRACKER
    this.score = 0;
    this.scoreText = this.add.text(this.cameras.main.width / 2, 8, 'Score: 0', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5, 0);

    //TIMER AND BY PROXY, SCORE MULTIPLIER. CURRENTLY NOT WORKING.
    this.scoreMultiplier = 5.00;
    this.timeElapsed = 0;
    this.decreaseRate = 0.05;
    this.multiplierText = this.add.text(300, 32, `Multiplier: x${this.scoreMultiplier}`, {
      font: '16px Arial',
      fill: '#ffffff'
    });

    // Pause menu scene
    GameScreens.pauseMenu.call(this);

    localStorage.removeItem("selectedMapIndex");
    // read saved volumes
    const gameVol = parseFloat(localStorage.getItem('mazeMuncher_gameVol') || 0.5);
    const sfxVol  = parseFloat(localStorage.getItem('mazeMuncher_sfxVol')  || 0.8);
    
    // stop main menu music before game music starts
    if (window.menuMusic) {
      window.menuMusic.pause();
      window.menuMusic.currentTime = 0;
      window.menuMusic.src = '';
      window.menuMusic = null;
  }
  
    // background music
    this.gameMusic = this.sound.add('gameMusic', {
      loop: true,
      volume: 0
    });
    
    this.gameMusic.play();
    
    // Delay the fade-in to make sure the audio context is fully unlocked
    this.time.delayedCall(100, () => {
      this.tweens.add({
        targets: this.gameMusic,
        volume: gameVol,
        duration: 4000,
        onComplete: () => {
          console.log("Game music fade-in complete");
        }
      });
    });
    
    this.canEatDots = false;

    this.time.delayedCall(3000, () => {
      this.canEatDots = true;
    });
    

    //Key to use the powerUps...
    this.useKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //PowerUp spawning and removing...
    this.powerUpsGroup = this.physics.add.group(); // Store any power-up instances here

    this.spawnPotatoPowerUp = () => {
    if(this.powerUpsGroup.countActive(true) >= 2) return;
    const randomIndex = Phaser.Math.Between(0, this.intersections.length - 1);
    const { x, y } = this.intersections[randomIndex];
    
    const potato = this.powerUpsGroup.create(x, y, 'potato');
    //Adding outline to potato...
    const outline = this.add.graphics();
    outline.lineStyle(3, 0x00FF00, 1);
    outline.strokeRect(potato.x - potato.width / 2, potato.y - potato.height / 2, potato.width, potato.height);
    potato.outline = outline;

    potato.setDepth(1); // Optional layering
    potato.setScale(0.5); // If it's too big

    // Store a reference to the actual power-up object
    potato.powerUp = new PowerUpController.PotatoPowerUp();

    // Timer to destroy after 9 seconds
    this.time.delayedCall(9000, () => {
      if (potato && potato.active) {
        if(potato.outline) potato.outline.destroy();
          potato.destroy();
        }
      });
    };

    // Spawn it every 12 seconds for testing
    this.time.addEvent({
      delay: 12000,
      loop: true,
      callback: this.spawnPotatoPowerUp
    });

    //Spawn the corn powerup...
    this.spawnCornPowerUp = () => {
      if(this.powerUpsGroup.countActive(true) >= 2) return;

      const randomIndex = Phaser.Math.Between(0, this.intersections.length - 1);
      const {x, y} = this.intersections[randomIndex];

      const Corn = this.powerUpsGroup.create(x, y, 'Corn');
      //Adding outline to corn powerup...
      const outline = this.add.graphics();
      outline.lineStyle(3, 0x00FF00, 1);
      outline.strokeRect(Corn.x - Corn.width / 2, Corn.y - Corn.height / 2, Corn.width, Corn.height);
      Corn.outline = outline;

      //Reference to the actual power up object
      Corn.powerUp = new PowerUpController.CornPowerUp();

      //Timer to destory after 9 seconds
      this.time.delayedCall(9000, () => {
        if(Corn && Corn.active){
          if(Corn.outline) Corn.outline.destroy();
          Corn.destroy();
        }
      });
    };

    //Spawn Corn every 10 seconds
    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: this.spawnCornPowerUp
    });

    this.physics.add.overlap(this.pacman, this.powerUpsGroup, (pacman, powerUpSprite) => {
      if(!this.pacman.powerUp){
        this.pacman.powerUp = powerUpSprite.powerUp;

        if(powerUpSprite.outline){
          powerUpSprite.outline.destroy();
        }

        powerUpSprite.destroy();

        //this.showMessage?.('Picked up a potato! Press [E] to use!');
      }
    });

  }


  update(time, delta) {
    // Update the score text display with the current score.
    if (this.isStarting) return;

    // Update the score text display with the current score.
    if(!this.isPacmanAlive || this.lives === 0)
      return;

    // Update the score text display with the current score.
    CharacterMovement.handleDirectionInput.call(this);
    //If powerup is used...
    if(this.useKey && Phaser.Input.Keyboard.JustDown(this.useKey)){
      this.pacman.usePowerUp?.();
    }

    CharacterMovement.handlePacmanMovement.call(this);
    CharacterMovement.teleportPacmanAcrossWorldBounds.call(this);

  const ghosts = [this.whiteSheep, this.cyanSheep, this.brownSheep, this.pinkSheep];

  ghosts.forEach(ghost => {
    if (!ghost.enteredMaze) return;
  
    EnemyMovement.handleGhostDirection.call(this, ghost);
    EnemyMovement.handleGhostMovement.call(this, ghost);
  
    // Let scared mode blinking handle animations itself
    if (this.currentMode === "scared") return;
  
    if (ghost.type === "whiteSheep") {
      ghost.play(ghost.direction === "right" ? "whiteSheep-right" : "whiteSheep-left", true);
    } else if (ghost.type === "cyanSheep") {
      ghost.play(ghost.direction === "right" ? "cyanSheep-right" : "cyanSheep-left", true);
    } else if (ghost.type === "brownSheep") {
      ghost.play(ghost.direction === "right" ? "brownSheep-right" : "brownSheep-left", true);
    } else if (ghost.type === "pinkSheep") {
      ghost.play(ghost.direction === "right" ? "pinkSheep-right" : "pinkSheep-left", true);
    }
  });

    //updating multiplier
    EatCorn.updateMultiplier.call(this, delta);
  }
}

// Create a new Phaser game instance with the specified configuration.
const config = {
  type: Phaser.AUTO,
  width: 464,
  height: 560,
  scale: {
    mode: Phaser.Scale.FIT,         // Fit the screen
    autoCenter: Phaser.Scale.NO_CENTER  // Manually adjust centering
  },
  parent: "container",
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [Pacman, PauseMenu],  // Added pause screen scene
};
const game = new Phaser.Game(config);


