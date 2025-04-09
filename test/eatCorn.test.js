// test/eatCorn.test.js
import { updateMultiplier } from "../src/controllers/eatCorn.js";

describe("updateMultiplier", () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            timeElapsed: 0,
            scoreMultiplier: 5.0,
            decreaseRate: 0.05,
            multiplierText: { setText: jest.fn() }
        };
    });

    test("decreases multiplier after 1 second", () => {
        // simulate an update call with 1000ms delta (1 second)
        updateMultiplier.call(mockScene, 1000);
        // score multiplier should have decreased by 0.05
        expect(mockScene.scoreMultiplier).toBeCloseTo(4.95, 2);
        expect(mockScene.multiplierText.setText).toHaveBeenCalled();
    });
});
