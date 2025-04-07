// Handles the player's (Pacman's) directional input from the arrow keys.
// It updates the current and previous direction, and determines the next intersection.
export function handleDirectionInput() {

  // Define the four arrow keys.
  const arrowKeys = ["left", "right", "up", "down"];

  // Loop through each key.
  for (const key of arrowKeys) {

    // Check if the key is pressed and is not the current direction,
    // or if the player has just respawned (hasRespawned flag is true).
    if ((this.cursors[key].isDown && this.direction !== key) || (this.hasRespawned)) {

      // If the player just respawned, toggle the flag off.
      if (this.hasRespawned)
        this.hasRespawned = !this.hasRespawned;
  
      // Save the previous direction.
      this.previousDirection = this.direction;

      // Update the current direction to the newly pressed key.
      this.direction = key;

      // Compute the next intersection in the direction of the input.
      // getNextIntersectionInNextDirection uses the player's position, the previous direction, and the new key.
      this.nextIntersection = getNextIntersectionInNextDirection.call(
        this,
        this.pacman.x,
        this.pacman.y,
        this.previousDirection,
        key
      );
      break;
    }
  }
}


// Given the current position (currentX, currentY), the current moving direction, and the desired next direction,
// this function returns the next intersection along that new direction (if any).
export function getNextIntersectionInNextDirection(currentX, currentY, currentDirection, nextDirection) {
  let filteredIntersections;
  
  // Determine boolean flags for the current direction.
  const isUp = currentDirection === "up";
  const isDown = currentDirection === "down";
  const isLeft = currentDirection === "left";
  const isRight = currentDirection === "right";
  
  filteredIntersections = this.intersections.filter((intersection) => {
    return (
      (
        (isUp && intersection.x === currentX && intersection.y <= currentY) ||
        (isDown && intersection.x === currentX && intersection.y >= currentY) ||
        (isLeft && intersection.y === currentY && intersection.x <= currentX) ||
        (isRight && intersection.y === currentY && intersection.x >= currentX)
      ) &&
      isIntersectionInDirection.call(this, intersection, nextDirection)
    );
  })
  // Sort the filtered intersections so that the closest one in the intended direction is first.
  .sort((a, b) => {
    if (isUp || isDown) {
      return isUp ? b.y - a.y : a.y - b.y;
    } else {
      return isLeft ? b.x - a.x : a.x - b.x;
    }
  });
  
  // Return the closest valid intersection (or null if none found).
  return filteredIntersections ? filteredIntersections[0] : null;
}


// Checks if the given intersection has an open path in the specified direction.
export function isIntersectionInDirection(intersection, direction) {
  switch (direction) {
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


// Handles the continuous movement of character by updating its position
// based on the next intersection and current velocity.
export function handlePacmanMovement() {
  let nextIntersectionx = null;
  let nextIntersectiony = null;

  // If there's a next intersection defined, extract its coordinates.
  if (this.nextIntersection) {
    nextIntersectionx = this.nextIntersection.x;
    nextIntersectiony = this.nextIntersection.y;
  }
  
  // Determine whether character is currently moving in any direction.
  const isMovingRight = this.pacman.body.velocity.x > 0;
  const isMovingLeft = this.pacman.body.velocity.x < 0;
  const isMovingUp = this.pacman.body.velocity.y < 0;
  const isMovingDown = this.pacman.body.velocity.y > 0;
  
  // Use a switch based on the current direction to adjust movement:
  switch (this.direction) {
    case "left":
      handleMovementInDirection.call(this,
        "left", "right", this.pacman.y, nextIntersectiony, this.pacman.x,
        true, false, 0, -this.speed, 0, this.pacman.body.velocity.y
      );
      // Play the left-walk animation only if moving left.
      if (isMovingLeft) {
        this.pacman.play("walk-left", true);
      }
      break;
    case "right":
      handleMovementInDirection.call(this,
        "right", "left", this.pacman.y, nextIntersectiony, this.pacman.x,
        true, false, 180, this.speed, 0, this.pacman.body.velocity.y
      );
      if (isMovingRight) {
        this.pacman.play("walk-right", true);
      }
      break;
    case "up":
      handleMovementInDirection.call(this,
        "up", "down", this.pacman.x, nextIntersectionx, this.pacman.y,
        false, true, -90, 0, -this.speed, this.pacman.body.velocity.x
      );
      if (isMovingUp) {
        this.pacman.play("walk-up", true);
      }
      break;
    case "down":
      handleMovementInDirection.call(this,
        "down", "up", this.pacman.x, nextIntersectionx, this.pacman.y,
        false, true, 90, 0, this.speed, this.pacman.body.velocity.x
      );
      if (isMovingDown) {
        this.pacman.play("walk-down", true);
      }
      break;
    default:

      // If no direction, stop movement and play the neutral animation.
      this.pacman.setVelocity(0, 0);
      if (!this.pacman.anims.isPlaying || this.pacman.anims.currentAnim.key !== "neutral") {
        this.pacman.play("neutral", true);
      }
      break;
  }
  
  // If character is not moving, ensure the neutral animation is playing.
  if (!isMovingRight && !isMovingLeft && !isMovingUp && !isMovingDown &&
      (!this.pacman.anims.isPlaying || this.pacman.anims.currentAnim.key !== "neutral")) {
    this.pacman.play("neutral", true);
  }
}


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

  // Determine the perpendicular directions based on the current moving direction.
  // If moving left or right, the perpendicular directions are up and down.
  // If moving up or down, the perpendicular directions are left and right.
  const perpendicularDirection =
    currentDirection === "left" || currentDirection === "right"
      ? ["up", "down"]
      : ["left", "right"];

  // Initialize a condition flag to decide if we should update Pacman's position.    
  let condition = false;

  // Only compute the condition if a next intersection is defined.
  if (this.nextIntersection) {
    condition =
      (this.previousDirection === perpendicularDirection[0] &&
        pacmanPosition <= intersectionPosition) ||
      (this.previousDirection === perpendicularDirection[1] &&
        pacmanPosition >= intersectionPosition) ||
      this.previousDirection === oppositeDirection;
  }
  
  // If the condition is true, adjust Pacman's position to snap to the intersection.
  if (condition) {

    // Define the new position along the movement axis (either x or y) as the intersection's coordinate.
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


// Adjusts character's position to ensure he aligns perfectly with the grid.
// This is used when there's a slight misalignment in position relative to the block size.
export function adjustPacmanPosition(velocityX, velocityY) {

  // If character's x position is not aligned to the grid and he's moving vertically,
  // snap his x position to the nearest multiple of blockSize.
  if (this.pacman.x % this.blockSize !== 0 && velocityY > 0) {
    let nearestMultiple = Math.round(this.pacman.x / this.blockSize) * this.blockSize;
    this.pacman.body.reset(nearestMultiple, this.pacman.y);
  }

  // If character's y position is not aligned and he's moving horizontally,
  // snap his y position to the nearest multiple of blockSize.
  if (this.pacman.y % this.blockSize !== 0 && velocityX > 0) {
    let nearestMultiple = Math.round(this.pacman.y / this.blockSize) * this.blockSize;
    this.pacman.body.reset(this.pacman.x, nearestMultiple);
  }
}


// Changes character's velocity (i.e., updates his direction).
// This function directly sets the velocity based on the provided values.
export function changeDirection(flipX, flipY, angle, velocityX, velocityY) {
  this.pacman.setVelocityY(velocityY);
  this.pacman.setVelocityX(velocityX);
}


// Checks if character has reached the world bounds and, if so, teleports him to the opposite side.
// This creates a wrap-around effect on the horizontal axis.
export function teleportPacmanAcrossWorldBounds() {
  const worldBounds = this.physics.world.bounds;
  if (this.pacman.x <= worldBounds.x) {

    // Reset position to the right edge.
    this.pacman.body.reset(worldBounds.right - this.blockSize, this.pacman.y);

    // Recalculate next intersection based on the new position.
    this.nextIntersection = getNextIntersectionInNextDirection.call(this, this.pacman.x, this.pacman.y, "left", this.direction);

    // Set the horizontal velocity.
    this.pacman.setVelocityX(-this.speed);
  }
  if (this.pacman.x >= worldBounds.right) {
    // Reset position to the left edge.
    this.pacman.body.reset(worldBounds.x + this.blockSize, this.pacman.y);

    // Recalculate next intersection.
    this.nextIntersection = getNextIntersectionInNextDirection.call(this, this.pacman.x, this.pacman.y, "right", this.direction);

    // Set the horizontal velocity.
    this.pacman.setVelocityX(this.speed);
  }
}
