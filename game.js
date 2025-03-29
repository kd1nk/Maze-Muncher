import * as Movement from "./src/controllers/characterMovement.js";
import * as GhostBehavior from "./src/controllers/ghostBehaviors.js";

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
    this.populateBoardAndTrackEmptyTiles(layer);
    this.physics.add.overlap(this.pacman,this.dots,this.eatDot,null,this);
    this.physics.add.overlap(this.pacman,this.powerPills,this.eatPowerPill,null,this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.detectIntersections();
    this.initializeGhosts(layer);
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
      this.physics.add.overlap(this.pacman,ghost,this.handlePacmanGhostCollision,null,this);
    });
      this.lifeCounter1 = this.add.image(32,32,"Farm boy0");
      this.lifeCounter2 = this.add.image(56,32,"Farm boy0");

    // Pause menu scene
    this.input.keyboard.on('keydown-P', () => {
      this.scene.launch('PauseMenu');  // Start the pause menu scene
      this.scene.pause();              // Pause the current scene
    });
    }

  initializeGhosts(layer) {
    this.pinkGhost = this.initializeGhost(232,290,"pinkGhost",layer);
    this.orangeGhost = this.initializeGhost(210,290,"orangeGhost",layer);
    this.redGhost = this.initializeGhost(232,290,"redGhost",layer);
    this.blueGhost = this.initializeGhost(255,290,"blueGhost",layer);
    this.ghosts = [this.pinkGhost,this.redGhost,this.orangeGhost,this.blueGhost];
    this.startGhostEntries();
  }

  startGhostEntries() {
    this.ghosts.forEach((ghost,index)=>{
      if (ghost.entryTimer) {
        clearTimeout(ghost.entryTimer);
      }
      ghost.entryTimer =  setTimeout(()=>{
        this.enterMaze(ghost);
      },this.entryDelay*(index));
    });
  }

  enterMaze(ghost) {
    ghost.setPosition(232,240);
    ghost.enteredMaze = true;
    if(this.currentMode !== "scared")
      ghost.hasBeenEaten = true;
  }
  initializeGhost(x,y,spriteKey,layer) {
    const ghost = this.physics.add.sprite(x,y,spriteKey);
    this.physics.add.collider(ghost,layer);
    ghost.originalTexture = spriteKey;
    ghost.direction = "right";
    ghost.previousDirection = "right";
    ghost.nextIntersection = null;
    ghost.enteredMaze = false;
    return ghost;
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
    this.pacmanDies();
   }
 }
  
 pacmanDies() {
   if(!this.isPacmanAlive)
    return;

   this.pacman.setVelocityY(0);
   this.pacman.setVelocityX(0);
   this.isPacmanAlive = false;
   this.pacman.anims.stop();

   this.pacman.play("pacmanDeath");
   this.time.delayedCall(2000,()=>{
    this.resetAfterDeath();
   });
 }
 resetAfterDeath() {
  this.lives -=1;
  if(this.lives ===1)
    this.lifeCounter1.destroy();
  if(this.lives ===2)
    this.lifeCounter2.destroy();
  if(this.lives>0) {
    this.pacman.setPosition(230,432);
    this.resetGhosts();
    this.anims.create({
      key:"pacmanAnim",
      frames: [
        {key:"pacman"},
        {key:"pacman1"},
        {key:"pacman2"},
        {key:"pacman3"},
        {key:"pacman4"},
      ],
      frameRate:10,
      repeat:-1,
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
    this.add.image(this.cameras.main.centerX,this.cameras.main.centerY+56,"endGameImage").setOrigin(0.5);
  }
  this.isPacmanAlive = true;
  this.hasRespawned = true;
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
  this.startGhostEntries();
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
  this.enterMaze(ghost);
  let target = this.currentMode === "chase" ?
  GhostBehavior.getChaseTarget.call(this, ghost) : GhostBehavior.getScatterTarget.call(this, ghost);
  GhostBehavior.updateGhostPath.call(this, ghost,target);
}

  update() {
    if(!this.isPacmanAlive || this.lives === 0)
      return;

    Movement.handleDirectionInput.call(this);
    Movement.handlePacmanMovement.call(this);
    Movement.teleportPacmanAcrossWorldBounds.call(this);

    if(this.pinkGhost.enteredMaze) {
     this.handleGhostDirection(this.pinkGhost);
     this.handleGhostMovement(this.pinkGhost);
    }
    if(this.orangeGhost.enteredMaze) {
     this.handleGhostDirection(this.orangeGhost);
     this.handleGhostMovement(this.orangeGhost);
    }
    if(this.blueGhost.enteredMaze) {
      this.handleGhostDirection(this.blueGhost);
      this.handleGhostMovement(this.blueGhost);
    }
    if(this.redGhost.enteredMaze) {
      this.handleGhostDirection(this.redGhost);
      this.handleGhostMovement(this.redGhost);
    }
  }
    

  handleGhostDirection(ghost) {
    if(GhostBehavior.isInghostHouse.call(this, ghost.x,ghost.y)){
      this.changeGhostDirection(ghost,0,-this.ghostSpeed);
      if(ghost.direction === "down")
      ghost.direction = "up";
    }

    const isMoving = ghost.body.velocity.x !== 0 || ghost.body.velocity.y !== 0;
    if(!isMoving) {
      ghost.stuckTimer = (ghost.stuckTimer || 0) +1;
      if(ghost.stuckTimer>30) {
        ghost.stuckTimer = 0;
        let newTarget = this.currentMode === "scared" ? GhostBehavior.getScaredTarget.call(this) :
        this.currentMode === "chase" ? GhostBehavior.getChaseTarget.call(this, ghost) : GhostBehavior.getScatterTarget.call(this, ghost);
        GhostBehavior.updateGhostPath.call(this, ghost,newTarget);
      }
    } else 
        ghost.stuckTimer = 0;

    if(ghost.body.velocity.x==0 && ghost.body.velocity.y == 0) {
      this.adjustGhostPosition(ghost);
    }

    let isAtIntersection = this.isGhostAtIntersection(ghost.nextIntersection,ghost.x,ghost.y,ghost.direction);
  
    if(isAtIntersection) {
      if((this.PINKY_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.PINKY_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" && ghost.texture.key==="pinkGhost")
        return;
      if((this.BLINKY_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.BLINKY_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" &&  ghost.texture.key==="redGhost")
        return;
      if((this.INKY_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.INKY_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" &&  ghost.texture.key==="blueGhost")
        return;
      if((this.CLYDE_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.CLYDE_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" &&  ghost.texture.key==="orangeGhost")
        return;

      if(this.currentMode === "chase") {
        let chaseTarget = GhostBehavior.getChaseTarget.call(this, ghost);
        GhostBehavior.updateGhostPath.call(this, ghost,chaseTarget);
      }

      if(ghost.path.length>0) {
        ghost.nextIntersection = ghost.path.shift();
      }
      if(ghost.path.length ==0 && this.currentMode === "scared") {
        let scaredTarget = GhostBehavior.getScaredTarget.call(this);
        GhostBehavior.updateGhostPath.call(this, ghost,scaredTarget);
      }
      
      let newDirection = this.getGhostNextDirection(ghost,ghost.nextIntersection);
      ghost.previousDirection = ghost.direction;
      ghost.direction = newDirection;
    }
  }

 adjustGhostPosition(ghost) {
  if(ghost.x%this.blockSize!==0){
    let nearestMultiple = Math.round(ghost.x/this.blockSize)*this.blockSize;
    ghost.body.reset(nearestMultiple,ghost.y);
  }  
  if(ghost.y%this.blockSize!==0){
    let nearestMultiple = Math.round(ghost.y/this.blockSize)*this.blockSize;
    ghost.body.reset(ghost.x,nearestMultiple);
  }

 }
 
 isGhostAtIntersection(intersection,currentX,currentY,direction) {
  const isUp = direction === "up";
  const isDown = direction === "down";
  const isLeft = direction === "left";
  const isRight = direction === "right";
   
  let condition = ((isUp && intersection.x === currentX && intersection.y>=currentY) ||(isDown && intersection.x === currentX && intersection.y<=currentY) || (isLeft && intersection.y === currentY && intersection.x>=currentX) || (isRight && intersection.y === currentY && intersection.x<=currentX) );
  return condition;
 }
 
 getGhostNextDirection(ghost,intersection) {
  if(Math.abs(intersection.x-ghost.x)<this.blockSize && ghost.y<=intersection.y)
    return "down";
  if(Math.abs(intersection.x-ghost.x)<this.blockSize && ghost.y>=intersection.y)
    return "up";
  if(Math.abs(intersection.y-ghost.y)<this.blockSize && ghost.x<=intersection.x)
    return "right";
  if(Math.abs(intersection.y-ghost.y)<this.blockSize && ghost.x>=intersection.x)
    return "left";
  return "up";
 }


  handleGhostMovement(ghost) {
    let nextIntersectionx = null;
    let nextIntersectiony = null;
    if(ghost.nextIntersection) {
      nextIntersectionx = ghost.nextIntersection.x;
      nextIntersectiony = ghost.nextIntersection.y;
    }
    switch(ghost.direction) {
      case "left":
        this.handleGhostMovementInDirection(ghost,"left","right",ghost.y,nextIntersectiony,ghost.x,-this.ghostSpeed,0,ghost.body.velocity.y);
        break;
        case "right":
          this.handleGhostMovementInDirection(ghost,"right","left",ghost.y,nextIntersectiony,ghost.x,this.ghostSpeed,0,ghost.body.velocity.y);
          break; 
       case "up":
          this.handleGhostMovementInDirection(ghost,"up","down",ghost.x,nextIntersectionx,ghost.y,0,-this.ghostSpeed,ghost.body.velocity.x);
          break; 
      case "down":
        this.handleGhostMovementInDirection(ghost,"down","up",ghost.x,nextIntersectionx,ghost.y,0,this.ghostSpeed,ghost.body.velocity.x);
        break;      
    }
  }

  handleGhostMovementInDirection(ghost,currentDirection,oppositeDirection,ghostPosition,intersectionPosition,movingCoordinate,velocityX,velocityY,currentVelocity) {
    let perpendicularDirection = currentDirection === "left" || currentDirection === "right" ? ["up","down"]:["left","right"];
    let condition = false;
    if(ghost.nextIntersection)
      condition = (ghost.previousDirection == perpendicularDirection[0] && ghostPosition<=intersectionPosition) || (ghost.previousDirection == perpendicularDirection[1] && ghostPosition>=intersectionPosition) ||(ghost.previousDirection === oppositeDirection);
    if(condition) {
      let newPosition = intersectionPosition;
      if(ghost.previousDirection != oppositeDirection && newPosition !== ghostPosition) {
        if(currentDirection === "left" || currentDirection === "right")
          ghost.body.reset(movingCoordinate,newPosition);
        else ghost.body.reset(newPosition,movingCoordinate);
      }
      this.changeGhostDirection(ghost,velocityX,velocityY);
    }
    else if (currentVelocity === 0) {
      this.changeGhostDirection(ghost,velocityX,velocityY);
    }
  }

changeGhostDirection(ghost,velocityX,velocityY) {
  ghost.setVelocityY(velocityY);
  ghost.setVelocityX(velocityX);
}

getOppositeDirection(direction) {
  switch(direction) {
    case "up":
      return "down";
    case "down":
      return "up";
    case "left":
      return "right";
    case "right":
      return "left";  
    default:
      return "";
  }
}
getPerpendicularDirection(direction) {
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
}


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
 

 