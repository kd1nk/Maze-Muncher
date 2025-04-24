// Volume preferences
const MENU_VOL_KEY = 'mazeMuncher_menuVol';
const GAME_VOL_KEY = 'mazeMuncher_gameVol';
const SFX_VOL_KEY = 'mazeMuncher_sfxVol';

let menuVol = parseFloat(localStorage.getItem(MENU_VOL_KEY) || 0.5);
let gameVol = parseFloat(localStorage.getItem(GAME_VOL_KEY) || 0.5);
let sfxVol = parseFloat(localStorage.getItem(SFX_VOL_KEY) || 0.8);

// Menu Music
function initializeMenuMusic() {
    console.log('🎵 Initializing menu music...');
    if (!window.menuMusic) {
        window.menuMusic = new Audio('assets/audio/menu_background.mp3');
        window.menuMusic.loop = true;
        window.menuMusic.volume = menuVol;
    }
    window.menuMusic.play().catch(() => {
        // Handle play promise rejection if needed
    });
}

// Call the function when the page loads
window.addEventListener('DOMContentLoaded', () => {
    initializeMenuMusic();
});


// Save progress before leaving or reloading the page
window.addEventListener('beforeunload', () => {
    if (window.menuMusic) {
        sessionStorage.setItem('menuMusicTime', window.menuMusic.currentTime);
    }
});

/**
 * Starts the game.
 */
function startGame() {
    if (window.menuMusic) {
        window.menuMusic.pause();
        window.menuMusic.currentTime = 0;
        window.menuMusic.src = '';
        window.menuMusic = null;
    }
    window.location.href = 'game.html';
}

window.startGame = startGame;

let previousScreen = "mainMenu";

// Displays the settings screen.
function showSettings() {
    hideAllScreens();
    document.getElementById("settingsScreen").style.display = "block";
    previousScreen = "mainMenu";
}

// Displays the volume settings screen.
function volumeScreen() {
    hideAllScreens();
    const volumeScreen = document.getElementById("volumeScreen");
    volumeScreen.style.display = "block";
    previousScreen = "settingsScreen";

    const menuSlider = document.getElementById('menuMusicSlider');
    const gameSlider = document.getElementById('gameMusicSlider');
    const sfxSlider = document.getElementById('sfxSlider');

    menuSlider.value = menuVol;
    gameSlider.value = gameVol;
    sfxSlider.value = sfxVol;

    menuSlider.oninput = (event) => {
        menuVol = +event.target.value;
        localStorage.setItem(MENU_VOL_KEY, menuVol);
        if (window.menuMusic) window.menuMusic.volume = menuVol;
    };

    gameSlider.oninput = (event) => {
        gameVol = +event.target.value;
        localStorage.setItem(GAME_VOL_KEY, gameVol);
    };

    sfxSlider.oninput = (event) => {
        sfxVol = +event.target.value;
        localStorage.setItem(SFX_VOL_KEY, sfxVol);
    };
}

// Displays the accessibility options.
function accessibilityMenu() {
    hideAllScreens();
    document.getElementById("accessibilityScreen").style.display = "block";
    previousScreen = "settingsScreen";
}

function setColorBlindMode(type) {
    const menus = document.querySelectorAll('.menu');
    const buttons = document.querySelectorAll('button');

    menus.forEach(menu => {
        menu.classList.remove('normal', 'protanopia', 'deuteranopia', 'tritanopia');
        menu.classList.add(type);
    });

    buttons.forEach(btn => {
        btn.classList.remove('normal', 'protanopia', 'deuteranopia', 'tritanopia');
        btn.classList.add(type);
    });
    console.log("Setting colorblind mode to:", type);
}

// Takes us back to previous screen
function goBack() {

    if (previousScreen === "mainMenu") {
        // If we came from the main menu, go back to main menu
        document.getElementById("mainMenu").style.display = "block";
        document.getElementById("settingsScreen").style.display = "none";
        document.getElementById("levelSelectScreen").style.display = "none";
        document.getElementById("volumeScreen").style.display = "none";
        document.getElementById("accessibilityScreen").style.display = "none";  //hide
        document.getElementById("leaderboardScreen").style.display = "none";
    } else if (previousScreen === "settingsScreen") {
        // If we came from settings, go back to settings
        document.getElementById("settingsScreen").style.display = "block";
        document.getElementById("volumeScreen").style.display = "none";
        document.getElementById("accessibilityScreen").style.display = "none";
        previousScreen = "mainMenu"; // Update previous screen in case of another back press
    } else if (previousScreen === "leaderboardScreen") {
        document.getElementById("mainMenu").style.display = "block";
        document.getElementById("leaderboardScreen").style.display = "none";
        previousScreen = "mainMenu"
    } else {
        window.location.href = "MainMenu.html";

    hideAllScreens();
    document.getElementById(previousScreen).style.display = "block";
    if (previousScreen === "customizationScreen" || previousScreen === "leaderboardScreen") {
        previousScreen = "mainMenu";

    }
}

/**
 * Displays the leaderboard.
 */
function viewLeaderboard() {
    hideAllScreens();
    document.getElementById("leaderboardScreen").style.display = "block";
    previousScreen = "leaderboardScreen";
    updateLeaderboardDisplay();
}

//  Use localStorage to persist data
let leaderboardData = JSON.parse(localStorage.getItem('mazeMuncherLeaderboard')) || [];

function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById("leaderboardList");
    if (!leaderboardList) {
        console.error("Leaderboard list element not found.");
        return;
    }

    leaderboardList.innerHTML = "";

    leaderboardData.sort((a, b) => b.score - a.score); //high to low

    if (leaderboardData.length > 0) {
        leaderboardData.forEach((entry, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <span>${index + 1}.</span>
                <span>${entry.name}</span>
                <span>${entry.score}</span>
            `;
            leaderboardList.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement("li");
        listItem.classList.add("leaderboard-empty-message");
        listItem.textContent = "No scores recorded yet.";
        leaderboardList.appendChild(listItem);
    }
}

function updateLeaderboard(playerName, score) {
    leaderboardData.push({ name: playerName, score: score });
    leaderboardData.sort((a, b) => b.score - a.score); //high to low
     if (leaderboardData.length > 10) {
        leaderboardData = leaderboardData.slice(0, 10); // Keep only top 10
    }
    localStorage.setItem('mazeMuncherLeaderboard', JSON.stringify(leaderboardData)); // Save to localStorage
    updateLeaderboardDisplay(); // Update the display
}

function showCustomization() {
    hideAllScreens();
    document.getElementById("customizationScreen").style.display = "block";
    previousScreen = "customizationScreen";
    openTab('hats'); //show hats first
}

/**
 * Exits the game.
 */
function exitGame() {
    window.close();
}

/**
 * Displays the game credits.
 */
function viewCredits() {
    alert(
        "Credits:\nDeveloped by Dawsyn Birtell, Hope Walton, Kacy Dinkel, Kyle Cassity."
    );
}


function showLevelSelectMenu() {
    const mainMenu = document.getElementById("mainMenu");
    const levelSelectScreen = document.getElementById("levelSelectScreen");

    if (!levelSelectScreen) {
        console.error("Missing #levelSelectScreen in HTML");
        return;
    }

    mainMenu.style.display = "none";
    levelSelectScreen.style.display = "block";

    const container = document.getElementById("levelButtonsContainer");
    container.innerHTML = "";

    const levels = [
        { key: "map", label: "Level 1" },
        { key: "map2", label: "Level 2" },
        { key: "map3", label: "Level 3" }
    ];

    levels.forEach((level, index) => {
        const button = document.createElement("button");
        button.textContent = level.label;
        button.onclick = () => {
            localStorage.setItem("selectedMapIndex", index);
            window.location.href = "game.html";
        };
        container.appendChild(button);
    });

    previousScreen = "mainMenu";
}



// Add this function to handle tab switching in the customization screen
function openTab(tabName) {
    let i;
    let tabs = document.getElementsByClassName("tab");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.menu');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
}


// Expose functions globally so the HTML can access them
window.startGame = startGame;
window.viewCredits = viewCredits;
window.showSettings = showSettings;
window.volumeScreen = volumeScreen;
window.goBack = goBack;
window.viewLeaderboard = viewLeaderboard;
window.exitGame = exitGame;
window.updateLeaderboardDisplay = updateLeaderboardDisplay;
window.updateLeaderboard = updateLeaderboard;
window.showLevelSelectMenu = showLevelSelectMenu;

window.showCustomization = showCustomization;
window.openTab = openTab;
window.hideAllScreens = hideAllScreens;

