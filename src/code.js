globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

globalThis.loader = new GLTFLoader();

globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb');
globalThis.player = new Character(playerModel);
world.add(player);
playerModel.animations.forEach(a => {
    if (a.name === "Idle") a.name = CAnims.idle;
    if (a.name === "Run") a.name = CAnims.run;
});


extendMethod(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6)
});
player.takeControl();



var kitchen_knifeModel = await new Promise((resolve, reject) => {
    new GLTFLoader().load("build/assets/pistol.glb",
        gltf => {
            resolve(gltf);
        },
        undefined,
        reject
    );
});

kitchen_knifeModel.scene.position.copy({ "x": 0, "y": 14.86, "z": -1.93 });
world.graphicsWorld.add(kitchen_knifeModel.scene);
AutoScale({gltfScene:kitchen_knifeModel.scene, approximateScaleInMeters: .4});

/** @type {THREE.Object3D} */
let object = kitchen_knifeModel.scene.getObjectByName("Object_2");
object.position.set(0.1, -0.1, 0.1);
object.rotation.set(0, Math.PI / 2, 0);

expose(object);

const playerRightHand = player.getObjectByName("rhand");
playerRightHand.addWithPreservedScale(object);



world.startRenderAndUpdate?.();
