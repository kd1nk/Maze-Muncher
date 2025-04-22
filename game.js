
// Import modules for handling character movement, enemy behavior/movement, maze utilities, enemy death, pellet consumption, and game screens.
import * as CharacterMovement from "./src/controllers/characterMovement.js";
import * as EnemyBehavior from "./src/controllers/ghostBehaviors.js";
import * as EnemyMovement from "./src/controllers/enemyMovement.js";
import * as MazeUtils from "./src/controllers/mazeUtils.js";
import * as EnemyDeath from "./src/controllers/enemyDeath.js";
import * as EatCorn from "./src/controllers/eatCorn.js";
import * as GameScreens from "./src/controllers/gameScreens.js";


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

  }


  preload() {

    // Load tilemap and tileset asset
    this.load.image("pacman tileset", "assets/pac man tiles/tileset.png");
    this.load.tilemapTiledJSON("map", "assets/pacman-map.json");

    //Farm Boy Sprites
    this.load.spritesheet("Farm boy0", "assets/Farm boy/Farm boy-0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy1", "assets/Farm boy/Farm boy-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy2", "assets/Farm boy/Farm boy-2.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy3", "assets/Farm boy/Farm boy-3.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy4", "assets/Farm boy/Farm boy-4.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy5", "assets/Farm boy/Farm boy-5.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy6", "assets/Farm boy/Farm boy-6.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy7", "assets/Farm boy/Farm boy-7.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("Farm boy8", "assets/Farm boy/Farm boy-8.png", {
      frameWidth: 32, frameHeight: 32
    });


    //Death Animation
    this.load.spritesheet("farmBoyDeath1", "assets/Farm boy/Farm boy-death-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("farmBoyDeath2", "assets/Farm boy/Farm boy-death-2.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("farmBoyDeath3", "assets/Farm boy/Farm boy-death-3.png", {
      frameWidth: 32, frameHeight: 32
    });


    // Kernels|Power Beans
    this.load.image("dot", "assets/pacman items/Corn Kernel-large.png");
    this.load.image("powerPill", "assets/pacman items/Power Bean.png");

    // Load white sheep sprites
    this.load.spritesheet("whiteSheepLeft-1", "assets/enemies/white sheep/sheep-left-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("whiteSheepRight-1", "assets/enemies/white sheep/sheep-right-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("whiteSheepLeft-2", "assets/enemies/white sheep/sheep-left-2.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("whiteSheepRight-2", "assets/enemies/white sheep/sheep-right-2.png", {
      frameWidth: 32, frameHeight: 32
    });

    // Load cyan sheep sprites
    this.load.spritesheet("cyanSheepLeft-1", "assets/enemies/cyan sheep/cyan-sheep-left-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("cyanSheepRight-1", "assets/enemies/cyan sheep/cyan-sheep-right-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("cyanSheepLeft-2", "assets/enemies/cyan sheep/cyan-sheep-left-2.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("cyanSheepRight-2", "assets/enemies/cyan sheep/cyan-sheep-right-2.png", {
      frameWidth: 32, frameHeight: 32
    });

    // Load pink sheep sprites
    this.load.spritesheet("pinkSheepLeft-1", "assets/enemies/pink sheep/pink-sheep-left-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("pinkSheepRight-1", "assets/enemies/pink sheep/pink-sheep-right-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("pinkSheepLeft-2", "assets/enemies/pink sheep/pink-sheep-left-2.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("pinkSheepRight-2", "assets/enemies/pink sheep/pink-sheep-right-2.png", {
      frameWidth: 32, frameHeight: 32
    });

    // Load brown sheep sprites
    this.load.spritesheet("brownSheepLeft-1", "assets/enemies/brown sheep/brown-sheep-left-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("brownSheepRight-1", "assets/enemies/brown sheep/brown-sheep-right-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("brownSheepLeft-2", "assets/enemies/brown sheep/brown-sheep-left-2.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("brownSheepRight-2", "assets/enemies/brown sheep/brown-sheep-right-2.png", {
      frameWidth: 32, frameHeight: 32
    });

    // Load scared sheep sprites
    this.load.spritesheet("scaredSheepLeft-1", "assets/enemies/scared sheep/scared-sheep-left-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("scaredSheepRight-1", "assets/enemies/scared sheep/scared-sheep-right-1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("scaredSheepLeft-2", "assets/enemies/scared sheep/scared-sheep-left-2.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("scaredSheepRight-2", "assets/enemies/scared sheep/scared-sheep-right-2.png", {
      frameWidth: 32, frameHeight: 32
    });

   // Load scared sheep alt sprites
  this.load.spritesheet("scaredSheepAltLeft-1", "assets/enemies/scared sheep alt/scared-sheep-left-1.png", {
    frameWidth: 32, frameHeight: 32
  });
  this.load.spritesheet("scaredSheepAltRight-1", "assets/enemies/scared sheep alt/scared-sheep-right-1.png", {
    frameWidth: 32, frameHeight: 32
  });
  this.load.spritesheet("scaredSheepAltLeft-2", "assets/enemies/scared sheep alt/scared-sheep-left-2.png", {
    frameWidth: 32, frameHeight: 32
  });
  this.load.spritesheet("scaredSheepAltRight-2", "assets/enemies/scared sheep alt/scared-sheep-right-2.png", {
    frameWidth: 32, frameHeight: 32
  });

    this.load.spritesheet("scaredGhost", "assets/ghost/ghost afraid/spr_afraid_0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("scaredGhostWhite", "assets/ghost/ghost afraid/spr_afraid_1.png", {
      frameWidth: 32, frameHeight: 32
    });
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
    // Create the tilemap and assign the tileset.
    this.map = this.make.tilemap({key:"map"});
    const tileset = this.map.addTilesetImage("pacman tileset");
    // Create the layer and set collision properties.
    const layer = this.map.createLayer("Tile Layer 1", [tileset]);
    layer.setCollisionByExclusion(-1, true);
    // Create the player character and enable physics
    this.pacman = this.physics.add.sprite(230, 432, "Farm boy0");
    

    // Create animations for the character.
    this.anims.create({
      key: "neutral",
      frames: [
        { key: "Farm boy0" },
      ],
      frameRate: 10
    });

    this.anims.create({
      key: "walk-right",
      frames: [
        { key: "Farm boy1" },
        { key: "Farm boy2" },
      ],
      frameRate: 7,
      repeat: -1
    });

    this.anims.create({
      key: "walk-left",
      frames: [
        { key: "Farm boy3" },
        { key: "Farm boy4" },
      ],
      frameRate: 7,
      repeat: -1
    });

    this.anims.create({
      key: "walk-down",
      frames: [
        { key: "Farm boy5" },
        { key: "Farm boy6" },
      ],
      frameRate: 7,
      repeat: -1
    });

    this.anims.create({
      key: "walk-up",
      frames: [
        { key: "Farm boy7" },
        { key: "Farm boy8" },
      ],
      frameRate: 7,
      repeat: -1
    });

    //white sheep animations
    this.anims.create({
      key: "whiteSheep-right",
      frames: [
        { key: "whiteSheepRight-1" },
        { key: "whiteSheepRight-2" },
      ],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "whiteSheep-left",
      frames: [
        { key: "whiteSheepLeft-1" },
        { key: "whiteSheepLeft-2" },
      ],
      frameRate: 7,
      repeat: -1
    });

    //cyan sheep animations
    this.anims.create({
      key: "cyanSheep-right",
      frames: [
        { key: "cyanSheepRight-1" },
        { key: "cyanSheepRight-2" },
      ],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "cyanSheep-left",
      frames: [
        { key: "cyanSheepLeft-1" },
        { key: "cyanSheepLeft-2" },
      ],
      frameRate: 7,
      repeat: -1
    });

    //pink sheep animations
    this.anims.create({
      key: "pinkSheep-right",
      frames: [
        { key: "pinkSheepRight-1" },
        { key: "pinkSheepRight-2" },
      ],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "pinkSheep-left",
      frames: [
        { key: "pinkSheepLeft-1" },
        { key: "pinkSheepLeft-2" },
      ],
      frameRate: 7,
      repeat: -1
    });


    //brown sheep animations
    this.anims.create({
      key: "brownSheep-right",
      frames: [
        { key: "brownSheepRight-1" },
        { key: "brownSheepRight-2" },
      ],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "brownSheep-left",
      frames: [
        { key: "brownSheepLeft-1" },
        { key: "brownSheepLeft-2" },
      ],
      frameRate: 7,
      repeat: -1
    });

    //scared sheep animations
    this.anims.create({
      key: "scaredSheep-right",
      frames: [
        { key: "scaredSheepRight-1" },
        { key: "scaredSheepRight-2" },
      ],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "scaredSheep-left",
      frames: [
        { key: "scaredSheepLeft-1" },
        { key: "scaredSheepLeft-2" },
      ],
      frameRate: 7,
      repeat: -1
    });

    //scared sheep alt animations
    this.anims.create({
      key: "scaredSheepAlt-right",
      frames: [
        { key: "scaredSheepAltRight-1" },
        { key: "scaredSheepAltRight-2" },
      ],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "scaredSheepAlt-left",
      frames: [
        { key: "scaredSheepAltLeft-1" },
        { key: "scaredSheepAltLeft-2" },
      ],
      frameRate: 7,
      repeat: -1
    });

    // Create the character's death animation.
    this.anims.create({
      key: "farmBoyDeath",
      frames: [
        { key: "farmBoyDeath1" },
        { key: "farmBoyDeath2" },
        { key: "farmBoyDeath3" },
      ],
      frameRate: 3,
      repeat: 0
    });

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

    
  }


  update(time, delta) {
    // Update the score text display with the current score.
    if (this.isStarting) return;

    // Update the score text display with the current score.
    if(!this.isPacmanAlive || this.lives === 0)
      return;

    // Update the score text display with the current score.
    CharacterMovement.handleDirectionInput.call(this);
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


