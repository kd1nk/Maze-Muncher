//Load Base animations
export function loadBaseAnims(scene) {
    scene.anims.create({
        key: "neutral",
        frames: [{ key: "Farm boy0" }],
        frameRate: 10
    });

    scene.anims.create({
        key: "walk-right",
        frames: [{ key: "Farm boy1" }, { key: "Farm boy2" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-left",
        frames: [{ key: "Farm boy3" }, { key: "Farm boy4" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-down",
        frames: [{ key: "Farm boy5" }, { key: "Farm boy6" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-up",
        frames: [{ key: "Farm boy7" }, { key: "Farm boy8" }],
        frameRate: 7,
        repeat: -1
    });
}


//Load Mario Head animations
export function loadMarioAnims(scene) {
    scene.anims.create({
        key: "neutral",
        frames: [{ key: "Mario1" }],
        frameRate: 10
    });

    scene.anims.create({
        key: "walk-right",
        frames: [{ key: "Mario2" }, { key: "Mario3" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-left",
        frames: [{ key: "Mario4" }, { key: "Mario5" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-down",
        frames: [{ key: "Mario6" }, { key: "Mario7" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-up",
        frames: [{ key: "Mario8" }, { key: "Mario9" }],
        frameRate: 7,
        repeat: -1
    });
}


//Load Mushroom Head animations
export function loadMushroomAnims(scene) {
    scene.anims.create({
        key: "neutral",
        frames: [{ key: "Mushroom1" }],
        frameRate: 10
    });

    scene.anims.create({
        key: "walk-right",
        frames: [{ key: "Mushroom2" }, { key: "Mushroom3" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-left",
        frames: [{ key: "Mushroom4" }, { key: "Mushroom5" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-down",
        frames: [{ key: "Mushroom6" }, { key: "Mushroom7" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-up",
        frames: [{ key: "Mushroom8" }, { key: "Mushroom9" }],
        frameRate: 7,
        repeat: -1
    });
}

//Load Top Hat animations
export function loadTopHatAnims(scene) {
    scene.anims.create({
        key: "neutral",
        frames: [{ key: "Top Hat1" }],
        frameRate: 10
    });

    scene.anims.create({
        key: "walk-right",
        frames: [{ key: "Top Hat2" }, { key: "Top Hat3" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-left",
        frames: [{ key: "Top Hat4" }, { key: "Top Hat5" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-down",
        frames: [{ key: "Top Hat6" }, { key: "Top Hat7" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-up",
        frames: [{ key: "Top Hat8" }, { key: "Top Hat9" }],
        frameRate: 7,
        repeat: -1
    });
}

//Load all character animations
export function loadPigAnims(scene) {
    scene.anims.create({
        key: "neutral",
        frames: [{ key: "Pig Boy1" }],
        frameRate: 10
    });

    scene.anims.create({
        key: "walk-right",
        frames: [{ key: "Pig Boy2" }, { key: "Pig Boy3" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-left",
        frames: [{ key: "Pig Boy4" }, { key: "Pig Boy5" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-down",
        frames: [{ key: "Pig Boy6" }, { key: "Pig Boy7" }],
        frameRate: 7,
        repeat: -1
    });

    scene.anims.create({
        key: "walk-up",
        frames: [{ key: "Pig Boy8" }, { key: "Pig Boy9" }],
        frameRate: 7,
        repeat: -1
    });
}

//Load base death animation sprites
export function loadBaseDeathAnims(scene) {
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

//Load Mario head death animation sprites
export function loadMarioDeathAnims(scene) {
    scene.anims.create({
        key: "marioDeath",
        frames: [
            { key: "marioDeath1" },
            { key: "marioDeath2" },
            { key: "marioDeath3" },
        ],
        frameRate: 3,
        repeat: 0
    });
}

//Load Mushroom head death animation sprites
export function loadMushroomDeathAnims(scene) {
    scene.anims.create({
        key: "mushroomDeath",
        frames: [
            { key: "mushroomDeath1" },
            { key: "mushroomDeath2" },
            { key: "mushroomDeath3" },
        ],
        frameRate: 3,
        repeat: 0
    });
}

//Load char death animation sprites
export function loadTopHatDeathAnims(scene) {
    scene.anims.create({
        key: "topHatDeath",
        frames: [
            { key: "topHatDeath1" },
            { key: "topHatDeath2" },
            { key: "topHatDeath3" },
        ],
        frameRate: 3,
        repeat: 0
    });
}

//Load char death animation sprites
export function loadPigDeathAnims(scene) {
    scene.anims.create({
        key: "pigBoyDeath",
        frames: [
            { key: "pigBoyDeath1" },
            { key: "pigBoyDeath2" },
            { key: "pigBoyDeath3" },
        ],
        frameRate: 3,
        repeat: 0
    });
}

//Load all sheep enemy animations
export function loadSheepAnims(scene) {
    const sheepTypes = [
        "whiteSheep",
        "cyanSheep",
        "pinkSheep",
        "brownSheep",
        "scaredSheep",
        "scaredSheepAlt"
    ];

    sheepTypes.forEach(type => {
        scene.anims.create({
            key: `${type}-right`,
            frames: [
                { key: `${type}Right-1` },
                { key: `${type}Right-2` },
            ],
            frameRate: 7,
            repeat: -1
        });

        scene.anims.create({
            key: `${type}-left`,
            frames: [
                { key: `${type}Left-1` },
                { key: `${type}Left-2` },
            ],
            frameRate: 7,
            repeat: -1
        });
    });
}