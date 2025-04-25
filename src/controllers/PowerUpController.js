export class powerUp {
    consturctor(name, icon) {
        this.name = name;
        this.icon = icon;
    }

    onPickup(player){
        //Animation? Sound affect?
    }

    activate(player){
        //Override in the subclasses for powerups...
        //console.warn(`${this.name} has no active effect. Find another item!`);
    }
}

export class PotatoPowerUp extends powerUp {
    constructor(){
        super('Lazy Timer', 'potato_yellow.png');
    }

    activate(player){
        const scene = player.scene;
        scene.scoreMultiplier += 0.25;

        scene.multiplierText.setText(`Multiplier: x${scene.scoreMultiplier.toFixed(2)}`);
        scene.showMessage?.("Who's keeping track anyway? (+0.25 to multiplier!)");
    }
}

export class CornPowerUp extends powerUp {
    constructor(){
        super('Stonks', 'Corn.png');
    }

    activate(player){
        const scene = player.scene;
        scene.score += 2000;

        if(scene.scoreText?.setText){
            scene.scoreText.setText(`Score: ${scene.score}`);
        }
        //scene.showMessage?.("There's how many on this thing? (+ 2000 points!)");
    }
}