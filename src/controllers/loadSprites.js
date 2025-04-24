
//Loads all farmboy animations 
export function loadCharSprites(scene) {
    // Farm Boy Sprites
    for (let i = 0; i <= 8; i++) {
        scene.load.spritesheet(`Farm boy${i}`, `assets/Farm boy/Farm boy-${i}.png`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    // Death Animation
    for (let i = 1; i <= 3; i++) {
        scene.load.spritesheet(`farmBoyDeath${i}`, `assets/Farm boy/Farm boy-death-${i}.png`, {
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

//Load char death animation sprites
export function loadDeathAnims(scene) {
    scene.anims.create({
        key: "farmBoyDeath",
        frames: [
            { key: "farmBoyDeath1" },
            { key: "farmBoyDeath2" },
            { key: "farmBoyDeath3" },
        ],
        frameRate: 3,
        repeat: 0
    });
}
