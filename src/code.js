globalThis.world = new World();
console.log(s);
await world.initialize('build/assets/world.glb');
globalThis.player = world.characters[0];
globalThis.snapshot = cloneDepth3(world);
player.takeControl();

