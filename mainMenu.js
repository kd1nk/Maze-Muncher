/**
 * Starts the game. Currently displays an alert.
 */
function startGame() {
    alert("Starting the game...");

    window.location.href = "game.html";
}

let previousScreen = "mainMenu";

// Displays the settings screen - more settings can be added as deemed appropriate //
function showSettings() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("settingsScreen").style.display = "block";
    previousScreen = "mainMenu"; // We came from the main menu //
}
// Displays the volume settings screen. Can add more volume settings later (background noise, voices, etc.) //
function volumeScreen() {
    document.getElementById("settingsScreen").style.display = "none";
    document.getElementById("volumeScreen").style.display = "block";
    previousScreen = "settingsScreen"; // Came from the settings menu //
}

function accessibilityMenu() {
    document.getElementById("settingsScreen").style.display = "none";
    document.getElementById("accessibilityScreen").style.display = "block";
    previousScreen = "settingsScreen"; // Came from the settings menu //
}

// Takes us back to previous screen //
function goBack() {
    if (previousScreen === "mainMenu") {
        // If we came from the main menu, go back to main menu
        document.getElementById("mainMenu").style.display = "block";
        document.getElementById("settingsScreen").style.display = "none";
        document.getElementById("volumeScreen").style.display = "none";
    } else if (previousScreen === 'settingsScreen') {
        // If we came from settings, go back to settings //
        document.getElementById("settingsScreen").style.display = "block";
        document.getElementById("volumeScreen").style.display = "none";
        previousScreen = "mainMenu"; // Update previous screen in case of another back press //
    }
}

/**
 * Displays the leaderboard.
 */
function viewLeaderboard() {
    alert(
        "Leaderboard:\n1. Player A - 1200 pts\n2. Player B - 1000 pts\n3. Player C - 800 pts"
    );
}

/**
 * Exits the game.  Currently displays an alert and attempts to close the window.
 */
function exitGame() {
    alert("Exiting the game.");
    window.close(); // May not work in all browsers
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