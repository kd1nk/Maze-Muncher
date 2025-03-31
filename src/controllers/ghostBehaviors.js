
//figure this one out
export function initModeTimers() {
    setModeTimer.call(this, this.scatterModeDuration);
}



export function setModeTimer(duration) {
    console.log("setModeTimer called with duration:", duration);
    if (this.modeTimer) {
      clearTimeout(this.modeTimer);
    }
    this.modeTimer = setTimeout(() => {
      console.log("Timer expired; calling switchMode");
      switchMode.call(this);
    }, duration);
  }


// Switch between ghost modes (scared, scatter, chase)
export function switchMode() {
    if (this.currentMode === "scared") {
        this.currentMode = this.previouseMode || "scatter";
        setModeTimer.call(this, this[this.currentMode + "ModeDuration"]);
        this.ghostSpeed = this.speed * 0.7;
        this.ghosts.forEach((ghost) => {
            clearInterval(ghost.blinkInterval);
            ghost.setTexture(ghost.originalTexture);
            let target =
                this.currentMode === "chase"
                    ? getChaseTarget.call(this, ghost)
                    : getScatterTarget.call(this, ghost);
            updateGhostPath.call(this, ghost, target);
            ghost.hasBeenEaten = true;
        });
    } else {
        if (this.currentMode === "scatter") {
            this.currentMode = "chase";
            setModeTimer.call(this, this.chaseModeDuration);
        } else {
            this.currentMode = "scatter";
            setModeTimer.call(this, this.scatterModeDuration);
        }
        this.ghosts.forEach((ghost) => {
            let target =
                this.currentMode === "chase"
                    ? getChaseTarget.call(this, ghost)
                    : getScatterTarget.call(this, ghost);
            updateGhostPath.call(this, ghost, target);
        });
        this.previouseMode = this.currentMode;
    }
}

// Calculate the chase target for a ghost based on its type
export function getChaseTarget(ghost) {
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

// Returns a random intersection as the target when ghosts are scared
export function getScaredTarget(ghost) {
    const randomIndex = Math.floor(Math.random() * this.intersections.length);
    const randomIntersection = this.intersections[randomIndex];
    return { x: randomIntersection.x, y: randomIntersection.y };
}

// Returns the scatter target for a ghost based on its type
export function getScatterTarget(ghost) {
    if (ghost.texture.key === "redGhost") return this.BLINKY_SCATTER_TARGET;
    if (ghost.texture.key === "pinkGhost") return this.PINKY_SCATTER_TARGET;
    if (ghost.texture.key === "orangeGhost") return this.CLYDE_SCATTER_TARGET;
    if (ghost.texture.key === "blueGhost") return this.INKY_SCATTER_TARGET;
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


//figure this one out
export function isInghostHouse(x, y) {
    if ((x <= 262 && x >= 208) && (y <= 290 && y > 240))
        return true;
    else return false;
}

export function aStarAlgorithm(start, target) {
    const isInGhostHouse = isInghostHouse.bind(this);

    function findNearestIntersection(point, intersections) {
        let nearest = null;
        let minDist = Infinity;
        for (const intersection of intersections) {
            if (isInGhostHouse(intersection.x, intersection.y)) {
                continue;
            }
            const dist = Math.abs(intersection.x - point.x) + Math.abs(intersection.y - point.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = intersection;
            }
        }
        return nearest;
    }

    const startIntersection = findNearestIntersection.call(this, start, this.intersections);
    target = findNearestIntersection.call(this, target, this.intersections);

    if (!startIntersection || !target) {
        return [];
    }

    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    const gScore = new Map();

    openList.push({ node: startIntersection, g: 0, f: heuristic(startIntersection, target) });
    gScore.set(JSON.stringify(startIntersection), 0);

    function heuristic(node, target) {
        return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
    }

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

        closedList.add(JSON.stringify(current));

        const currentIntersection = this.intersections.find(i => i.x === current.x && i.y === current.y);

        if (currentIntersection) {
            for (const direction of currentIntersection.openPaths) {
                const neighbor = getNextIntersection.call(this, current.x, current.y, direction);

                if (neighbor && !isInGhostHouse(neighbor.x, neighbor.y) && !closedList.has(JSON.stringify(neighbor))) {
                    const tentativeGScore = gScore.get(JSON.stringify(current)) + 1;

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

    return [];
}


export function getNextIntersection(currentX, currentY, previousDirection) {
    let filteredIntersections;
    const isUp = previousDirection === "up";
    const isDown = previousDirection === "down";
    const isLeft = previousDirection === "left";
    const isRight = previousDirection === "right";
    filteredIntersections = this.intersections.filter((intersection) => {
        return (
            ((isUp && intersection.x === currentX && intersection.y < currentY) ||
                (isDown && intersection.x === currentX && intersection.y > currentY) ||
                (isLeft && intersection.y === currentY && intersection.x < currentX) ||
                (isRight && intersection.y === currentY && intersection.x > currentX))
        );
    })
        .sort((a, b) => {
            if (isUp || isDown) {
                return isUp ? b.y - a.y : a.y - b.y;
            } else {
                return isLeft ? b.x - a.x : a.x - b.x;
            }
        });
    return filteredIntersections ? filteredIntersections[0] : null;
}



export function setGhostsToScaredMode() {
    this.ghosts.forEach(ghost => {
        let scaredTarget = getScaredTarget.call(this);
        updateGhostPath.call(this, ghost, scaredTarget);
        if (ghost.blinkInterval)
            clearInterval(ghost.blinkInterval);
        const blinkTime = this.scaredModeDuration - 2000;
        ghost.blinkInterval = setTimeout(() => {

            if (ghost.hasBeenEaten)
                return;

            let blinkOn = true;
            ghost.blinkInterval = setInterval(() => {
                blinkOn = !blinkOn;
                ghost.setTexture(blinkOn ? "scaredGhost" : "scaredGhostWhite");
            }, 200);
        }, blinkTime);
        ghost.setTexture("scaredGhost");
    });
}