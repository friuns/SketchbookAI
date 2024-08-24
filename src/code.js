
globalThis.world = new World('build/assets/world.glb');
await world.initialize();
world.registerUpdatable({
    update: () => {
    }
});

let playerModel = await new Promise((resolve, reject) => {
    new GLTFLoader().load('build/assets/boxman.glb', (gltf) => {
        gltf.animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });
        resolve(gltf);
    });
});
let player = new Character(playerModel);

player.setPosition(-2.82, 14.8, -2.88);
world.add(player);
player.takeControl();


