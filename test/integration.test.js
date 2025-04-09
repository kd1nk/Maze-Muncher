import puppeteer from 'puppeteer';

jest.setTimeout(30000);

describe('Maze Muncher Integration Test', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.goto('http://localhost:5500/game.html');
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    test('start countdown is visible and game starts', async () => {
        // Wait for the scene to attach to window.myScene.
        await page.waitForFunction(() => window.myScene !== undefined, { timeout: 15000 });

        // Now wait until the scene signals that the countdown has finished.
        await page.waitForFunction(() => window.myScene.isStarting === false, { timeout: 20000 });

        // Optionally, check the countdown text was created with the correct name.
        const countdownName = await page.evaluate(() => window.myScene.countdownText ? window.myScene.countdownText.name : null);
        expect(countdownName).toBe("countdown-text");

        // Finally, verify that the main character exists.
        const characterVisible = await page.evaluate(() => window.myScene && window.myScene.pacman ? true : false);
        expect(characterVisible).toBe(true);
    });
});
