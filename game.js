import * as Movement from "./src/controllers/characterMovement.js";
import * as GhostBehavior from "./src/controllers/ghostBehaviors.js";
//import * as CharacterDeath from "./src/controllers/characterDeath.js";
import * as EnemyMovement from "./src/controllers/enemyMovement.js";
import * as MazeUtils from "./src/controllers/mazeUtils.js";
import * as EnemyDeath from "./src/controllers/enemyDeath.js";
import * as EatCorn from "./src/controllers/eatCorn.js";


class Pacman extends Phaser.Scene {
  constructor() {
    super({ key: 'Pacman' });
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

    this.PINKY_SCATTER_TARGET = { x: 432, y: 80 };
    this.BLINKY_SCATTER_TARGET = { x: 32, y: 80 };
    this.INKY_SCATTER_TARGET = { x: 432, y: 528 };
    this.CLYDE_SCATTER_TARGET = { x: 32, y: 528 };

    this.scatterModeDuration = 7000;
    this.chaseModeDuration = 20000;
    this.scaredModeDuration = 9000;
    this.entryDelay = 7000;
    this.respawnDelay = 5000;
    this.modeTimer = null;
    this.currentMode = "scatter";
    GhostBehavior.initModeTimers.call(this);

    this.lives = 3;
    this.isPacmanAlive = true;
    this.hasRespawned = false
    this.isStarting = true;

  }


  preload() {

    // Load tilemap and tileset asset
    this.load.image("pacman tileset", "assets/pac man tiles/tileset.png");
    this.load.tilemapTiledJSON("map", "assets/pacman-map.json");

    //Enter Farm Boy
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
    this.load.spritesheet("pacmanDeath1", "assets/pac man & life counter & death/pac man death/spr_pacdeath_0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("pacmanDeath2", "assets/pac man & life counter & death/pac man death/spr_pacdeath_1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("pacmanDeath3", "assets/pac man & life counter & death/pac man death/spr_pacdeath_2.png", {
      frameWidth: 32, frameHeight: 32
    });


    // Pellets|Power Pellets
    this.load.image("dot", "assets/pacman items/Corn Kernel-large.png");
    this.load.image("powerPill", "assets/pacman items/Power Bean.png");


    this.load.spritesheet("pinkGhost", "assets/ghost/pink ghost/spr_ghost_pink_0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("orangeGhost", "assets/ghost/orange ghost/spr_ghost_orange_0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("blueGhost", "assets/ghost/blue ghost/spr_ghost_blue_0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("redGhost", "assets/ghost/red ghost/spr_ghost_red_0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("scaredGhost", "assets/ghost/ghost afraid/spr_afraid_0.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("scaredGhostWhite", "assets/ghost/ghost afraid/spr_afraid_1.png", {
      frameWidth: 32, frameHeight: 32
    });
    this.load.image("endGameImage", "assets/pac man text/spr_message_2.png");
  }
  create() {
    this.createStartCountdown();

    this.map = this.make.tilemap({key:"map"});
    const tileset = this.map.addTilesetImage("pacman tileset");
    const layer = this.map.createLayer("Tile Layer 1", [tileset]);
    layer.setCollisionByExclusion(-1, true);
    this.pacman = this.physics.add.sprite(230, 432, "Farm boy0");

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


    this.anims.create({
      key: "pacmanDeath",
      frames: [
        { key: "pacmanDeath1" },
        { key: "pacmanDeath2" },
        { key: "pacmanDeath3" },
      ],
      frameRate: 10,
      repeat: 0
    });


    this.physics.add.collider(this.pacman, layer);
    this.dots = this.physics.add.group();
    this.powerPills = this.physics.add.group();
    MazeUtils.populateBoardAndTrackEmptyTiles.call(this, layer);
    this.physics.add.overlap(this.pacman, this.dots, EatCorn.eatDot, null, this);
    this.physics.add.overlap(this.pacman, this.powerPills, EatCorn.eatPowerPill, null, this);
    this.cursors = this.input.keyboard.createCursorKeys();
    MazeUtils.detectIntersections.call(this);
    EnemyMovement.initializeGhosts.call(this, layer);
    let startPoint = { x: 232, y: 240 };
    this.pinkGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint, this.PINKY_SCATTER_TARGET);
    this.pinkGhost.nextIntersection = this.pinkGhost.path.shift();

    this.blueGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint, this.INKY_SCATTER_TARGET);
    this.blueGhost.nextIntersection = this.blueGhost.path.shift();

    this.orangeGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint, this.CLYDE_SCATTER_TARGET);
    this.orangeGhost.nextIntersection = this.orangeGhost.path.shift();

    this.redGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint, this.BLINKY_SCATTER_TARGET);
    this.redGhost.nextIntersection = this.redGhost.path.shift();

    this.ghosts = [this.pinkGhost, this.redGhost, this.orangeGhost, this.blueGhost];

    this.ghosts.forEach(ghost => {
      this.physics.add.overlap(this.pacman, ghost, EnemyDeath.handlePacmanGhostCollision, null, this);
    });
    this.lifeCounter1 = this.add.image(32, 32, "Farm boy0");
    this.lifeCounter2 = this.add.image(56, 32, "Farm boy0");

    //HERE IS OUR SCORE TRACKER
    this.score = 0;
    this.scoreText = this.add.text(this.cameras.main.width / 2, 8, 'Score: 0', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5, 0);

    //HERE IS OUR TIMER AND BY PROXY, SCORE MULTIPLIER. CURRENTLY NOT WORKING.
    this.scoreMultiplier = 5.00;
    this.timeElapsed = 0;
    this.decreaseRate = 0.05;
    this.multiplierText = this.add.text(300, 32, `Multiplier: x${this.scoreMultiplier}`, {
      font: '16px Arial',
      fill: '#ffffff'
    });

    // Pause menu scene
    this.input.keyboard.on('keydown-P', () => {
      this.scene.launch('PauseMenu');  // Start the pause menu scene
      this.scene.pause();              // Pause the current scene
    });
    }

    createStartCountdown() {
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
                this.isStarting = false;
              }
            });
          }
        }
      });
    }
    
    endGame(outcome) {
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
              this.scene.restart();
            });
          }
        }
      });
    
      this.physics.pause();
      this.isPacmanAlive = false;
    }
    

  populateBoardAndTrackEmptyTiles(layer) {
    layer.forEachTile((tile)=>{
      if(!this.board[tile.y]) {
        this.board[tile.y] = [];
      }
      this.board[tile.y][tile.x] = tile.index;
      if(tile.y<4 || (tile.y>11 && tile.y<23 && tile.x>6 && tile.x<21) || (tile.y ===17 && tile.x!==6 && tile.x !==21))
        return;
      let rightTile = this.map.getTileAt(tile.x+1,tile.y,true,"Tile Layer 1");
      let bottomTile = this.map.getTileAt(tile.x,tile.y+1,true,"Tile Layer 1");
      let rightBottomTile = this.map.getTileAt(tile.x+1,tile.y+1,true,"Tile Layer 1");
      if(tile.index === -1 && rightTile && rightTile.index === -1 && bottomTile && bottomTile.index === -1 && rightBottomTile && rightBottomTile.index === -1){
        const x = tile.x*tile.width;
        const y = tile.y*tile.height;
        this.dots.create(x+tile.width,y+tile.height,"dot");
      }
    });

    this.powerPills.create(32,144,"powerPill");
    this.powerPills.create(432,144,"powerPill");
    this.powerPills.create(32,480,"powerPill");
    this.powerPills.create(432,480,"powerPill");
  }
  eatDot(pacman, dot) {
    dot.disableBody(true, true);
  
    if (this.dots.countActive(true) === 0) {
      this.endGame("win");
    }
  }
  

  eatPowerPill(pacman,powerPill) {
    powerPill.disableBody(true,true);
    this.currentMode = "scared";
    GhostBehavior.setGhostsToScaredMode.call(this);
    GhostBehavior.setModeTimer.call(this,this.scaredModeDuration);
    this.ghostSpeed = this.speed*0.5;
    this.ghosts.forEach((ghost)=>{
      ghost.hasBeenEaten = false;
    });
  }


  detectIntersections() {
    const directions = [
      {x:-this.blockSize,y:0,name:"left"},
      {x:this.blockSize,y:0,name:"right"},
      {x:0,y:-this.blockSize,name:"up"},
      {x:0,y:this.blockSize,name:"down"},     
    ];
    const blockSize = this.blockSize;
    for(let y=0; y<this.map.heightInPixels;y+=blockSize) {
      for(let x=0; x<this.map.widthInPixels;x+=blockSize) {
        if(x%blockSize !==0 || y%blockSize !==0) continue;
        if(!this.isPointClear(x,y)) continue;
        let openPaths = [];
        directions.forEach((dir)=>{
          if(this.isPathOpenAroundPoint(x+dir.x,y+dir.y)) {
            openPaths.push(dir.name);
          }
        });
        if(openPaths.length>2 && y>64 && y<530) {
          this.intersections.push({x:x,y:y,openPaths:openPaths});
        } else if (openPaths.length ===2 && y>64 && y<530) {
           const [dir1,dir2] = openPaths;
           if(((dir1==="left" || dir1 === "right")&&
           (dir2==="up" || dir2 === "down")) ||
           (dir1==="up" || dir1 === "down") &&
           (dir2==="left" || dir2 === "right")) {
            this.intersections.push({x:x,y:y,openPaths:openPaths});
           }
        }
      }
    }
  }

  isPathOpenAroundPoint(pixelX,pixelY) {
    const corners = [
      {x:pixelX-1,y:pixelY-1},
      {x:pixelX+1,y:pixelY-1},
      {x:pixelX-1,y:pixelY+1},
      {x:pixelX+1,y:pixelY+1},
    ];
    return corners.every((corner)=>{
      const tileX = Math.floor(corner.x/this.blockSize);
      const tileY = Math.floor(corner.y/this.blockSize);
      if(!this.board[tileY]|| this.board[tileY][tileX]!==-1) {
        return false;
      }
      return true;
    });
  }
  isPointClear(x,y) {
    const corners = [
      {x:x-1,y:y-1},
      {x:x+1,y:y-1},
      {x:x-1,y:y+1},
      {x:x+1,y:y+1},
    ]; 
    return corners.every((corner)=>{
      const tileX = Math.floor(corner.x/this.blockSize);
      const tileY = Math.floor(corner.y/this.blockSize);
     
      return !this.board[tileY] || this.board[tileY][tileX] === -1;
    });
  }

  
 handlePacmanGhostCollision(pacman,ghost) {
   if(this.currentMode === "scared" && !ghost.hasBeenEaten) {
    ghost.setActive(false);
    ghost.setVisible(false);
    this.time.delayedCall(1000,()=>{
      this.respawnGhost(ghost);
    });
   } else if (ghost.hasBeenEaten) {
    characterDeath.pacmanDies.call(this);
   }
 }
  

 resetGhosts() {
  this.redGhost.setPosition(232,290);
  this.pinkGhost.setPosition(220,290);
  this.blueGhost.setPosition(255,290);
  this.orangeGhost.setPosition(210,290);
  
  this.ghosts = [this.pinkGhost,this.redGhost,this.orangeGhost,this.blueGhost];
  
  this.ghosts.forEach(ghost => {
    ghost.setTexture(ghost.originalTexture);
    ghost.hasBeenEaten = true;
    ghost.enteredMaze = false;
    clearInterval(ghost.blinkInterval);
    let target = GhostBehavior.getScatterTarget.call(this, ghost);
    GhostBehavior.updateGhostPath.call(this, ghost,target);
    ghost.direction = "left";
  });
  EnemyMovement.startGhostEntries.call(this);
  GhostBehavior.setModeTimer.call(this, this.scatterModeDuration);
  this.currentMode = "scatter";
  this.previouseMode = this.currentMode;
 }

respawnGhost(ghost) {
  ghost.setPosition(232,290);
  ghost.setActive(true);
  ghost.setVisible(true);
  ghost.setTexture(ghost.originalTexture);
  ghost.hasBeenEaten = true;
  EnemyMovement.enterMaze.call(this, ghost);
  let target = this.currentMode === "chase" ?
  GhostBehavior.getChaseTarget.call(this, ghost) : GhostBehavior.getScatterTarget.call(this, ghost);
  GhostBehavior.updateGhostPath.call(this, ghost,target);
}

  update() {
    
    if (this.isStarting) return;

    if(!this.isPacmanAlive || this.lives === 0)
      return;

    Movement.handleDirectionInput.call(this);
    Movement.handlePacmanMovement.call(this);
    Movement.teleportPacmanAcrossWorldBounds.call(this);

    if (this.pinkGhost.enteredMaze) {
      EnemyMovement.handleGhostDirection.call(this, this.pinkGhost);
      EnemyMovement.handleGhostMovement.call(this, this.pinkGhost);
    }
    if (this.orangeGhost.enteredMaze) {
      EnemyMovement.handleGhostDirection.call(this, this.orangeGhost);
      EnemyMovement.handleGhostMovement.call(this, this.orangeGhost);
    }
    if (this.blueGhost.enteredMaze) {
      EnemyMovement.handleGhostDirection.call(this, this.blueGhost);
      EnemyMovement.handleGhostMovement.call(this, this.blueGhost);
    }
    if (this.redGhost.enteredMaze) {
      EnemyMovement.handleGhostDirection.call(this, this.redGhost);
      EnemyMovement.handleGhostMovement.call(this, this.redGhost);
    }
    //updating multiplier
    this.updateMultiplier(delta);
  }

  //Moved to mazeUtils.js

  /* getPerpendicularDirection(direction) {
    switch(direction) {
      case "up":
        return "right";
      case "down":
        return "left";
      case "left":
        return "up";
      case "right":
        return "down";  
      default:
        return "";
    }
  }
  
  isMovingInxDirection(direction) {
    let result =  (direction === "left" || direction === "right" ) ? true : false;
    return result;
  } */

  //---------------------------------------------------------------------


}

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


