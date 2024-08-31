globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

var textPrompt = globalThis.textPrompt = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

var loader = globalThis.loader = new GLTFLoader();

var playerModel = globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");

class Player extends Character {
    constructor(model) {
        super(model);
        this.rhand = model.scene.getObjectByName("rhand");
        this.lhand = model.scene.getObjectByName("lhand");
        this.remapAnimations(model.animations);
        this.actions.interract = new KeyBinding("KeyR");
        this.actions.placeBlock = new KeyBinding("Mouse1");
    }

    remapAnimations(animations) {
        animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        for (let updatable of world.updatables) {
            if (updatable.interract && this.position.distanceTo(updatable.position) < 2) {
                textPrompt.textContent = "Press R to interact";
                if (this.actions.interract.justPressed) {
                    updatable.interract(this);
                }
                return;
            }
        }
        textPrompt.textContent = "";

        // Handle block placement
        if (this.actions.placeBlock.justReleased) {
            this.placeBlock();
        }
    }

    placeBlock() {
        // Raycast from the player's position to find the position to place the block
        var raycaster = globalThis.raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), world.camera);
        var intersects = globalThis.intersects = raycaster.intersectObjects(world.graphicsWorld.children, true);

        if (intersects.length > 0) {
            var intersection = globalThis.intersection = intersects[0];
            var position = globalThis.position = intersection.point.clone().add(intersection.face.normal.multiplyScalar(0.5));

            // Create a new cube object and add it to the world
            var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
            var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            var cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            var cube = globalThis.cube = new BaseObject(cubeMesh, true);
            cube.setPosition(position);
            world.add(cube);
        }
    }

    handleMouseButton(event, code, pressed) {
        super.handleMouseButton(event, code, pressed);
    }
}

class NPC extends Character {
    constructor(model, dialog) {
        super(model);
        this.dialog = dialog;
    }

    interract(player) {
        Swal.fire({
            title: this.dialog,
            toast: false,
            showCancelButton: true,
            confirmButtonText: 'Follow',
        }).then((result) => {
            if (result.isConfirmed) {
                this.setBehaviour(new FollowTarget(player));
            }
        });
    }
}

var player = globalThis.player = new Player(playerModel);
player.setPosition(-3.36, 14.1, -6.45);
world.add(player);

addMethodListener(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6)
});
player.takeControl();

world.startRenderAndUpdatePhysics?.();

// Spawn multiple NPC characters
var npcs = globalThis.npcs = [];
var npcPositions = globalThis.npcPositions = [
    { x: 2.5, y: 14.1, z: -6.45, dialog: "Follow me to the secret room" },
    { x: -1.2, y: 14.1, z: -4.2, dialog: "I have something important to tell you" },
    { x: 0.75, y: 14.63, z: -2.33, dialog: "Can you help me find my lost item?" }
];

for (var i = globalThis.i = 0; i < npcPositions.length; i++) {
    var npcModel = globalThis.npcModel = await loader.loadAsync('build/assets/boxman.glb');
    var npc = globalThis.npc = new NPC(npcModel, npcPositions[i].dialog);
    npc.setPosition(npcPositions[i].x, npcPositions[i].y, npcPositions[i].z);
    npcs.push(npc);
    world.add(npc);
};