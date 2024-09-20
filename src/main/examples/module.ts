export {};

// IMPORTANT: Always use function AutoScale(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always use function expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

//#region Player Class
class Player extends Character {
    // put player code here
    update(timeStep: number): void {
        super.update(timeStep);
    }

    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
    }
}
//#endregion

//#region Cow Class
class Cow extends Character {
    grassEaten: number = 0;
    grassEatingDuration: number = 2000; // 2 seconds
    lastGrassEatTime: number = 0;
    grassEatingRange: number = 2; // Distance to grass for eating

    constructor(model: GLTF) {
        super(model);
        this.setupAnimations();
    }

    setupAnimations(): void {
        this.animationsMapping.idle = "Idle";
        this.animationsMapping.eating = "Eating";
    }

    update(timeStep: number): void {
        super.update(timeStep);
        this.checkAndEatGrass(timeStep);
    }

    checkAndEatGrass(timeStep: number): void {
        const closestGrass = this.findClosestGrass();
        if (closestGrass) {
            const distanceToGrass = this.position.distanceTo(closestGrass.position);
            if (distanceToGrass < this.grassEatingRange && Date.now() - this.lastGrassEatTime > this.grassEatingDuration) {
                this.lastGrassEatTime = Date.now();
                this.eatGrass(closestGrass);
            }
        }
    }

    findClosestGrass(): THREE.Object3D | null {
        let closestGrass: THREE.Object3D | null = null;
        let closestDistance = Infinity;
        world.graphicsWorld.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.name === "grass") {
                const distance = this.position.distanceTo(child.position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestGrass = child;
                }
            }
        });
        return closestGrass;
    }

    eatGrass(grass: THREE.Object3D): void {
        this.grassEaten++;
        this.setAnimation("eating", 0, false);
        this.mixer.addEventListener('finished', () => {
            this.setAnimation("idle", 0);
            world.remove(grass); // Remove the eaten grass
        });
    }
}
//#endregion

//#region Main Function
async function main() {
    const world = new World();
    await world.initialize('build/assets/world.glb');

    const textPrompt: HTMLDivElement = document.createElement('div');
    textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
    document.body.appendChild(textPrompt);

    const playerModel = await loadAsync('build/assets/boxman.glb');
    expose(playerModel.scene, "player");
    AutoScale(playerModel.scene, 1.7);
    addMethodListener(world, world.update, () => {
        TWEEN.update();
    });

    const player = new Player(playerModel);
    expose(player.moveSpeed, "player speed");
    player.setPosition(0, 0, -5);
    world.add(player);

    player.takeControl();

    // Add grass
    const grassModel = await loadAsync('build/assets/grass.glb'); // Replace with the actual path to your grass model
    AutoScale(grassModel.scene, 1); // Adjust the scale as needed

    // Create multiple instances of the grass model
    for (let i = 0; i < 10; i++) { // Adjust the number of instances
        const grassInstance = grassModel.scene.clone();
        grassInstance.position.set(
            Math.random() * 10 - 5, // Adjust the range for random X positions
            0, // Adjust the Y position for the grass height
            Math.random() * 10 - 5 // Adjust the range for random Z positions
        );
        grassInstance.name = "grass"; // Set the name for easy identification
        world.add(grassInstance);
    }

    // Add cows
    const cowModel = await loadAsync('build/assets/cow.glb'); // Replace with the actual path to your cow model
    AutoScale(cowModel.scene, 1); // Adjust the scale as needed

    for (let i = 0; i < 3; i++) { // Adjust the number of cows
        const cowInstance = new Cow(cowModel);
        cowInstance.setPosition(
            Math.random() * 10 - 5, // Adjust the range for random X positions
            0, // Adjust the Y position for the cow height
            Math.random() * 10 - 5 // Adjust the range for random Z positions
        );
        world.add(cowInstance);
    }
}
//#endregion

main();