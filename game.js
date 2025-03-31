import * as Movement from "./src/controllers/characterMovement.js";
import * as GhostBehavior from "./src/controllers/ghostBehaviors.js";
import * as characterDeath from "./src/controllers/characterDeath.js";
import * as EnemyMovement from "./src/controllers/enemyMovement.js";
import * as MazeUtils from "./src/controllers/mazeUtils.js";
import * as EnemyDeath from "./src/controllers/enemyDeath.js";


class Pacman extends Phaser.Scene {
  constructor() {
    super({ key: 'Pacman' });
    this.Pacman =null;
    this.direction = "null";
    this.previousDirection = "left";
    this.blockSize =16;
    this.board = [];
    this.speed = 170;
    this.ghostSpeed = this.speed*0.7;
    this.intersections = [];
    this.nextIntersection = null;
    this.oldNextIntersection = null;

    this.PINKY_SCATTER_TARGET = {x:432,y:80};
    this.BLINKY_SCATTER_TARGET =  {x:32,y:80};
    this.INKY_SCATTER_TARGET =  {x:432,y:528};
    this.CLYDE_SCATTER_TARGET =  {x:32,y:528};

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
    
  }


  preload() {

    // Load tilemap and tileset asset
    this.load.image("pacman tileset","assets/pac man tiles/tileset.png");
    this.load.tilemapTiledJSON("map","assets/pacman-map.json");

    //Enter Farm Boy
    this.load.spritesheet("Farm boy0","assets/Farm boy/Farm boy-0.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy1","assets/Farm boy/Farm boy-1.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy2","assets/Farm boy/Farm boy-2.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy3","assets/Farm boy/Farm boy-3.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy4","assets/Farm boy/Farm boy-4.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy5","assets/Farm boy/Farm boy-5.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy6","assets/Farm boy/Farm boy-6.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy7","assets/Farm boy/Farm boy-7.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("Farm boy8","assets/Farm boy/Farm boy-8.png",{
      frameWidth:32,frameHeight:32
    });


    //Death Animation
    this.load.spritesheet("pacmanDeath1","assets/pac man & life counter & death/pac man death/spr_pacdeath_0.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("pacmanDeath2","assets/pac man & life counter & death/pac man death/spr_pacdeath_1.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("pacmanDeath3","assets/pac man & life counter & death/pac man death/spr_pacdeath_2.png",{
      frameWidth:32,frameHeight:32
    });


    // Pellets|Power Pellets
    this.load.image("dot","assets/pacman items/dot.png");
    this.load.image("powerPill","assets/pacman items/spr_power_pill_0.png");


    this.load.spritesheet("pinkGhost","assets/ghost/pink ghost/spr_ghost_pink_0.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("orangeGhost","assets/ghost/orange ghost/spr_ghost_orange_0.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("blueGhost","assets/ghost/blue ghost/spr_ghost_blue_0.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("redGhost","assets/ghost/red ghost/spr_ghost_red_0.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("scaredGhost","assets/ghost/ghost afraid/spr_afraid_0.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.spritesheet("scaredGhostWhite","assets/ghost/ghost afraid/spr_afraid_1.png",{
      frameWidth:32,frameHeight:32
    });
    this.load.image("endGameImage","assets/pac man text/spr_message_2.png");
  }
  create() {
    this.map = this.make.tilemap({key:"map"});
    const tileset = this.map.addTilesetImage("pacman tileset");
    const layer = this.map.createLayer("Tile Layer 1",[tileset]);
    layer.setCollisionByExclusion(-1,true);
    this.pacman = this.physics.add.sprite(230,432,"Farm boy0");

   this.anims.create({
      key:"neutral",
      frames: [
        {key:"Farm boy0"},
      ],
      frameRate:10
    });

    this.anims.create({
      key:"walk-right",
      frames: [
        {key:"Farm boy1"},
        {key:"Farm boy2"},
      ],
      frameRate:7,
      repeat: -1
    });

    this.anims.create({
      key:"walk-left",
      frames: [
        {key:"Farm boy3"},
        {key:"Farm boy4"},
      ],
      frameRate:7,
      repeat: -1
    });

    this.anims.create({
      key:"walk-down",
      frames: [
        {key:"Farm boy5"},
        {key:"Farm boy6"},
      ],
      frameRate:7,
      repeat: -1
    });

    this.anims.create({
      key:"walk-up",
      frames: [
        {key:"Farm boy7"},
        {key:"Farm boy8"},
      ],
      frameRate:7,
      repeat: -1
    }); 


    this.anims.create({
      key: "pacmanDeath",
      frames: [
        {key: "pacmanDeath1"},
        {key: "pacmanDeath2"},
        {key: "pacmanDeath3"},
      ],
      frameRate: 10,
      repeat:0
    });

    
    this.physics.add.collider(this.pacman,layer);
    this.dots = this.physics.add.group();
    this.powerPills = this.physics.add.group();
    MazeUtils.populateBoardAndTrackEmptyTiles.call(this, layer);
    this.physics.add.overlap(this.pacman,this.dots,this.eatDot,null,this);
    this.physics.add.overlap(this.pacman,this.powerPills,this.eatPowerPill,null,this);
    this.cursors = this.input.keyboard.createCursorKeys();
    MazeUtils.detectIntersections.call(this);
    EnemyMovement.initializeGhosts.call(this, layer);
    let startPoint = {x:232,y:240};
    this.pinkGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint,this.PINKY_SCATTER_TARGET);
    this.pinkGhost.nextIntersection = this.pinkGhost.path.shift();

    this.blueGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint,this.INKY_SCATTER_TARGET);
    this.blueGhost.nextIntersection = this.blueGhost.path.shift();

    this.orangeGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint,this.CLYDE_SCATTER_TARGET);
    this.orangeGhost.nextIntersection = this.orangeGhost.path.shift();

    this.redGhost.path = GhostBehavior.aStarAlgorithm.call(this, startPoint,this.BLINKY_SCATTER_TARGET);
    this.redGhost.nextIntersection = this.redGhost.path.shift();

    this.ghosts = [this.pinkGhost,this.redGhost,this.orangeGhost,this.blueGhost];

    this.ghosts.forEach(ghost => {
      this.physics.add.overlap(this.pacman,ghost,EnemyDeath.handlePacmanGhostCollision,null,this);
    });
      this.lifeCounter1 = this.add.image(32,32,"Farm boy0");
      this.lifeCounter2 = this.add.image(56,32,"Farm boy0");

    // Pause menu scene
    this.input.keyboard.on('keydown-P', () => {
      this.scene.launch('PauseMenu');  // Start the pause menu scene
      this.scene.pause();              // Pause the current scene
    });
    }

  
  eatDot(pacman,dot) {
    dot.disableBody(true,true);
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


  update() {
    if(!this.isPacmanAlive || this.lives === 0)
      return;

    Movement.handleDirectionInput.call(this);
    Movement.handlePacmanMovement.call(this);
    Movement.teleportPacmanAcrossWorldBounds.call(this);

    if(this.pinkGhost.enteredMaze) {
     EnemyMovement.handleGhostDirection.call(this, this.pinkGhost);
     EnemyMovement.handleGhostMovement.call(this, this.pinkGhost);
    }
    if(this.orangeGhost.enteredMaze) {
     EnemyMovement.handleGhostDirection.call(this, this.orangeGhost);
     EnemyMovement.handleGhostMovement.call(this, this.orangeGhost);
    }
    if(this.blueGhost.enteredMaze) {
      EnemyMovement.handleGhostDirection.call(this, this.blueGhost);
      EnemyMovement.handleGhostMovement.call(this, this.blueGhost);
    }
    if(this.redGhost.enteredMaze) {
      EnemyMovement.handleGhostDirection.call(this, this.redGhost);
      EnemyMovement.handleGhostMovement.call(this, this.redGhost);
    }
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
  type:Phaser.AUTO,
  width:464,
  height:560,
  scale: {
    mode: Phaser.Scale.FIT,         // Fit the screen
    autoCenter: Phaser.Scale.NO_CENTER  // Manually adjust centering
  },
  parent:"container",
  backgroundColor:"#000000",
  physics:{
    default:"arcade",
    arcade:{
      gravity:{y:0},
      debug: false,
    },
  },
  scene: [Pacman, PauseMenu],  // Added pause screen scene
 };
 const game = new Phaser.Game(config);
 

 