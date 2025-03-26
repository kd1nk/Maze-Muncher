// src/scenes/PacmanScene.js

import {
  initializeGhost,
  initializeGhosts,
  startGhostEntries,
  updateGhostPath,
  handleGhostDirection,
  handleGhostMovement,
  adjustGhostPosition,
  getGhostNextDirection,
  changeGhostDirection,
} from "../controllers/GhostController.js";

import {
  handleDirectionInput,
  handlePacmanMovement,
  teleportPacmanAcrossWorldBounds,
  changeDirection,
  adjustPacmanPosition,
  getNextIntersectionInNextDirection,
  isIntersectionInDirection,
} from "../controllers/MovementController.js";

import {
  populateBoardAndTrackEmptyTiles,
  detectIntersections,
  isPathOpenAroundPoint,
  isPointClear,
  eatDot,
  eatPowerPill,
  setGhostsToScaredMode,
} from "../controllers/BoardManager.js";

import {
  initModeTimers,
  setModeTimer,
  switchMode,
} from "../controllers/TimerManager.js";
import { aStarAlgorithm, getNextIntersection } from "../utils/AStar.js";

export class PacmanScene extends Phaser.Scene {
  constructor() {
    super({ key: "PacmanScene" });
    // Initialize core game properties.
    this.board = [];
    this.intersections = [];
    this.ghosts = [];
    this.direction = "left";
    this.previousDirection = "left";
    this.hasRespawned = false;

    this.blockSize = 16;
    this.speed = 170;
    this.ghostSpeed = this.speed * 0.7;

    // Mode durations (in milliseconds)
    this.scatterModeDuration = 7000;
    this.chaseModeDuration = 20000;
    this.scaredModeDuration = 9000;
    this.entryDelay = 7000;

    this.lives = 3;
    this.currentMode = "scatter";
    this.previouseMode = "scatter";
  }

  preload() {
    // Load tilemap and tileset
    this.load.image("pacman tileset", "../../assets/pac man tiles/tileset.png");
    this.load.tilemapTiledJSON("map", "../../assets/pacman-map.json");

    // Load Pacman (Farm Boy) sprites
    this.load.spritesheet("Farm boy0", "../../assets/Farm boy/Farm boy-0.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy1", "../../assets/Farm boy/Farm boy-1.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy2", "../../assets/Farm boy/Farm boy-2.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy3", "../../assets/Farm boy/Farm boy-3.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy4", "../../assets/Farm boy/Farm boy-4.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy5", "../../assets/Farm boy/Farm boy-5.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy6", "../../assets/Farm boy/Farm boy-6.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy7", "../../assets/Farm boy/Farm boy-7.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Farm boy8", "../../assets/Farm boy/Farm boy-8.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Load death animations
    this.load.spritesheet(
      "pacmanDeath1",
      "../../assets/pac man & life counter & death/pac man death/spr_pacdeath_0.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "pacmanDeath2",
      "../../assets/pac man & life counter & death/pac man death/spr_pacdeath_1.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "pacmanDeath3",
      "../../assets/pac man & life counter & death/pac man death/spr_pacdeath_2.png",
      { frameWidth: 32, frameHeight: 32 }
    );

    // Load pellets and power pills
    this.load.image("dot", "../../assets/pacman items/dot.png");
    this.load.image("powerPill", "../../assets/pacman items/spr_power_pill_0.png");

    // Load ghost sprites
    this.load.spritesheet(
      "pinkGhost",
      "../../assets/ghost/pink ghost/spr_ghost_pink_0.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "orangeGhost",
      "../../assets/ghost/orange ghost/spr_ghost_orange_0.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "blueGhost",
      "../../assets/ghost/blue ghost/spr_ghost_blue_0.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "redGhost",
      "../../assets/ghost/red ghost/spr_ghost_red_0.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "scaredGhost",
      "../../assets/ghost/ghost afraid/spr_afraid_0.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "scaredGhostWhite",
      "../../assets/ghost/ghost afraid/spr_afraid_1.png",
      { frameWidth: 32, frameHeight: 32 }
    );

    // Load end game image
    this.load.image("endGameImage", "../../assets/pac man text/spr_message_2.png");
  }

  create() {
    // Create the tilemap and layer.
    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("pacman tileset");
    const layer = this.map.createLayer("Tile Layer 1", tileset, 0, 0);
    layer.setCollisionByExclusion([-1], true);

    // Create the Pacman sprite and set up animations.
    this.pacman = this.physics.add.sprite(230, 432, "Farm boy0");
    this.anims.create({
      key: "neutral",
      frames: [{ key: "Farm boy0" }],
      frameRate: 10,
    });
    this.anims.create({
      key: "walk-right",
      frames: [{ key: "Farm boy1" }, { key: "Farm boy2" }],
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-left",
      frames: [{ key: "Farm boy3" }, { key: "Farm boy4" }],
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-down",
      frames: [{ key: "Farm boy5" }, { key: "Farm boy6" }],
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-up",
      frames: [{ key: "Farm boy7" }, { key: "Farm boy8" }],
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "pacmanDeath",
      frames: [
        { key: "pacmanDeath1" },
        { key: "pacmanDeath2" },
        { key: "pacmanDeath3" },
      ],
      frameRate: 10,
      repeat: 0,
    });

    // Set collisions between Pacman and the tilemap.
    this.physics.add.collider(this.pacman, layer);

    // Create groups for dots and power pills.
    this.dots = this.physics.add.group();
    this.powerPills = this.physics.add.group();

    // Populate the board using BoardManager methods.
    populateBoardAndTrackEmptyTiles.call(this, layer);

    // Set up overlaps to handle eating dots and power pills.
    this.physics.add.overlap(this.pacman, this.dots, eatDot, null, this);
    this.physics.add.overlap(
      this.pacman,
      this.powerPills,
      eatPowerPill,
      null,
      this
    );

    // Set up keyboard input.
    this.cursors = this.input.keyboard.createCursorKeys();

    // Detect intersections on the board.
    detectIntersections.call(this);

    // Initialize ghosts using GhostController.
    this.ghosts = initializeGhosts.call(this, layer);
    startGhostEntries.call(this);

    // Set initial ghost paths using A*.
    const startPoint = { x: 232, y: 240 };
    // Assumes scatter target properties are defined in your scene.
    this.pinkGhost.path = aStarAlgorithm.call(
      this,
      startPoint,
      this.PINKY_SCATTER_TARGET
    );
    if (this.pinkGhost.path.length > 0)
      this.pinkGhost.nextIntersection = this.pinkGhost.path.shift();
    this.blueGhost.path = aStarAlgorithm.call(
      this,
      startPoint,
      this.INKY_SCATTER_TARGET
    );
    if (this.blueGhost.path.length > 0)
      this.blueGhost.nextIntersection = this.blueGhost.path.shift();
    this.orangeGhost.path = aStarAlgorithm.call(
      this,
      startPoint,
      this.CLYDE_SCATTER_TARGET
    );
    if (this.orangeGhost.path.length > 0)
      this.orangeGhost.nextIntersection = this.orangeGhost.path.shift();
    this.redGhost.path = aStarAlgorithm.call(
      this,
      startPoint,
      this.BLINKY_SCATTER_TARGET
    );
    if (this.redGhost.path.length > 0)
      this.redGhost.nextIntersection = this.redGhost.path.shift();

    // Store ghosts in an array.
    this.ghosts = [
      this.pinkGhost,
      this.redGhost,
      this.orangeGhost,
      this.blueGhost,
    ];

    // Set up collisions between Pacman and each ghost.
    this.ghosts.forEach((ghost) => {
      this.physics.add.overlap(this.pacman, ghost, (pacman, ghost) => {
        if (this.currentMode === "scared" && !ghost.hasBeenEaten) {
          ghost.setActive(false);
          ghost.setVisible(false);
          this.time.delayedCall(1000, () => {
            this.respawnGhost(ghost);
          });
        } else if (ghost.hasBeenEaten) {
          this.pacmanDies();
        }
      });
    });

    // Set up life counter display.
    this.lifeCounter1 = this.add.image(32, 32, "Farm boy0");
    this.lifeCounter2 = this.add.image(56, 32, "Farm boy0");

    // Initialize mode timers.
    initModeTimers.call(this);
  }

  update() {
    // Process player input and update Pacman's movement.
    handleDirectionInput.call(this);
    handlePacmanMovement.call(this);
    teleportPacmanAcrossWorldBounds.call(this);

    // Update each ghost.
    this.ghosts.forEach((ghost) => {
      if (ghost.enteredMaze) {
        handleGhostDirection.call(this, ghost);
        handleGhostMovement.call(this, ghost);
      }
    });
  }

  // Additional helper methods

  respawnGhost(ghost) {
    ghost.setPosition(232, 290);
    ghost.setActive(true);
    ghost.setVisible(true);
    ghost.setTexture(ghost.originalTexture);
    ghost.hasBeenEaten = true;
    this.enterMaze(ghost);
    let target =
      this.currentMode === "chase"
        ? this.getChaseTarget(ghost)
        : this.getScatterTarget(ghost);
    updateGhostPath.call(this, ghost, target);
  }

  pacmanDies() {
    if (!this.isPacmanAlive) return;
    this.pacman.setVelocity(0, 0);
    this.isPacmanAlive = false;
    this.pacman.anims.stop();
    this.pacman.play("pacmanDeath");
    this.time.delayedCall(2000, () => {
      this.resetAfterDeath();
    });
  }

  resetAfterDeath() {
    this.lives -= 1;
    if (this.lives === 1) this.lifeCounter1.destroy();
    if (this.lives === 2) this.lifeCounter2.destroy();
    if (this.lives > 0) {
      this.pacman.setPosition(230, 432);
      this.resetGhosts();
      this.anims.create({
        key: "pacmanAnim",
        frames: [
          { key: "pacman" },
          { key: "pacman1" },
          { key: "pacman2" },
          { key: "pacman3" },
          { key: "pacman4" },
        ],
        frameRate: 10,
        repeat: -1,
      });
      this.pacman.play("pacmanAnim");
      this.currentMode = "scatter";
    } else {
      this.pacman.destroy();
      this.redGhost.destroy();
      this.pinkGhost.destroy();
      this.blueGhost.destroy();
      this.orangeGhost.destroy();
      this.physics.pause();
      this.add
        .image(
          this.cameras.main.centerX,
          this.cameras.main.centerY + 56,
          "endGameImage"
        )
        .setOrigin(0.5);
    }
    this.isPacmanAlive = true;
  }

  resetGhosts() {
    this.redGhost.setPosition(232, 290);
    this.pinkGhost.setPosition(220, 290);
    this.blueGhost.setPosition(255, 290);
    this.orangeGhost.setPosition(210, 290);
    this.ghosts = [
      this.pinkGhost,
      this.redGhost,
      this.orangeGhost,
      this.blueGhost,
    ];
    this.ghosts.forEach((ghost) => {
      ghost.setTexture(ghost.originalTexture);
      ghost.hasBeenEaten = true;
      ghost.enteredMaze = false;
      clearInterval(ghost.blinkInterval);
      let target = this.getScatterTarget(ghost);
      updateGhostPath.call(this, ghost, target);
      ghost.direction = "left";
    });
    startGhostEntries.call(this);
    setModeTimer.call(this, this.scatterModeDuration);
    this.currentMode = "scatter";
    this.previouseMode = this.currentMode;
  }

  // Placeholder implementations – replace with your actual logic.
  getChaseTarget(ghost) {
    if (ghost.texture.key === "redGhost") {
      return { x: this.pacman.x, y: this.pacman.y };
    }
    if (ghost.texture.key === "pinkGhost") {
      const offset = this.blockSize * 4;
      switch (this.direction) {
        case "right":
          return { x: this.pacman.x + offset, y: this.pacman.y };
        case "left":
          return { x: this.pacman.x - offset, y: this.pacman.y };
        case "up":
          return { x: this.pacman.x, y: this.pacman.y - offset };
        case "down":
          return { x: this.pacman.x, y: this.pacman.y + offset };
        default:
          return { x: this.pacman.x, y: this.pacman.y };
      }
    }
    if (ghost.texture.key === "orangeGhost") {
      const distance = Math.hypot(
        ghost.x - this.pacman.x,
        ghost.y - this.pacman.y
      );
      return distance > this.blockSize * 8
        ? { x: this.pacman.x, y: this.pacman.y }
        : this.CLYDE_SCATTER_TARGET;
    }
    if (ghost.texture.key === "blueGhost") {
      const blinky = this.redGhost;
      let pacmanAhead = { x: this.pacman.x, y: this.pacman.y };
      const aheadOffset = this.blockSize * 2;
      switch (this.direction) {
        case "right":
          pacmanAhead = { x: this.pacman.x + aheadOffset, y: this.pacman.y };
          break;
        case "left":
          pacmanAhead = { x: this.pacman.x - aheadOffset, y: this.pacman.y };
          break;
        case "up":
          pacmanAhead = { x: this.pacman.x, y: this.pacman.y - aheadOffset };
          break;
        case "down":
          pacmanAhead = { x: this.pacman.x, y: this.pacman.y + aheadOffset };
          break;
      }
      const vectorX = pacmanAhead.x - blinky.x;
      const vectorY = pacmanAhead.y - blinky.y;
      return { x: blinky.x + 2 * vectorX, y: blinky.y + 2 * vectorY };
    }
  }

  getScatterTarget(ghost) {
    if (ghost.texture.key === "redGhost") return this.BLINKY_SCATTER_TARGET;
    if (ghost.texture.key === "pinkGhost") return this.PINKY_SCATTER_TARGET;
    if (ghost.texture.key === "orangeGhost") return this.CLYDE_SCATTER_TARGET;
    if (ghost.texture.key === "blueGhost") return this.INKY_SCATTER_TARGET;
  }

  getScaredTarget() {
    let randomIndex = Math.floor(Math.random() * this.intersections.length);
    let randomIntersection = this.intersections[randomIndex];
    return { x: randomIntersection.x, y: randomIntersection.y };
  }

  enterMaze(ghost) {
    ghost.setPosition(232, 240);
    ghost.enteredMaze = true;
    if (this.currentMode !== "scared") ghost.hasBeenEaten = true;
  }
}
