// src/utils/AStar.js

export function aStarAlgorithm(start, target) {
    // Bind the isInghostHouse function to the current scene context.
    const isInGhostHouse = this.isInghostHouse.bind(this);
  
    // Helper function to find the nearest intersection from a given point.
    function findNearestIntersection(point, intersections) {
      let nearest = null;
      let minDist = Infinity;
      for (const intersection of intersections) {
        // Skip intersections inside the ghost house.
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
  
    // Get the nearest intersections for start and target.
    const startIntersection = findNearestIntersection.call(this, start, this.intersections);
    target = findNearestIntersection.call(this, target, this.intersections);
  
    if (!startIntersection || !target) {
      return [];
    }
  
    // A* algorithm initialization.
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
  
    // Heuristic: Manhattan distance.
    function heuristic(node, target) {
      return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
    }
  
    openList.push({ node: startIntersection, g: 0, f: heuristic(startIntersection, target) });
    gScore.set(JSON.stringify(startIntersection), 0);
  
    // Main A* loop.
    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift().node;
  
      // If reached the target intersection, reconstruct the path.
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
  
      // Find the current intersection object.
      const currentIntersection = this.intersections.find(i => i.x === current.x && i.y === current.y);
  
      if (currentIntersection) {
        // Loop through each available direction from this intersection.
        for (const direction of currentIntersection.openPaths) {
          // Use the getNextIntersection helper (provided in this module's context) to determine neighbor.
          const neighbor = this.getNextIntersection(current.x, current.y, direction);
  
          if (
            neighbor &&
            !isInGhostHouse(neighbor.x, neighbor.y) &&
            !closedList.has(JSON.stringify(neighbor))
          ) {
            const tentativeGScore = gScore.get(JSON.stringify(current)) + 1;
            if (
              !gScore.has(JSON.stringify(neighbor)) ||
              tentativeGScore < gScore.get(JSON.stringify(neighbor))
            ) {
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
    // Determine the next intersection based on current position and movement direction.
    const isUp = previousDirection === "up";
    const isDown = previousDirection === "down";
    const isLeft = previousDirection === "left";
    const isRight = previousDirection === "right";
  
    const filteredIntersections = this.intersections
      .filter((intersection) => {
        return (
          (isUp && intersection.x === currentX && intersection.y < currentY) ||
          (isDown && intersection.x === currentX && intersection.y > currentY) ||
          (isLeft && intersection.y === currentY && intersection.x < currentX) ||
          (isRight && intersection.y === currentY && intersection.x > currentX)
        );
      })
      .sort((a, b) => {
        if (isUp || isDown) {
          return isUp ? b.y - a.y : a.y - b.y;
        } else {
          return isLeft ? b.x - a.x : a.x - b.x;
        }
      });
    
    return filteredIntersections.length > 0 ? filteredIntersections[0] : null;
  }
  