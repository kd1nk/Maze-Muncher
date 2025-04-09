/**
 * @jest-environment jsdom
 */

// test/gameScreens.test.js
import { createStartCountdown, endGame, pauseMenu } from "../src/controllers/gameScreens.js";



describe("GameScreens module", () => {
    let mockScene;

    beforeEach(() => {
        // Use fake timers so we can fast-forward delays.
        jest.useFakeTimers();

        // Create a minimal mock scene object with the properties and methods used in gameScreens.
        mockScene = {
            scale: { width: 464, height: 560 },
            // Mock Phaser's "add" object with rectangle and text creators.
            add: {
                rectangle: jest.fn().mockImplementation((x, y, width, height, fillColor, alpha) => {
                    return {
                        x, y, width, height, fillColor, alpha,
                        setDepth: jest.fn().mockReturnThis(),
                        destroy: jest.fn()
                    };
                }),
                text: jest.fn().mockImplementation((x, y, text, style) => {
                    return {
                        x, y, text, style,
                        setOrigin: jest.fn().mockReturnThis(),
                        setDepth: jest.fn().mockReturnThis(),
                        setInteractive: jest.fn().mockReturnThis(),
                        setName: jest.fn().mockImplementation(function(name) { this.name = name; return this; }),
                        setText: jest.fn(),
                        destroy: jest.fn(),
                        on: jest.fn()
                    };
                })
            },
            // Mock the time object with an addEvent method.
            time: {
                addEvent: jest.fn((options) => {
                    // Instead of scheduling a real timer, we simulate the callback
                    // We store the event for manual triggering.
                    return options;
                })
            },
            // Mock tweens object to simulate immediate onComplete calls.
            tweens: {
                add: jest.fn((options) => {
                    if (options.onComplete) options.onComplete();
                    return options;
                })
            },
            // Mock physics pause function.
            physics: {
                pause: jest.fn()
            },
            // Mock input.keyboard.on for setting up pause key listeners.
            input: {
                keyboard: {
                    on: jest.fn()
                }
            },
            // Mock the scene object for launching/pause/restart.
            scene: {
                launch: jest.fn(),
                pause: jest.fn(),
                restart: jest.fn()
            }
        };
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe("createStartCountdown", () => {
        test("calls the onComplete callback after the countdown finishes", () => {
            // Create a jest.fn() for the onComplete callback.
            const onComplete = jest.fn();

            // Keep a reference to the event configuration passed to time.addEvent.
            let addedEvent;
            mockScene.time.addEvent.mockImplementation((options) => {
                addedEvent = options;
                return options;
            });

            // Call createStartCountdown with our mock context.
            createStartCountdown.call(mockScene, onComplete);

            // The countdown starts at 3, and the event is set to repeat 3 times (so the callback is executed 4 times total)
            // We simulate each callback execution.
            // (For simplicity, we simulate the countdown without waiting real time.)
            for (let i = 0; i < 4; i++) {
                // Call the callback manually.
                addedEvent.callback();
            }

            // Fast-forward any remaining timers (e.g., tween delay).
            jest.runAllTimers();

            // Check that onComplete has been called.
            expect(onComplete).toHaveBeenCalled();
        });
    });

    describe("endGame", () => {
        test("pauses physics and displays win message if outcome is 'win'", () => {
            // Override the tweens.add method to immediately call its onComplete.
            mockScene.tweens.add.mockImplementation((options) => {
                if (options.onComplete) options.onComplete();
                return options;
            });

            // Create mocks for add.rectangle and add.text to capture their calls.
            const overlayMock = { setAlpha: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() };
            const resultTextMock = { setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() };
            const returnBtnMock = { setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn() };

            mockScene.add.rectangle.mockReturnValue(overlayMock);
            // For resultText, we simulate creation by the first call to add.text.
            mockScene.add.text
                .mockReturnValueOnce(resultTextMock) // For resultText
                .mockReturnValueOnce(returnBtnMock);  // For return button

            // Call endGame with outcome 'win'
            endGame.call(mockScene, "win");

            // Expect that physics.pause was called
            expect(mockScene.physics.pause).toHaveBeenCalled();

            // Check that add.text was called with "You Win!" (the win message)
            expect(mockScene.add.text).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                'You Win!',
                expect.objectContaining({ fontSize: '64px' })
            );
        });

        test("creates Try Again button when outcome is not 'win'", () => {
            // Override tweens.add to simulate immediate onComplete.
            mockScene.tweens.add.mockImplementation((options) => {
                if (options.onComplete) options.onComplete();
                return options;
            });

            const overlayMock = { setAlpha: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() };
            // We need two calls to add.text in this case (one for resultText and one for the Try Again button)
            const resultTextMock = { setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() };
            const tryAgainBtnMock = { setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn() };

            mockScene.add.rectangle.mockReturnValue(overlayMock);
            mockScene.add.text
                .mockReturnValueOnce(resultTextMock) // For result text
                .mockReturnValueOnce(tryAgainBtnMock); // For try again button

            // Call endGame with an outcome other than "win"
            endGame.call(mockScene, "lose");

            // This ensures all timers and tween callbacks are executed
            jest.advanceTimersByTime(); 

            // Verify that the Try Again button's pointerdown handler is defined.
            expect(tryAgainBtnMock.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
        });
    });

    describe("pauseMenu", () => {
        test("sets up a keyboard listener for 'P' key", () => {
            pauseMenu.call(mockScene);
            expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keydown-P', expect.any(Function));
        });
    });
});
