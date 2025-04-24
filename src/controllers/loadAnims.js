//Load all character animations
export function loadCharAnims(scene) {
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