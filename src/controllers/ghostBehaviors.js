import * as EnemyMovement from "./enemyMovement.js";

// Initializes the mode timer by starting it with the scatter duration.
// This method is called at scene startup to schedule the first mode switch.
export function initModeTimers() {
    // Begin the timer using the scatterModeDuration as the initial delay.
    setModeTimer.call(this, this.scatterModeDuration);
}


// Sets up a timer that will trigger a mode switch after a given duration.
// The timer is stored in the scene’s modeTimer property.
export function setModeTimer(duration) {
    console.log("setModeTimer called with duration:", duration);
    // If there's already a mode timer running, clear it.
    if (this.modeTimer) {
        clearTimeout(this.modeTimer);
    }
    // Set a new timer. When it expires, call switchMode.
    this.modeTimer = setTimeout(() => {
        console.log("Timer expired; calling switchMode");
        switchMode.call(this);
    }, duration);
}


// Switches between enemy modes: scared, scatter, and chase.
// Based on the current mode, it updates the mode, resets enemy speed,
// and updates each enemy's path accordingly.
export function switchMode() {
    if (this.currentMode === "scared") {
        // If currently scared, revert to the previous mode or default to scatter.
        this.currentMode = this.previouseMode || "scatter";

        // Restart the mode timer using the duration associated with the new mode.
        setModeTimer.call(this, this[this.currentMode + "ModeDuration"]);

        // Reset enemy speed to 70% of the character's speed.
        this.ghostSpeed = this.speed * 0.7;

        // For each enemy, clear any blinking intervals, reset its texture, and recalculate its path.
        this.ghosts.forEach((enemy) => {
            clearInterval(enemy.blinkInterval);
            enemy.setTexture(enemy.originalTexture);
            if (enemy.normalAnimation) {
                enemy.anims.play(enemy.normalAnimation, true);
            }

            // Choose target based on mode: if in chase mode, use chase target; otherwise, use scatter target.
            let target =
                this.currentMode === "chase"
                    ? getChaseTarget.call(this, enemy)
                    : getScatterTarget.call(this, enemy);
            // Update the enemy's path based on the chosen target.
            updateGhostPath.call(this, enemy, target);
            enemy.hasBeenEaten = true;
        });
    } else {
        // If not scared, toggle between scatter and chase modes.
        if (this.currentMode === "scatter") {
            this.currentMode = "chase";
            setModeTimer.call(this, this.chaseModeDuration);
        } else {
            this.currentMode = "scatter";
            setModeTimer.call(this, this.scatterModeDuration);
        }
        // For each enemy, recalculate its path based on the new mode.
        this.ghosts.forEach((ghost) => {
            let target =
                this.currentMode === "chase"
                    ? getChaseTarget.call(this, ghost)
                    : getScatterTarget.call(this, ghost);
            updateGhostPath.call(this, ghost, target);
        });
        // Save the current mode as the previous mode.
        this.previouseMode = this.currentMode;
    }
}


// Calculates the chase target for an enemy based on its type.
// Different enemy types may use different strategies to target the character.
export function getChaseTarget(enemy) {
    if (enemy.type ==="cyanSheep") 
        {
        // For red enemies, simply target the character's current position.
        return { x: this.pacman.x, y: this.pacman.y };
    }
    //old pink Ghost
    if (enemy.type ==="whiteSheep")
        {
        // For pink enemies, use an offset from the character's position.
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

    if (enemy.type === "brownSheep") {
        // For brown enemies, if the distance to the character is large, chase directly; otherwise, use a scatter target
        const distance = Math.hypot(
            enemy.x - this.pacman.x,
            enemy.y - this.pacman.y
        );
        return distance > this.blockSize * 8
            ? { x: this.pacman.x, y: this.pacman.y }
            : this.CLYDE_SCATTER_TARGET;
    }
    if (enemy.type === "pinkSheep") {
        // For pink enemies, calculate a target based on a vector from another enemy (red) to a point ahead of the character.
        const inky = this.pinkSheep;
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
        const vectorX = pacmanAhead.x - inky.x;
        const vectorY = pacmanAhead.y - inky.y;
        return { x: inky.x + 2 * vectorX, y: inky.y + 2 * vectorY };
    }
}

// Returns a random intersection as the target when ghosts are scared
export function getScaredTarget(ghost) {
    const randomIndex = Math.floor(Math.random() * this.intersections.length);
    const randomIntersection = this.intersections[randomIndex];
    return { x: randomIntersection.x, y: randomIntersection.y };
}

// Returns the scatter target for a ghost based on its type
export function getScatterTarget(ghost) {
    if (ghost.texture.key === "whiteSheepRight-1") return this.WHITESHEEP_SCATTER_TARGET;
    if (ghost.texture.key === "cyanSheepRight-1") return this.CYANSHEEP_SCATTER_TARGET;
    if (ghost.texture.key === "brownSheepRight-1") return this.BROWNSHEEP_SCATTER_TARGET;
    if (ghost.texture.key === "pinkSheepRight-1") return this.PINKSHEEP_SCATTER_TARGET;
}

// Update the ghost's path using an A* algorithm from a start point to the target.
// Note: aStarAlgorithm and isInghostHouse should still be methods on your scene.
export function updateGhostPath(ghost, chaseTarget) {
    let chaseStartPoint = { x: ghost.x, y: ghost.y };

    // Use call(this) to ensure that isInghostHouse is executed with the scene context.
    if (isInghostHouse.call(this, ghost.x, ghost.y)) {
        chaseStartPoint = { x: 232, y: 240 };
    }

    // aStarAlgorithm should be defined on your scene (or imported if you decide to move it too)
    ghost.path = aStarAlgorithm.call(this, chaseStartPoint, chaseTarget);
    if (ghost.path.length > 0) {
        ghost.nextIntersection = ghost.path.shift();
    }
}


// Checks if a given position (x, y) is within the enemy house (the central area where enemies are confined).
export function isInghostHouse(x, y) {
    if ((x <= 262 && x >= 208) && (y <= 290 && y > 240))
        return true;
    else return false;
}


// Implements the A* pathfinding algorithm to find a path from start to target using the intersections grid.
// It uses Manhattan distance as a heuristic.
export function aStarAlgorithm(start, target) {
    // If start or target is missing, return an empty path.
    if (!start || !target) {
        return [];
    }

    // Bind the isInghostHouse function to the scene context.
    const isInGhostHouse = isInghostHouse.bind(this);

    // Helper function to find the nearest intersection to a point.
    function findNearestIntersection(point, intersections) {
        if (!point) return null;
        let nearest = null;
        let minDist = Infinity;
        for (const intersection of intersections) {
            if (isInGhostHouse(intersection.x, intersection.y)) {
                continue;
            }
            // Calculate Manhattan distance
            const dist = Math.abs(intersection.x - point.x) + Math.abs(intersection.y - point.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = intersection;
            }
        }
        return nearest;
    }

    // Find the nearest intersection to the start and target points.
    const startIntersection = findNearestIntersection.call(this, start, this.intersections);

    // If the target is not a valid intersection, find the nearest one.
    target = findNearestIntersection.call(this, target, this.intersections);

    // If no valid start or target intersection is found, return an empty path.
    if (!startIntersection || !target) {
        return [];
    }

    // A* algorithm implementation
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    const gScore = new Map();

    // Initialize the open list with the start intersection.
    openList.push({ node: startIntersection, g: 0, f: heuristic(startIntersection, target) });
    gScore.set(JSON.stringify(startIntersection), 0);

    // Heuristic function for A* (Manhattan distance).
    function heuristic(node, target) {
        return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
    }

    // Main A* loop
    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift().node;

        if (current.x === target.x && current.y === target.y) {
            const path = [];
            let currentNode = current;
            while (cameFrom.has(JSON.stringify(currentNode))) {
                path.push(currentNode);
                currentNode = cameFrom.get(JSON.stringify(currentNode));
            }
            path.push(startIntersection);
            return path.reverse();
        }

        // Add current node to closed list
        closedList.add(JSON.stringify(current));

        // Get neighbors and evaluate them
        const currentIntersection = this.intersections.find(i => i.x === current.x && i.y === current.y);

        // If the current intersection is valid, check its open paths
        if (currentIntersection) {
            for (const direction of currentIntersection.openPaths) {
                const neighbor = getNextIntersection.call(this, current.x, current.y, direction);

                // Check if the neighbor is valid and not in the closed list
                if (neighbor && !isInGhostHouse(neighbor.x, neighbor.y) && !closedList.has(JSON.stringify(neighbor))) {
                    const tentativeGScore = gScore.get(JSON.stringify(current)) + 1;

                    // If the neighbor is not in the open list or the new gScore is better, update it
                    if (!gScore.has(JSON.stringify(neighbor)) || tentativeGScore < gScore.get(JSON.stringify(neighbor))) {
                        gScore.set(JSON.stringify(neighbor), tentativeGScore);
                        const fScore = tentativeGScore + heuristic(neighbor, target);
                        openList.push({ node: neighbor, g: tentativeGScore, f: fScore });
                        cameFrom.set(JSON.stringify(neighbor), current);
                    }
                }
            }
        }
    }
    // If no path is found, return an empty array.
    return [];
}


// From all available intersections, returns the next intersection in a given direction from the current position.
export function getNextIntersection(currentX, currentY, previousDirection) {
    let filteredIntersections;
    const isUp = previousDirection === "up";
    const isDown = previousDirection === "down";
    const isLeft = previousDirection === "left";
    const isRight = previousDirection === "right";

    // Filter intersections based on the current position and direction.
    filteredIntersections = this.intersections.filter((intersection) => {
        return (
            ((isUp && intersection.x === currentX && intersection.y < currentY) ||
                (isDown && intersection.x === currentX && intersection.y > currentY) ||
                (isLeft && intersection.y === currentY && intersection.x < currentX) ||
                (isRight && intersection.y === currentY && intersection.x > currentX))
        );
    })
        // Sort the filtered intersections based on the direction.
        .sort((a, b) => {
            if (isUp || isDown) {
                return isUp ? b.y - a.y : a.y - b.y;
            } else {
                return isLeft ? b.x - a.x : a.x - b.x;
            }
        });
    // Return the first intersection in the filtered list or null if none found.
    return filteredIntersections ? filteredIntersections[0] : null;
}


// Sets all enemies to their "scared" state.
// For each enemy, updates the path to a random target, clears any existing blink intervals,
// and then sets up a blinking effect before finalizing the scared texture.
export function setGhostsToScaredMode() {
    // Set the current mode to "scared" and update the previous mode.
    this.ghosts.forEach(ghost => {
        let scaredTarget = getScaredTarget.call(this);
        updateGhostPath.call(this, ghost, scaredTarget);
        // Clear any existing blink intervals.
        if (ghost.blinkInterval)
            clearInterval(ghost.blinkInterval);

        ghost.isBlinking = false; // Make sure it's reset

    // Initial scared animation based on current direction
            if (ghost.direction === "left") {
            ghost.play("scaredSheep-left", true);
            } else {
            ghost.play("scaredSheep-right", true);
            }
        const blinkTime = this.scaredModeDuration - 2000;
        ghost.blinkInterval = setTimeout(() => {
            // Stop blinking after the scared mode duration.
            if (ghost.hasBeenEaten)
                return;

            let blinkOn = true;

            // Begin an interval to toggle between two scared textures.
            ghost.blinkInterval = setInterval(() => {
                blinkOn = !blinkOn;
            // Handle ghost direction and movement during blinking.
            EnemyMovement.handleGhostDirection.call(this, ghost);
            EnemyMovement.handleGhostMovement.call(this, ghost);
            if (ghost.direction === "left") {
                    ghost.play(blinkOn ? "scaredSheep-left" : "scaredSheepAlt-left", true);
                } else if (ghost.direction === "right") {
                    ghost.play(blinkOn ? "scaredSheep-right" : "scaredSheepAlt-right", true);
                } 
            }, 200);
        }, blinkTime);
        ghost.play("scaredSheep-left", true);
        // Initially, set the enemy to its default scared animation based on its last direction.
        if (ghost.direction === "left") {
            ghost.anims.play("scaredSheep-left", true);
        } else if (ghost.direction === "right") {
            ghost.anims.play("scaredSheep-right", true);
        } else {
            // Default to "right" if direction is not set:
            ghost.anims.play("scaredSheep-right", true);
        }
    });
}