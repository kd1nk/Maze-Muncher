export function populateBoardAndTrackEmptyTiles(layer) {
    // Define the power pill positions (in pixels)
    const powerPillPositions = [
        { x: 32, y: 144 },
        { x: 432, y: 144 },
        { x: 32, y: 480 },
        { x: 432, y: 480 }
    ];

    layer.forEachTile((tile) => {
        if (!this.board[tile.y]) {
            this.board[tile.y] = [];
        }
        this.board[tile.y][tile.x] = tile.index;
        // Skip tiles that shouldn't be considered for dots
        if (
            tile.y < 4 ||
            (tile.y > 11 && tile.y < 23 && tile.x > 6 && tile.x < 21) ||
            (tile.y === 17 && tile.x !== 6 && tile.x !== 21)
        )
            return;

        let rightTile = this.map.getTileAt(tile.x + 1, tile.y, true, "Tile Layer 1");
        let bottomTile = this.map.getTileAt(tile.x, tile.y + 1, true, "Tile Layer 1");
        let rightBottomTile = this.map.getTileAt(tile.x + 1, tile.y + 1, true, "Tile Layer 1");

        if (
            tile.index === -1 &&
            rightTile && rightTile.index === -1 &&
            bottomTile && bottomTile.index === -1 &&
            rightBottomTile && rightBottomTile.index === -1
        ) {
            const x = tile.x * tile.width;
            const y = tile.y * tile.height;
            // Calculate the dot's intended pixel position.
            const dotX = x + tile.width;
            const dotY = y + tile.height;

            // Only create a dot if its position is NOT one of the power pill positions.
            const isUnderPowerPill = powerPillPositions.some(pos => pos.x === dotX && pos.y === dotY);
            if (!isUnderPowerPill) {
                this.dots.create(dotX, dotY, "dot");
            }
        }
    });

    // Create power pills at their fixed positions.
    this.powerPills.create(32, 144, "powerPill");
    this.powerPills.create(432, 144, "powerPill");
    this.powerPills.create(32, 480, "powerPill");
    this.powerPills.create(432, 480, "powerPill");
}


export function detectIntersections() {
    const directions = [
        { x: -this.blockSize, y: 0, name: "left" },
        { x: this.blockSize, y: 0, name: "right" },
        { x: 0, y: -this.blockSize, name: "up" },
        { x: 0, y: this.blockSize, name: "down" },
    ];
    const blockSize = this.blockSize;
    for (let y = 0; y < this.map.heightInPixels; y += blockSize) {
        for (let x = 0; x < this.map.widthInPixels; x += blockSize) {
            if (x % blockSize !== 0 || y % blockSize !== 0) continue;
            if (!isPointClear.call(this, x, y)) continue;
            let openPaths = [];
            directions.forEach((dir) => {
                if (isPathOpenAroundPoint.call(this, x + dir.x, y + dir.y)) {
                    openPaths.push(dir.name);
                }
            });
            if (openPaths.length > 2 && y > 64 && y < 530) {
                this.intersections.push({ x: x, y: y, openPaths: openPaths });
            } else if (openPaths.length === 2 && y > 64 && y < 530) {
                const [dir1, dir2] = openPaths;
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

export function isPathOpenAroundPoint(pixelX, pixelY) {
    const corners = [
        { x: pixelX - 1, y: pixelY - 1 },
        { x: pixelX + 1, y: pixelY - 1 },
        { x: pixelX - 1, y: pixelY + 1 },
        { x: pixelX + 1, y: pixelY + 1 },
    ];
    return corners.every((corner) => {
        const tileX = Math.floor(corner.x / this.blockSize);
        const tileY = Math.floor(corner.y / this.blockSize);
        if (!this.board[tileY] || this.board[tileY][tileX] !== -1) {
            return false;
        }
        return true;
    });
}


export function isPointClear(x, y) {
    const corners = [
        { x: x - 1, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y + 1 },
    ];
    return corners.every((corner) => {
        const tileX = Math.floor(corner.x / this.blockSize);
        const tileY = Math.floor(corner.y / this.blockSize);

        return !this.board[tileY] || this.board[tileY][tileX] === -1;
    });
}

//update()
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

export function isMovingInxDirection(direction) {
    let result = (direction === "left" || direction === "right") ? true : false;
    return result;
}