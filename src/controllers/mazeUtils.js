/**
 * Populates the board with pellets (dots) and power pills.
 * It iterates over each tile in the provided layer, tracks the tile values in a board array,
 * and creates a pellet (dot) if the tile is empty and not within reserved areas or under a power pill.
 * After processing the tiles, it creates power pills at fixed positions.
 *
 * @param {Phaser.Tilemaps.TilemapLayer} layer - The tile layer to iterate over.
 */
export function populateBoardAndTrackEmptyTiles(layer) {
    // Initialize the board array to track tile values.
    const powerPillPositions = [
        { x: 32, y: 144 },
        { x: 432, y: 144 },
        { x: 32, y: 480 },
        { x: 432, y: 480 }
    ];

    // Initialize the board array to track tile values.
    layer.forEachTile((tile) => {
        if (!this.board[tile.y]) {
            this.board[tile.y] = [];
        }

        // Track the tile value in the board array.
        this.board[tile.y][tile.x] = tile.index;

        // Skip reserved areas for dots
        if (
            tile.y < 4 ||
            (tile.y > 11 && tile.y < 23 && tile.x > 6 && tile.x < 21) ||
            (tile.y === 17 && tile.x !== 6 && tile.x !== 21)
        ) return;

        // Check if the tile is empty and not under a power pill
        let rightTile = this.map.getTileAt(tile.x + 1, tile.y, true, "Tile Layer 1");
        // let leftTile = this.map.getTileAt(tile.x - 1, tile.y, true, "Tile Layer 1");
        let bottomTile = this.map.getTileAt(tile.x, tile.y + 1, true, "Tile Layer 1");
        //  let topTile = this.map.getTileAt(tile.x, tile.y - 1, true, "Tile Layer 1");
        let rightBottomTile = this.map.getTileAt(tile.x + 1, tile.y + 1, true, "Tile Layer 1");

        // Create a dot if the tile is empty and not under a power pill
        if (
            tile.index === -1 &&
            rightTile && rightTile.index === -1 &&
            bottomTile && bottomTile.index === -1 &&
            rightBottomTile && rightBottomTile.index === -1 &&
            tile.y < 36  // skip bottom-most row (576px)
        ) {
        
            // Calculate the dot position
            const x = tile.x * tile.width;
            const y = tile.y * tile.height;
            const dotX = x + tile.width;
            const dotY = y + tile.height;

            // Check if the dot is under a power pill
            const isUnderPowerPill = powerPillPositions.some(pos => pos.x === dotX && pos.y === dotY);
            // Create the dot if it's not under a power pill
            if (!isUnderPowerPill) {
                const dotKey = `${dotX},${dotY}`;

                // Initialize the set to track dot positions
                if (!this.dotPositions) this.dotPositions = new Set();

                // Check if the dot position is already occupied
                if (!this.dotPositions.has(dotKey)) {
                    this.dotPositions.add(dotKey);

                    // LOG EACH DOT CREATED
                    // console.log(` Dot created at (${dotX}, ${dotY})`);
                    if (dotY >= 576) return;
                    const dot = this.dots.create(dotX, dotY, "dot");
                }
            }
        }
    });

    // LOG TOTAL DOTS AFTER TILE LOOP
    // console.log("TOTAL DOTS CREATED:", this.dots.getChildren().length);
    // this.dots.getChildren().forEach(dot => {
    //     if (dot.active) {
    //         console.log(`Active Dot at (${dot.x}, ${dot.y})`);
    //     }
    // });
    

    // Create kernels (power pills) at fixed positions
    this.powerPills.create(32, 144, "powerPill");
    this.powerPills.create(432, 144, "powerPill");
    this.powerPills.create(32, 480, "powerPill");
    this.powerPills.create(432, 480, "powerPill");

    // Log after placing power pills too
    // console.log(" Power pills created at:", powerPillPositions);
}


/**
 * Detects intersections within the maze.
 * Iterates over each grid position in the tilemap and determines if the point is clear.
 * For clear points, it checks adjacent tiles in each of the four directions.
 * If more than two open paths are found (or exactly two that are perpendicular),
 * the point is added to the intersections array.
 */
export function detectIntersections() {
    // Define relative offsets for the four directions.
    const directions = [
        { x: -this.blockSize, y: 0, name: "left" },
        { x: this.blockSize, y: 0, name: "right" },
        { x: 0, y: -this.blockSize, name: "up" },
        { x: 0, y: this.blockSize, name: "down" },
    ];
    const blockSize = this.blockSize;

    // Iterate over each grid position in the tilemap.
    for (let y = 0; y < this.map.heightInPixels; y += blockSize) {
        // Skip the top and bottom rows of the maze.
        for (let x = 0; x < this.map.widthInPixels; x += blockSize) {
            // Skip the left and right columns of the maze.
            if (x % blockSize !== 0 || y % blockSize !== 0) continue;
            // Check if the point is clear.
            if (!isPointClear.call(this, x, y)) continue;
            let openPaths = [];
            directions.forEach((dir) => {
                // Check if the adjacent tile is clear.
                if (isPathOpenAroundPoint.call(this, x + dir.x, y + dir.y)) {
                    openPaths.push(dir.name);
                }
            });
            // Check if the point is an intersection.
            if (openPaths.length > 2 && y > 64 && y < 530) {
                this.intersections.push({ x: x, y: y, openPaths: openPaths });
            } else if (openPaths.length === 2 && y > 64 && y < 530) {
                const [dir1, dir2] = openPaths;
                // Check if the two open paths are perpendicular.
                if (((dir1 === "left" || dir1 === "right") &&
                    (dir2 === "up" || dir2 === "down")) ||
                    (dir1 === "up" || dir1 === "down") &&
                    (dir2 === "left" || dir2 === "right")) {
                    this.intersections.push({ x: x, y: y, openPaths: openPaths });
                }
            }
        }
    }
}


/**
 * Checks if the path around a given pixel (pixelX, pixelY) is open.
 * It does this by sampling the four corners of the area around the point.
 * If all corners are clear (i.e., no wall or obstacle), the path is considered open.
 *
 * @param {number} pixelX - The x-coordinate in pixels.
 * @param {number} pixelY - The y-coordinate in pixels.
 * @returns {boolean} - True if all sampled corners are clear.
 */
export function isPathOpenAroundPoint(pixelX, pixelY) {
    const corners = [
        { x: pixelX - 1, y: pixelY - 1 },
        { x: pixelX + 1, y: pixelY - 1 },
        { x: pixelX - 1, y: pixelY + 1 },
        { x: pixelX + 1, y: pixelY + 1 },
    ];
    // Ensure each corner is on an empty tile (tile index is -1).
    return corners.every((corner) => {
        const tileX = Math.floor(corner.x / this.blockSize);
        const tileY = Math.floor(corner.y / this.blockSize);
        if (!this.board[tileY] || this.board[tileY][tileX] !== -1) {
            return false;
        }
        return true;
    });
}


/**
 * Checks if a specific point (x, y) is clear for movement.
 * It examines the four corners around the point to determine if they are all empty.
 *
 * @param {number} x - The x-coordinate in pixels.
 * @param {number} y - The y-coordinate in pixels.
 * @returns {boolean} - True if the point is clear (all corners are empty).
 */
export function isPointClear(x, y) {
    const corners = [
        { x: x - 1, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y + 1 },
    ];
    // If any corner is not on an empty tile, the point is not clear.
    return corners.every((corner) => {
        const tileX = Math.floor(corner.x / this.blockSize);
        const tileY = Math.floor(corner.y / this.blockSize);

        return !this.board[tileY] || this.board[tileY][tileX] === -1;
    });
}


/**
 * Given a direction ("up", "down", "left", or "right"),
 * returns the perpendicular direction.
 * For example, if the direction is "up", the perpendicular direction is "right".
 *
 * @param {string} direction - The current direction.
 * @returns {string} - The perpendicular direction.
 */
export function getPerpendicularDirection(direction) {
    switch (direction) {
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


/**
 * Determines if movement is along the horizontal axis.
 * Returns true if the direction is "left" or "right", otherwise false.
 *
 * @param {string} direction - The direction to check.
 * @returns {boolean} - True if the direction is horizontal.
 */
export function isMovingInxDirection(direction) {
    let result = (direction === "left" || direction === "right") ? true : false;
    return result;
}