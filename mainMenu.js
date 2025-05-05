// Volume Preferences
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

window.addEventListener('DOMContentLoaded', () => {
    initializeMenuMusic();

});

window.addEventListener('beforeunload', () => {
    if (window.menuMusic) {
        sessionStorage.setItem('menuMusicTime', window.menuMusic.currentTime);
    }
});

function startGame() {
    if (window.menuMusic) {
        window.menuMusic.pause();
        window.menuMusic.currentTime = 0;
        window.menuMusic.src = '';
        window.menuMusic = null;
    }
    window.location.href = 'game.html';
}

let previousScreen = "mainMenu";

function hideAllScreens() {
    document.querySelectorAll('.menu').forEach(screen => {
        screen.style.display = 'none';
    });
}

function showSettings() {
    hideAllScreens();
    document.getElementById("settingsScreen").style.display = "block";
    previousScreen = "mainMenu";
}

function volumeScreen() {
    hideAllScreens();
    document.getElementById("volumeScreen").style.display = "block";
    previousScreen = "settingsScreen";

    const menuSlider = document.getElementById('menuMusicSlider');
    const gameSlider = document.getElementById('gameMusicSlider');
    const sfxSlider = document.getElementById('sfxSlider');

    menuSlider.value = menuVol;
    gameSlider.value = gameVol;
    sfxSlider.value = sfxVol;

    menuSlider.oninput = (e) => {
        menuVol = +e.target.value;
        localStorage.setItem(MENU_VOL_KEY, menuVol);
        if (window.menuMusic) window.menuMusic.volume = menuVol;
    };

    gameSlider.oninput = (e) => {
        gameVol = +e.target.value;
        localStorage.setItem(GAME_VOL_KEY, gameVol);
    };

    sfxSlider.oninput = (e) => {
        sfxVol = +e.target.value;
        localStorage.setItem(SFX_VOL_KEY, sfxVol);
    };
}

function accessibilityMenu() {
    hideAllScreens();
    document.getElementById("accessibilityScreen").style.display = "block";
    previousScreen = "settingsScreen";
}

function setColorBlindMode(type) {
    document.querySelectorAll('.menu, button').forEach(element => {
        element.classList.remove('normal', 'protanopia', 'deuteranopia', 'tritanopia');
        element.classList.add(type);
    });
    console.log("Setting colorblind mode to:", type);
}

function goBack() {
    hideAllScreens();
    document.getElementById(previousScreen).style.display = "block";

    if (previousScreen === "mainMenu") {
        document.getElementById("mainMenu").style.display = "block";
    } else if (previousScreen === "settingsScreen") {
        document.getElementById("settingsScreen").style.display = "block";
    } else {
        previousScreen = "mainMenu";
    }
}

function viewLeaderboard() {
    hideAllScreens();
    document.getElementById("leaderboardScreen").style.display = "block";
    previousScreen = "leaderboardScreen";
    updateLeaderboardDisplay();
}

let leaderboardData = JSON.parse(localStorage.getItem('mazeMuncherLeaderboard')) || [];

function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById("leaderboardList");
    if (!leaderboardList) return;

    leaderboardList.innerHTML = "";
    leaderboardData.sort((a, b) => b.score - a.score);

    leaderboardData.forEach((entry, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<span>${index + 1}.</span> <span>${entry.name}</span> <span>${entry.score}</span>`;
        leaderboardList.appendChild(listItem);
    });
}

function updateLeaderboard(playerName, score) {
    leaderboardData.push({ name: playerName, score: score });
    leaderboardData.sort((a, b) => b.score - a.score);
    if (leaderboardData.length > 10) leaderboardData.length = 10;
    localStorage.setItem('mazeMuncherLeaderboard', JSON.stringify(leaderboardData));
    updateLeaderboardDisplay();
}

function showCustomization() {
    hideAllScreens();
    document.getElementById("customizationScreen").style.display = "block";
    previousScreen = "customizationScreen";
    openTab('hats');
}


    function setupHatSelection() {
        const playerSprite = document.getElementById('playerSprite');
        const hatButtons = document.querySelectorAll('.hat-selection button');
    
        const imagePaths = {
            none: 'assets/Farm boy/Farm Boy/Farm boy-0.png',
            mario: 'assets/Farm boy/Farm Boy Mario/fb-mario-1.png',
            mushroom: 'assets/Farm boy/Farm Boy Mushroom/fb-mushroom-1.png',
            pig: 'assets/Farm boy/Pig Boy/fb-pig-1.png',
            tophat: 'assets/Farm boy/Farm Boy Top Hat/fb-tophat-1.png',
        };
    
        const updatePlayerSprite = (hatType) => {
            playerSprite.src = imagePaths[hatType] || imagePaths.none;
            localStorage.setItem('selectedHat', hatType);
            selectedHat = hatType; 
        };
    
        let selectedHat = localStorage.getItem('selectedHat') || 'none';
        updatePlayerSprite(selectedHat); // preload it visually
    
        hatButtons.forEach(button => {
            button.addEventListener('click', () => {
                updatePlayerSprite(button.dataset.hat);
            });
        });
    
        return selectedHat; 
    }
    


function showLevelSelectMenu() {
    hideAllScreens();
    document.getElementById("levelSelectScreen").style.display = "block";
    const levels = [
        { key: "map", label: "Level 1" },
        { key: "map2", label: "Level 2" },
        { key: "map3", label: "Level 3" }
    ];

    const container = document.getElementById("levelButtonsContainer");
    container.innerHTML = "";
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

function openTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}

function exitGame() {
    window.close();
}

function viewCredits() {
    alert("Credits:\nDeveloped by Dawsyn Birtell, Hope Walton, Kacy Dinkel, Kyle Cassity.");
}

// Expose global functions
Object.assign(window, {
    startGame, viewCredits, showSettings, volumeScreen,
    goBack, viewLeaderboard, exitGame, updateLeaderboardDisplay,
    updateLeaderboard, showLevelSelectMenu, showCustomization, openTab, hideAllScreens
});
