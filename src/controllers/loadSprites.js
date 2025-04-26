
//Loads all base farmboy sprites 
export function loadBaseSprites(scene) {
    // Farm Boy Sprites
    for (let i = 0; i <= 8; i++) {
        scene.load.spritesheet(`Farm boy${i}`, `assets/Farm boy/Farm Boy/Farm boy-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    // Death Animation
    for (let i = 1; i <= 3; i++) {
        scene.load.spritesheet(`farmBoyDeath${i}`, `assets/Farm boy/Farm Boy/Farm boy-death-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
}

//Loads all Mario sprites 
export function loadMarioSprites(scene) {
    // Farm Boy Sprites
    for (let i = 1; i <= 9; i++) {
        scene.load.spritesheet(`Mario${i}`, `assets/Farm boy/Farm Boy Mario/fb-mario-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    // Mario Death Animation
    for (let i = 1; i <= 3; i++) {
        scene.load.spritesheet(`marioDeath${i}`, `assets/Farm boy/Farm Boy Mario/fb-mario-death-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
}


//Loads all mushroom sprites 
export function loadMushroomSprites(scene) {
    // Farm Boy Sprites
    for (let i = 1; i <= 9; i++) {
        scene.load.spritesheet(`Mushroom${i}`, `assets/Farm boy/Farm Boy Mushroom/fb-mushroom-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    // Death Animation
    for (let i = 1; i <= 3; i++) {
        scene.load.spritesheet(`mushroomDeath${i}`, `assets/Farm boy/Farm Boy Mushroom/fb-mushroom-death-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
}


//Loads all Top Hat sprites 
export function loadTopHatSprites(scene) {
    // Farm Boy Sprites
    for (let i = 1; i <= 9; i++) {
        scene.load.spritesheet(`Top Hat${i}`, `assets/Farm boy/Farm Boy Top Hat/fb-tophat-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    // Death Animation
    for (let i = 1; i <= 3; i++) {
        scene.load.spritesheet(`topHatDeath${i}`, `assets/Farm boy/Farm Boy Top Hat/fb-tophat-death-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
}


//Loads all pig sprites 
export function loadPigSprites(scene) {
    // Farm Boy Sprites
    for (let i = 1; i <= 9; i++) {
        scene.load.spritesheet(`Pig Boy${i}`, `assets/Farm boy/Pig Boy/fb-pig-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    // Death Animation
    for (let i = 1; i <= 3; i++) {
        scene.load.spritesheet(`pigBoyDeath${i}`, `assets/Farm boy/Pig Boy/fb-pig-death-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }
}


// Load all sheep enemy sprites
export function loadEnemySprites(scene) {
    const sheepTypes = [
        { prefix: "whiteSheep", path: "white sheep/sheep" },
        { prefix: "cyanSheep", path: "cyan sheep/cyan-sheep" },
        { prefix: "pinkSheep", path: "pink sheep/pink-sheep" },
        { prefix: "brownSheep", path: "brown sheep/brown-sheep" },
        { prefix: "scaredSheep", path: "scared sheep/scared-sheep" },
        { prefix: "scaredSheepAlt", path: "scared sheep alt/scared-sheep" }
    ];

    sheepTypes.forEach(({ prefix, path }) => {
        ["Left-1", "Right-1", "Left-2", "Right-2"].forEach(dir => {
            scene.load.spritesheet(`${prefix}${dir}`, `assets/enemies/${path.toLowerCase()}-${dir.toLowerCase()}.png`, {
                frameWidth: 32,
                frameHeight: 32
            });
        });
    });
}


