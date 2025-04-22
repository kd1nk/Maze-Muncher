// Volume preferences
const MENU_VOL_KEY = 'mazeMuncher_menuVol';
const GAME_VOL_KEY = 'mazeMuncher_gameVol';
const SFX_VOL_KEY  = 'mazeMuncher_sfxVol';

let menuVol = parseFloat(localStorage.getItem(MENU_VOL_KEY) || 0.5);
let gameVol = parseFloat(localStorage.getItem(GAME_VOL_KEY) || 0.5);
let sfxVol  = parseFloat(localStorage.getItem(SFX_VOL_KEY ) || 0.8);

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
 * Starts the game. Currently displays an alert.
 */
function startGame() {
    if (window.menuMusic) {
        window.menuMusic.pause();
        window.menuMusic.currentTime = 0;
        window.menuMusic.src = ''; //Unload the audio source
        window.menuMusic = null;   //Remove the global reference
    }
    window.location.href = 'game.html';
}

window.startGame = startGame;

let previousScreen = "mainMenu";

// Displays the settings screen - more settings can be added as deemed appropriate //
function showSettings() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("settingsScreen").style.display = "block";
    previousScreen = "mainMenu"; // We came from the main menu //
}

// Displays the volume settings screen.
function volumeScreen() {
    // hide the others…
    document.getElementById("mainMenu").style.display      = "none";
    document.getElementById("settingsScreen").style.display = "none";
  
    // show only volume
    const volDiv = document.getElementById("volumeScreen");
    volDiv.style.display    = "block";
    previousScreen = "settingsScreen";
  
    // grab sliders
    const menuSld = document.getElementById('menuMusicSlider');
    const gameSld = document.getElementById('gameMusicSlider');
    const sfxSld  = document.getElementById('sfxSlider');
  
    // init positions
    menuSld.value = menuVol;
    gameSld.value = gameVol;
    sfxSld.value  = sfxVol;
  
    // live listeners
    menuSld.oninput = e => {
    menuVol = +e.target.value;
    localStorage.setItem(MENU_VOL_KEY, menuVol);
    if (window.menuMusic) window.menuMusic.volume = menuVol;
    };
    gameSld.oninput = e => {
      gameVol = +e.target.value;
      localStorage.setItem(GAME_VOL_KEY, gameVol);
      // your Phaser scenes should read window.gameVol on startup
    };
    sfxSld.oninput = e => {
      sfxVol = +e.target.value;
      localStorage.setItem(SFX_VOL_KEY, sfxVol);
      // when you play SFX: let fx = new Audio(...); fx.volume = sfxVol;
    };
  }
  

// Displays the accessibility options.
function accessibilityMenu() {
    document.getElementById("settingsScreen").style.display = "none";
    document.getElementById("accessibilityScreen").style.display = "block";
    previousScreen = "settingsScreen"; // Came from the settings menu
}

function setColorBlindMode(type) {
    const menus = document.querySelectorAll('.menu');
    const buttons = document.querySelectorAll('button');

    // Remove all existing theme classes
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

// Takes us back to previous screen //
function goBack() {
    if (previousScreen === "mainMenu") {
        // If we came from the main menu, go back to main menu
        document.getElementById("mainMenu").style.display = "block";
        document.getElementById("settingsScreen").style.display = "none";
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
    }
}

/**
 * Displays the leaderboard.
 */
function viewLeaderboard() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("leaderboardScreen").style.display = "block";
    previousScreen = "leaderboardScreen"; // Set previousScreen
    updateLeaderboardDisplay(); // Call this function when showing the leaderboard
}

//  Use localStorage to persist data
let leaderboardData = JSON.parse(localStorage.getItem('mazeMuncherLeaderboard')) || [];

function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById("leaderboardList");
    if (!leaderboardList) {
        console.error("Leaderboard list element not found.");
        return;
    }

    leaderboardList.innerHTML = ""; // Clear the list first

    leaderboardData.sort((a, b) => b.score - a.score); // Sort by score descending

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
    leaderboardData.sort((a, b) => b.score - a.score); // Sort after adding
    if (leaderboardData.length > 10) {
        leaderboardData = leaderboardData.slice(0, 10); // Keep only top 10
    }
    localStorage.setItem('mazeMuncherLeaderboard', JSON.stringify(leaderboardData)); // Save to localStorage
    updateLeaderboardDisplay(); // Update the display
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
