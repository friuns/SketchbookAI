





// IMPORTANT: Always use function AutoScaleInMeters(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always expose adjustable parameters to world.gui
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

//#region Main Function
async function main() {
    const world = new World();
    await world.initialize('build/assets/world.glb');

    const textPrompt: HTMLDivElement = document.createElement('div');
    textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
    document.body.appendChild(textPrompt);

    const playerModel = await loadAsync('build/assets/boxman.glb');
    expose(playerModel.scene, "player");
    AutoScaleInMeters(playerModel.scene, 1.7);
    addMethodListener(world, world.update, () => {
        TWEEN.update();
    });

    const player = new Player(playerModel);
    world.gui.add(player, "moveSpeed").name("Player Speed").min(0).max(10).step(0.1);
    player.setPosition(0, 0, -5);
    world.add(player);

    player.takeControl();

    const treeModel = await loadAsync('build/assets/tree.glb');
    const grassModel = await loadAsync('build/assets/grass.glb'); // Load the grass model
    const cowModel = await loadAsync('build/assets/cow.glb'); // Load the cow model
    const ogreModel = await loadAsync('build/assets/ogre.glb'); // Load the ogre model

    const numTrees = 10;
    const numGrass = 50; // Number of grass objects to create
    const numCows = 5; // Number of cows to create

    let treeSizeControl = world.gui.add({treeSize: 1}, 'treeSize', 0.1, 10).name("Tree Size").step(.1);
    let grassSizeControl = world.gui.add({grassSize: 1}, 'grassSize', 0.1, 10).name("Grass Size").step(.1); // Add a GUI control for grass size
    let cowSizeControl = world.gui.add({cowSize: 1}, 'cowSize', 0.1, 10).name("Cow Size").step(.1); // Add a GUI control for cow size
    let ogreSizeControl = world.gui.add({ogreSize: 1}, 'ogreSize', 0.1, 10).name("Ogre Size").step(.1); // Add a GUI control for ogre size

    const grassPatches: THREE.Object3D[] = []; // Array to store grass patches

    for (let i = 0; i < numTrees; i++) {

        const randomX = Math.random() * 50 - 25;
        const randomZ = Math.random() * 50 - 25;
        const randomScale = Math.random() + 0.5;
        
        const treeClone = treeModel.scene.clone();
        AutoScaleInMeters(treeClone, treeSizeControl.getValue());

        let tree = new BaseObject(treeClone, 0, 'none', CANNON.Body.STATIC);
        treeSizeControl.onChange(function (value: number) {
            tree.scale.setScalar(randomScale * value);
        });
        
        tree.scale.setScalar(randomScale * treeSizeControl.getValue());
        tree.setPosition(randomX, 0, randomZ);
        world.add(tree);
    }

    for (let i = 0; i < numGrass; i++) {
        const randomX = Math.random() * 50 - 25;
        const randomZ = Math.random() * 50 - 25;
        const randomScale = Math.random() * 0.5 + 0.5; // Random scale between 0.5 and 1

        const grassClone = grassModel.scene.clone();
        AutoScaleInMeters(grassClone, grassSizeControl.getValue()); // Scale the grass based on the GUI control

        let grass = new BaseObject(grassClone, 0, 'none', CANNON.Body.STATIC);
        grassSizeControl.onChange(function (value: number) {
            grass.scale.setScalar(randomScale * value);
        });

        grass.scale.setScalar(randomScale * grassSizeControl.getValue());
        grass.setPosition(randomX, 0, randomZ);
        world.add(grass);
        grassPatches.push(grass); // Add the grass patch to the array
    }

    const cows: Character[] = []; // Array to store cows
    for (let i = 0; i < numCows; i++) {
        const randomX = Math.random() * 50 - 25;
        const randomZ = Math.random() * 50 - 25;
        const randomScale = Math.random() * 0.5 + 0.5; // Random scale between 0.5 and 1

        const cowClone = cowModel.scene.clone();
        AutoScaleInMeters(cowClone, cowSizeControl.getValue()); // Scale the cow based on the GUI control

        let cow = new Character(cowClone);
        cow.animationsMapping.idle = "Idle"; // Assuming there's an "Idle" animation in the cow model
        cow.setBehaviour(new CowBehaviour(grassPatches)); // Use CowBehaviour with grassPatches
        
        cowSizeControl.onChange(function (value: number) {
            cow.scale.setScalar(randomScale * value);
        });

        cow.scale.setScalar(randomScale * cowSizeControl.getValue());
        cow.setPosition(randomX, 0, randomZ);
        world.add(cow);
        cows.push(cow); // Add the cow to the array
    }

    // Place the ogre
    const ogre = new Character(ogreModel);
    ogre.animationsMapping.idle = "Armature.001|Idle";
    ogre.animationsMapping.walk = "Armature.001|Walk";
    ogre.animationsMapping.dead = "Armature.001|Death";
    ogre.animationsMapping.attack = "Armature.001|Punch";
    ogre.setBehaviour(new FollowTarget(player)); 
    ogreSizeControl.onChange(function (value: number) {
        ogre.scale.setScalar(value);
    });
    ogre.scale.setScalar(ogreSizeControl.getValue()); 
    ogre.setPosition(-2.77, -0.04, -1.72);
    world.add(ogre);
}
//#endregion

// Add the CowBehaviour class
class CowBehaviour implements ICharacterAI {
    public character: Character;
    private grassPatches: THREE.Object3D[];
    private currentGrass: THREE.Object3D | null = null;
    private eatingTime: number = 0;
    private eatDuration: number = 5; // 5 seconds

    constructor(grassPatches: THREE.Object3D[]) {
        this.grassPatches = grassPatches;
    }

    public update(timeStep: number): void {
        // 1. Find the nearest grass patch
        let nearestGrass = this.findNearestGrass();
        if (nearestGrass) {
            this.currentGrass = nearestGrass;
        }

        // 2. If there is grass nearby:
        if (this.currentGrass) {
            // 2.1 Move towards the grass
            this.character.setViewVector(new THREE.Vector3().subVectors(this.currentGrass.position, this.character.position).normalize());
            this.character.triggerAction('up', true); 

            // 2.2 If close to the grass:
            if (this.character.position.distanceTo(this.currentGrass.position) < 5) {
                // 2.2.1 Start eating animation
                this.character.setAnimation('idle', 0); // Replace with a specific eating animation if you have one

                // 2.2.2 Increase eating timer
                this.eatingTime += timeStep;

                // 2.2.3 If eating for long enough:
                if (this.eatingTime > this.eatDuration) {
                    // 2.2.3.1 Remove the grass patch (or make it disappear)
                    world.remove(this.currentGrass);

                    // 2.2.3.2 Reset the eating timer
                    this.eatingTime = 0;
                    this.currentGrass = null;
                }
            }
        }
        // 3. If there's no grass nearby:
        else {
            this.character.triggerAction('up', false); // Stop moving
        }
    }

    private findNearestGrass(): THREE.Object3D | null {
        let nearestGrass: THREE.Object3D | null = null;
        let shortestDistance = Infinity;

        for (const grass of this.grassPatches) {
            const distance = this.character.position.distanceTo(grass.position);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestGrass = grass;
            }
        }

        return nearestGrass;
    }
}

main();  