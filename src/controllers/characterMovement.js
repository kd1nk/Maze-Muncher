export function handleDirectionInput() {
    const arrowKeys = ["left","right","up","down"];
    for (const key of arrowKeys) {
      if((this.cursors[key].isDown && this.direction!== key) || (this.hasRespawned)) {
        if(this.hasRespawned)
          this.hasRespawned = !this.hasRespawned;
  
        this.previousDirection = this.direction;
        this.direction = key;
        this.nextIntersection = getNextIntersectionInNextDirection.call(this, this.pacman.x, this.pacman.y, this.previousDirection, key)
        break;
      }
    }
  }

export function getNextIntersectionInNextDirection(currentX,currentY,currentDirection,nextDirection) {
  let filteredIntersections;
  const isUp = currentDirection === "up";
  const isDown = currentDirection === "down";
  const isLeft = currentDirection === "left";
  const isRight = currentDirection === "right";
  filteredIntersections = this.intersections.filter((intersection)=>{
    return(
      ((isUp && intersection.x === currentX && intersection.y <= currentY) ||
    (isDown && intersection.x === currentX && intersection.y>=currentY) ||
    (isLeft && intersection.y === currentY && intersection.x<=currentX) ||
  (isRight && intersection.y === currentY && intersection.x >= currentX)) &&
    isIntersectionInDirection.call(this, intersection, nextDirection)
    );
  })
  .sort((a,b)=>{
    if(isUp || isDown) {
      return isUp ? b.y-a.y : a.y-b.y;
    } else {
      return isLeft ? b.x - a.x : a.x-b.x;
    }
  });
  return filteredIntersections ? filteredIntersections[0]:null;
}


  export function isIntersectionInDirection(intersection,direction) {
    switch(direction) {
      case "up":
        return intersection.openPaths.includes("up");
      case "down":
        return intersection.openPaths.includes("down");
      case "left":
        return intersection.openPaths.includes("left");
      case "right":
        return intersection.openPaths.includes("right");  
      default:
        return false;
    }
  }

  export function handlePacmanMovement() {
    let nextIntersectionx = null;
    let nextIntersectiony = null;
    if (this.nextIntersection) {
      nextIntersectionx = this.nextIntersection.x;
      nextIntersectiony = this.nextIntersection.y;
    }
  
    // Check if we're actually moving in the intended direction
    const isMovingRight = this.pacman.body.velocity.x > 0;
    const isMovingLeft = this.pacman.body.velocity.x < 0;
    const isMovingUp = this.pacman.body.velocity.y < 0;
    const isMovingDown = this.pacman.body.velocity.y > 0;
  
    switch (this.direction) {
      case "left":
        handleMovementInDirection.call(this,
          "left", "right", this.pacman.y, nextIntersectiony, this.pacman.x,
          true, false, 0, -this.speed, 0, this.pacman.body.velocity.y
        );
        // Only change animation if we're actually moving left
        if (isMovingLeft) {
          this.pacman.play("walk-left", true);
        }
        break;
      case "right":
        handleMovementInDirection.call(this,
          "right", "left", this.pacman.y, nextIntersectiony, this.pacman.x,
          true, false, 180, this.speed, 0, this.pacman.body.velocity.y
        );
        // Only change animation if we're actually moving right
        if (isMovingRight) {
          this.pacman.play("walk-right", true);
        }
        break;
      case "up":
        handleMovementInDirection.call(this,
          "up", "down", this.pacman.x, nextIntersectionx, this.pacman.y,
          false, true, -90, 0, -this.speed, this.pacman.body.velocity.x
        );
        // Only change animation if we're actually moving up
        if (isMovingUp) {
          this.pacman.play("walk-up", true);
        }
        break;
      case "down":
        handleMovementInDirection.call(this,
          "down", "up", this.pacman.x, nextIntersectionx, this.pacman.y,
          false, true, 90, 0, this.speed, this.pacman.body.velocity.x
        );
        // Only change animation if we're actually moving down
        if (isMovingDown) {
          this.pacman.play("walk-down", true);
        }
        break;
      default:
        this.pacman.setVelocity(0, 0);
        if (!this.pacman.anims.isPlaying || this.pacman.anims.currentAnim.key !== "neutral") {
          this.pacman.play("neutral", true);
        }
        break;
    }
    
    // If we're not moving in any direction, play the neutral animation
    if (!isMovingRight && !isMovingLeft && !isMovingUp && !isMovingDown && 
        (!this.pacman.anims.isPlaying || this.pacman.anims.currentAnim.key !== "neutral")) {
      this.pacman.play("neutral", true);
    }
  }


    
  
/*   export function handleMovementInDirection(currentDirection,oppositeDirection,pacmanPosition,intersectionPosition,movingCoordinate,flipX,flipY,angle,velocityX,velocityY,currentVelocity) {
    let perpendicularDirection = currentDirection === "left" || currentDirection ==="right" ? ["up","down"] : ["left","right"];
    let condition =false;
    if (this.nextIntersection) {
      condition = (this.previousDirection === perpendicularDirection[0] && pacmanPosition <= intersectionPosition) ||
                  (this.previousDirection === perpendicularDirection[1] && pacmanPosition >= intersectionPosition) ||
                  (this.previousDirection === oppositeDirection);
    }
    this.previousDirection === oppositeDirection;
      if(condition) {
        let newPosition = intersectionPosition;
        if(this.previousDirection != oppositeDirection && newPosition !== pacmanPosition) {
          if(currentDirection === "left" || currentDirection === "right")
            this.pacman.body.reset(movingCoordinate,newPosition);
          else this.pacman.body.reset(newPosition,movingCoordinate);
        }
        changeDirection.call(this, flipX, flipY, angle, velocityX, velocityY);
        adjustPacmanPosition.call(this, velocityX, velocityY);
      
      } 
      else if (currentVelocity ===0 ) {
        changeDirection.call(this, flipX, flipY, angle, velocityX, velocityY);
        adjustPacmanPosition.call(this, velocityX, velocityY);
      }
  }
 */

  export function handleMovementInDirection(
    currentDirection,
    oppositeDirection,
    pacmanPosition,
    intersectionPosition,
    movingCoordinate,
    flipX,
    flipY,
    angle,
    velocityX,
    velocityY,
    currentVelocity
  ) {
    const perpendicularDirection =
      currentDirection === "left" || currentDirection === "right"
        ? ["up", "down"]
        : ["left", "right"];
    let condition = false;
    if (this.nextIntersection) {
      condition =
        (this.previousDirection === perpendicularDirection[0] &&
          pacmanPosition <= intersectionPosition) ||
        (this.previousDirection === perpendicularDirection[1] &&
          pacmanPosition >= intersectionPosition) ||
        this.previousDirection === oppositeDirection;
    }
    
    if (condition) {
      const newPosition = intersectionPosition;
      if (this.previousDirection !== oppositeDirection && newPosition !== pacmanPosition) {
        if (currentDirection === "left" || currentDirection === "right") {
          this.pacman.body.reset(movingCoordinate, newPosition);
        } else {
          this.pacman.body.reset(newPosition, movingCoordinate);
        }
      }
      // Call helper functions defined in movement.js using call(this) to pass the scene context
      changeDirection.call(this, flipX, flipY, angle, velocityX, velocityY);
      adjustPacmanPosition.call(this, velocityX, velocityY);
    } else if (currentVelocity === 0) {
      changeDirection.call(this, flipX, flipY, angle, velocityX, velocityY);
      adjustPacmanPosition.call(this, velocityX, velocityY);
    }
  }
  


  export function adjustPacmanPosition(velocityX,velocityY) {
    if(this.pacman.x%this.blockSize !==0 && velocityY>0) {
      let nearestMultiple = Math.round(this.pacman.x/this.blockSize)*this.blockSize;
      this.pacman.body.reset(nearestMultiple,this.pacman.y);
    }
    if(this.pacman.y%this.blockSize !==0 && velocityX>0) {
      let nearestMultiple = Math.round(this.pacman.y/this.blockSize)* this.blockSize;
      this.pacman.body.reset(this.pacman.x,nearestMultiple);
    }
  }
 
  export function changeDirection(flipX,flipY,angle,velocityX,velocityY) {
    this.pacman.setVelocityY(velocityY);
    this.pacman.setVelocityX(velocityX);
  }

  export function teleportPacmanAcrossWorldBounds() {
    const worldBounds = this.physics.world.bounds;
    if (this.pacman.x <= worldBounds.x) {
      this.pacman.body.reset(worldBounds.right - this.blockSize, this.pacman.y);
      this.nextIntersection = getNextIntersectionInNextDirection.call(this, this.pacman.x, this.pacman.y, "left", this.direction);
      this.pacman.setVelocityX(-this.speed);
    }
    if (this.pacman.x >= worldBounds.right) {
      this.pacman.body.reset(worldBounds.x + this.blockSize, this.pacman.y);
      this.nextIntersection = getNextIntersectionInNextDirection.call(this, this.pacman.x, this.pacman.y, "right", this.direction);
      this.pacman.setVelocityX(this.speed);
    }
  }