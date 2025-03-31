import * as GhostBehavior from "./ghostBehaviors.js";

export function initializeGhosts(layer) {
    console.log("initializeGhost context:", this);
    this.pinkGhost = initializeGhost.call(this, 232, 290, "pinkGhost", layer);
    this.orangeGhost = initializeGhost.call(this, 210, 290, "orangeGhost", layer);
    this.redGhost = initializeGhost.call(this, 232, 290, "redGhost", layer);
    this.blueGhost = initializeGhost.call(this, 255, 290, "blueGhost", layer);
    this.ghosts = [this.pinkGhost, this.redGhost, this.orangeGhost, this.blueGhost];
    startGhostEntries.call(this);
}

export function startGhostEntries() {
    this.ghosts.forEach((ghost, index) => {
        if (ghost.entryTimer) {
            clearTimeout(ghost.entryTimer);
        }
        ghost.entryTimer = setTimeout(() => {
            enterMaze.call(this, ghost);
        }, this.entryDelay * index);
    });
}

export function enterMaze(ghost) {
    ghost.setPosition(232, 240);
    ghost.enteredMaze = true;
    if (this.currentMode !== "scared")
        ghost.hasBeenEaten = true;
}
export function initializeGhost(x, y, spriteKey, layer) {
    const ghost = this.physics.add.sprite(x, y, spriteKey);
    this.physics.add.collider(ghost, layer);
    ghost.originalTexture = spriteKey;
    ghost.direction = "right";
    ghost.previousDirection = "right";
    ghost.nextIntersection = null;
    ghost.enteredMaze = false;
    return ghost;
}

export function handleGhostDirection(ghost) {
    if (GhostBehavior.isInghostHouse.call(this, ghost.x, ghost.y)) {
        changeGhostDirection.call(this, ghost, 0, -this.ghostSpeed);
        if (ghost.direction === "down")
            ghost.direction = "up";
    }

    const isMoving = ghost.body.velocity.x !== 0 || ghost.body.velocity.y !== 0;
    if (!isMoving) {
        ghost.stuckTimer = (ghost.stuckTimer || 0) + 1;
        if (ghost.stuckTimer > 30) {
            ghost.stuckTimer = 0;
            let newTarget = this.currentMode === "scared" ? GhostBehavior.getScaredTarget.call(this) :
                this.currentMode === "chase" ? GhostBehavior.getChaseTarget.call(this, ghost) : GhostBehavior.getScatterTarget.call(this, ghost);
            GhostBehavior.updateGhostPath.call(this, ghost, newTarget);
        }
    } else
        ghost.stuckTimer = 0;

    if (ghost.body.velocity.x == 0 && ghost.body.velocity.y == 0) {
        adjustGhostPosition.call(this, ghost);
    }

    let isAtIntersection = isGhostAtIntersection.call(this, ghost.nextIntersection, ghost.x, ghost.y, ghost.direction);

    if (isAtIntersection) {
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

        let newDirection = getGhostNextDirection.call(this, ghost, ghost.nextIntersection);
        ghost.previousDirection = ghost.direction;
        ghost.direction = newDirection;
    }
}

//good
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

//good
export function isGhostAtIntersection(intersection, currentX, currentY, direction) {
    const isUp = direction === "up";
    const isDown = direction === "down";
    const isLeft = direction === "left";
    const isRight = direction === "right";

    let condition = ((isUp && intersection.x === currentX && intersection.y >= currentY) || (isDown && intersection.x === currentX && intersection.y <= currentY) || (isLeft && intersection.y === currentY && intersection.x >= currentX) || (isRight && intersection.y === currentY && intersection.x <= currentX));
    return condition;
}

//good
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

//good
export function handleGhostMovement(ghost) {
    let nextIntersectionx = null;
    let nextIntersectiony = null;
    if (ghost.nextIntersection) {
        nextIntersectionx = ghost.nextIntersection.x;
        nextIntersectiony = ghost.nextIntersection.y;
    }
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

//good
// This function handles the ghost's movement in a specific direction based on the current direction and velocity.
export function handleGhostMovementInDirection(ghost, currentDirection, oppositeDirection, ghostPosition, intersectionPosition, movingCoordinate, velocityX, velocityY, currentVelocity) {
    let perpendicularDirection = currentDirection === "left" || currentDirection === "right" ? ["up", "down"] : ["left", "right"];
    let condition = false;
    if (ghost.nextIntersection)
        condition = (ghost.previousDirection == perpendicularDirection[0] && ghostPosition <= intersectionPosition) || (ghost.previousDirection == perpendicularDirection[1] && ghostPosition >= intersectionPosition) || (ghost.previousDirection === oppositeDirection);
    if (condition) {
        let newPosition = intersectionPosition;
        if (ghost.previousDirection != oppositeDirection && newPosition !== ghostPosition) {
            if (currentDirection === "left" || currentDirection === "right")
                ghost.body.reset(movingCoordinate, newPosition);
            else ghost.body.reset(newPosition, movingCoordinate);
        }
        changeGhostDirection.call(this, ghost, velocityX, velocityY);
    }
    else if (currentVelocity === 0) {
        changeGhostDirection.call(this, ghost, velocityX, velocityY);
    }
}

//good
export function changeGhostDirection(ghost, velocityX, velocityY) {
    ghost.setVelocityY(velocityY);
    ghost.setVelocityX(velocityX);
}

//good
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

