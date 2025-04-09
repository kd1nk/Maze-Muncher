// characterMovement.test.js
import { getNextIntersectionInNextDirection } from "../src/controllers/characterMovement.js";

// A sample mock context for the scene (you can refine this as needed)
const mockScene = {
    pacman: { x: 100, y: 100 },
    intersections: [
        // A sample intersection point for testing:
        { x: 100, y: 80, openPaths: ["up", "left", "right"] },
        { x: 100, y: 120, openPaths: ["down", "left", "right"] },
    ],
};

describe("getNextIntersectionInNextDirection", () => {
    // Bind the function to our mockScene context
    const boundGetNextIntersection =
        getNextIntersectionInNextDirection.bind(mockScene);

    test("returns correct intersection when moving up", () => {
        const result = boundGetNextIntersection(100, 100, "up", "left");
        expect(result).toHaveProperty("y", 80);
    });

});
