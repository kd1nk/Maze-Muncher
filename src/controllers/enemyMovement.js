import * as GhostBehavior from "./ghostBehaviors.js";



/**
 * Initializes all enemy objects for the scene.
 * Creates each enemy (pink, orange, red, blue) by calling initializeGhost,
 * then stores them in an array and starts their entry timers.
 */
export function initializeGhosts(layer) {
    console.log("initializeGhost context:", this);

    // Create each enemy using its sprite key and a given starting position.
    this.pinkGhost = initializeGhost.call(this, 232, 290, "pinkGhost", layer);
    this.orangeGhost = initializeGhost.call(this, 210, 290, "orangeGhost", layer);
    this.redGhost = initializeGhost.call(this, 232, 290, "redGhost", layer);
    this.blueGhost = initializeGhost.call(this, 255, 290, "blueGhost", layer);

    // Store the created enemies in an array for easier management.
    this.ghosts = [this.pinkGhost, this.redGhost, this.orangeGhost, this.blueGhost];

    // Start the entry sequence for each enemy.
    startGhostEntries.call(this);
}


/**
 * Starts the enemy entry timers.
 * Iterates over each enemy in the array and schedules them to call enterMaze
 * after a delay based on their index.
 */
export function startGhostEntries() {
    this.ghosts.forEach((ghost, index) => {
        if (ghost.entryTimer) {
            clearTimeout(ghost.entryTimer);
        }
        // Schedule each enemy's entry into the maze with a delay.
        ghost.entryTimer = setTimeout(() => {
            enterMaze.call(this, ghost);
        }, this.entryDelay * index);
    });
}


/**
 * Places an enemy into the maze.
 * Sets the enemy's position to a fixed point, marks it as having entered,
 * and if the current mode isn’t "scared," flags it as not yet rescued.
 *
 * @param {Phaser.GameObjects.Sprite} ghost - The enemy object to enter the maze.
 */
export function enterMaze(ghost) {
    // Set enemy's position to the entry point.
    ghost.setPosition(232, 240);

    // Mark the enemy as having entered the maze.
    ghost.enteredMaze = true;

    // If the game isn't in scared mode, mark the enemy as active (not eaten).
    if (this.currentMode !== "scared")
        ghost.hasBeenEaten = true;
}


/**
 * Creates and returns a single enemy object.
 * Adds the enemy to the physics system, enables collisions with the layer,
 * and sets initial properties like direction and texture.
 *
 * @param {number} x - The x-coordinate for the enemy.
 * @param {number} y - The y-coordinate for the enemy.
 * @param {string} spriteKey - The key for the enemy sprite.
 * @param {Phaser.Tilemaps.TilemapLayer} layer - The tile layer for collisions.
 * @returns {Phaser.Physics.Arcade.Sprite} - The created enemy.
 */
export function initializeGhost(x, y, spriteKey, layer) {
    const ghost = this.physics.add.sprite(x, y, spriteKey);

    // Enable collision between the enemy and the maze layer.
    this.physics.add.collider(ghost, layer);

    // Store the default texture key.
    ghost.originalTexture = spriteKey;

    // Initialize enemy's movement direction properties.
    ghost.direction = "right";
    ghost.previousDirection = "right";
    ghost.nextIntersection = null;
    ghost.enteredMaze = false;
    return ghost;
}


/**
 * Updates the enemy's movement direction based on its position and intersections.
 * Checks if the enemy is within the "house" area and adjusts its velocity;
 * if the enemy is stuck, it recalculates its path.
 * Finally, if the enemy reaches an intersection, it computes the next direction.
 *
 * @param {Phaser.Physics.Arcade.Sprite} ghost - The enemy whose direction is updated.
 */
export function handleGhostDirection(ghost) {
    // If the enemy is within the ghost house, force a change in velocity.
    if (GhostBehavior.isInghostHouse.call(this, ghost.x, ghost.y)) {
        changeGhostDirection.call(this, ghost, 0, -this.ghostSpeed);
        if (ghost.direction === "down")
            ghost.direction = "up";
    }

     // Check if the enemy is moving.
    const isMoving = ghost.body.velocity.x !== 0 || ghost.body.velocity.y !== 0;
    if (!isMoving) {
         // Increase a timer to detect if the enemy is stuck.
        ghost.stuckTimer = (ghost.stuckTimer || 0) + 1;
        if (ghost.stuckTimer > 30) {
            ghost.stuckTimer = 0;

            // Calculate a new target based on the current mode (scared, chase, or scatter).
            let newTarget = this.currentMode === "scared" ? GhostBehavior.getScaredTarget.call(this) :
            this.currentMode === "chase" ? GhostBehavior.getChaseTarget.call(this, ghost) : GhostBehavior.getScatterTarget.call(this, ghost);

            // Update the enemy's movement path using the new target.
            GhostBehavior.updateGhostPath.call(this, ghost, newTarget);
        }
    } else
        // Reset stuck timer if enemy is moving.
        ghost.stuckTimer = 0;

     // If the enemy has completely stopped moving, adjust its position to the grid.
    if (ghost.body.velocity.x == 0 && ghost.body.velocity.y == 0) {
        adjustGhostPosition.call(this, ghost);
    }

    // Check if the enemy is at an intersection and update its path accordingly.
    let isAtIntersection = isGhostAtIntersection.call(this, ghost.nextIntersection, ghost.x, ghost.y, ghost.direction);

    if (isAtIntersection) {
        // If the enemy is in scatter mode and at its scatter target, do nothing.
        if ((this.PINKY_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.PINKY_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" && ghost.texture.key === "pinkGhost")
            return;
        if ((this.BLINKY_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.BLINKY_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" && ghost.texture.key === "redGhost")
            return;
        if ((this.INKY_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.INKY_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" && ghost.texture.key === "blueGhost")
            return;
        if ((this.CLYDE_SCATTER_TARGET.x === ghost.nextIntersection.x) && (this.CLYDE_SCATTER_TARGET.y === ghost.nextIntersection.y) && this.currentMode === "scatter" && ghost.texture.key === "orangeGhost")
            return;

        if (this.currentMode === "chase") {
            let chaseTarget = GhostBehavior.getChaseTarget.call(this, ghost);
            GhostBehavior.updateGhostPath.call(this, ghost, chaseTarget);
        }

        if (ghost.path.length > 0) {
            ghost.nextIntersection = ghost.path.shift();
        }
        if (ghost.path.length == 0 && this.currentMode === "scared") {
            let scaredTarget = GhostBehavior.getScaredTarget.call(this);
            GhostBehavior.updateGhostPath.call(this, ghost, scaredTarget);
        }

        // Calculate the next direction for the enemy based on its position and the next intersection.
        let newDirection = getGhostNextDirection.call(this, ghost, ghost.nextIntersection);

        // Update the enemy's previous and current direction.
        ghost.previousDirection = ghost.direction;
        ghost.direction = newDirection;
    }
}


/**
 * Adjusts the enemy's position so that it aligns with the grid.
 * It calculates the nearest multiple of the block size for both x and y and resets the position.
 *
 * @param {Phaser.Physics.Arcade.Sprite} ghost - The enemy to align.
 */
export function adjustGhostPosition(ghost) {
    if (ghost.x % this.blockSize !== 0) {
        let nearestMultiple = Math.round(ghost.x / this.blockSize) * this.blockSize;
        ghost.body.reset(nearestMultiple, ghost.y);
    }
    if (ghost.y % this.blockSize !== 0) {
        let nearestMultiple = Math.round(ghost.y / this.blockSize) * this.blockSize;
        ghost.body.reset(ghost.x, nearestMultiple);
    }
}


/**
 * Determines whether an enemy is at an intersection.
 * It compares the intersection's coordinates with the enemy's position along the specified direction.
 *
 * @param {object} intersection - The intersection object with x and y properties.
 * @param {number} currentX - The enemy's current x-coordinate.
 * @param {number} currentY - The enemy's current y-coordinate.
 * @param {string} direction - The enemy's current movement direction.
 * @returns {boolean} - True if the enemy is at the intersection.
 */
export function isGhostAtIntersection(intersection, currentX, currentY, direction) {
    const isUp = direction === "up";
    const isDown = direction === "down";
    const isLeft = direction === "left";
    const isRight = direction === "right";

    let condition = ((isUp && intersection.x === currentX && intersection.y >= currentY) || (isDown && intersection.x === currentX && intersection.y <= currentY) || (isLeft && intersection.y === currentY && intersection.x >= currentX) || (isRight && intersection.y === currentY && intersection.x <= currentX));
    return condition;
}


/**
 * Calculates the enemy's next movement direction based on its current position and the next intersection.
 * It checks if the enemy is within one block and compares its coordinates with the intersection.
 *
 * @param {Phaser.Physics.Arcade.Sprite} ghost - The enemy whose direction is being calculated.
 * @param {object} intersection - The target intersection with x and y properties.
 * @returns {string} - The new direction ("up", "down", "left", or "right").
 */
export function getGhostNextDirection(ghost, intersection) {
    if (Math.abs(intersection.x - ghost.x) < this.blockSize && ghost.y <= intersection.y)
        return "down";
    if (Math.abs(intersection.x - ghost.x) < this.blockSize && ghost.y >= intersection.y)
        return "up";
    if (Math.abs(intersection.y - ghost.y) < this.blockSize && ghost.x <= intersection.x)
        return "right";
    if (Math.abs(intersection.y - ghost.y) < this.blockSize && ghost.x >= intersection.x)
        return "left";
    return "up";
}


/**
 * Handles the enemy's overall movement during the update loop.
 * Determines the next intersection coordinates and calls the directional movement handler
 * based on the enemy's current direction.
 *
 * @param {Phaser.Physics.Arcade.Sprite} ghost - The enemy to update.
 */
export function handleGhostMovement(ghost) {
    let nextIntersectionx = null;
    let nextIntersectiony = null;
    if (ghost.nextIntersection) {
        nextIntersectionx = ghost.nextIntersection.x;
        nextIntersectiony = ghost.nextIntersection.y;
    }
    // Determine movement behavior based on the enemy's current direction.
    switch (ghost.direction) {
        case "left":
            handleGhostMovementInDirection.call(this, ghost, "left", "right", ghost.y, nextIntersectiony, ghost.x, -this.ghostSpeed, 0, ghost.body.velocity.y);
            break;
        case "right":
            handleGhostMovementInDirection.call(this, ghost, "right", "left", ghost.y, nextIntersectiony, ghost.x, this.ghostSpeed, 0, ghost.body.velocity.y);
            break;
        case "up":
            handleGhostMovementInDirection.call(this, ghost, "up", "down", ghost.x, nextIntersectionx, ghost.y, 0, -this.ghostSpeed, ghost.body.velocity.x);
            break;
        case "down":
            handleGhostMovementInDirection.call(this, ghost, "down", "up", ghost.x, nextIntersectionx, ghost.y, 0, this.ghostSpeed, ghost.body.velocity.x);
            break;
    }
}



/**
 * Handles enemy movement in a specific direction based on its current direction and velocity.
 * Determines if the enemy is at a decision point (intersection) and, if so,
 * snaps the enemy to the grid and calls helper functions to update velocity and position.
 *
 * @param {Phaser.Physics.Arcade.Sprite} ghost - The enemy to update.
 * @param {string} currentDirection - The direction in which the enemy is moving.
 * @param {string} oppositeDirection - The direction opposite to the current movement.
 * @param {number} ghostPosition - The enemy's current position along the movement axis (x or y).
 * @param {number} intersectionPosition - The target coordinate from the next intersection.
 * @param {number} movingCoordinate - The coordinate (x or y) that remains constant during movement.
 * @param {number} velocityX - The desired horizontal velocity.
 * @param {number} velocityY - The desired vertical velocity.
 * @param {number} currentVelocity - The enemy's current velocity along the moving axis.
 */
export function handleGhostMovementInDirection(ghost, currentDirection, oppositeDirection, ghostPosition, intersectionPosition, movingCoordinate, velocityX, velocityY, currentVelocity) {
    // Determine the perpendicular directions for the current axis.
    let perpendicularDirection = currentDirection === "left" || currentDirection === "right" ? ["up", "down"] : ["left", "right"];
    let condition = false;
    if (ghost.nextIntersection)
        condition = (ghost.previousDirection == perpendicularDirection[0] && ghostPosition <= intersectionPosition) || (ghost.previousDirection == perpendicularDirection[1] && ghostPosition >= intersectionPosition) || (ghost.previousDirection === oppositeDirection);
    if (condition) {
        // Determine the perpendicular directions for the current axis.
        let newPosition = intersectionPosition;
        if (ghost.previousDirection != oppositeDirection && newPosition !== ghostPosition) {
            if (currentDirection === "left" || currentDirection === "right")
                ghost.body.reset(movingCoordinate, newPosition);
            else ghost.body.reset(newPosition, movingCoordinate);
        }
        // Update the enemy's velocity to match the desired movement.
        changeGhostDirection.call(this, ghost, velocityX, velocityY);
    }
    else if (currentVelocity === 0) {
        // If there is no current velocity, still update the enemy's velocity and alignment.
        changeGhostDirection.call(this, ghost, velocityX, velocityY);
    }
}


/**
 * Updates the enemy's velocity based on the provided values.
 *
 * @param {Phaser.Physics.Arcade.Sprite} ghost - The enemy to update.
 * @param {number} velocityX - The new horizontal velocity.
 * @param {number} velocityY - The new vertical velocity.
 */
export function changeGhostDirection(ghost, velocityX, velocityY) {
    ghost.setVelocityY(velocityY);
    ghost.setVelocityX(velocityX);
}


/**
 * Returns the opposite direction of the provided direction.
 *
 * @param {string} direction - The current direction ("up", "down", "left", or "right").
 * @returns {string} - The opposite direction.
 */
export function getOppositeDirection(direction) {
    switch (direction) {
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

