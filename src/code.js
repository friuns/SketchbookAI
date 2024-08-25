(async function(){

globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            AutoScale(gltf, 5);
            resolve(gltf);
        }, undefined, reject);
    });
};



let loader = new GLTFLoader();


let playerModel = await loader.loadAsync('build/assets/boxman.glb');
playerModel.animations.forEach(a => {
    if (a.name === "Idle") a.name = CAnims.idle;
    if (a.name === "Run") a.name = CAnims.run;
});

let player = new Character(playerModel);
player.setPosition(-2.82, 14.8, -2.88);
world.add(player);
player.takeControl();



let carModel = new THREE.Group();

// Create seats
const seatGeometry = new THREE.BoxGeometry(0.5, 0.12, 0.54);
const seatMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const seat1 = new THREE.Mesh(seatGeometry, seatMaterial);
seat1.position.set(0.25, 0.06, 0.09);
carModel.add(seat1);

const seat2 = seat1.clone();
seat2.position.set(-0.25, 0.06, 0.09);
carModel.add(seat2);

const seat3 = seat1.clone();
seat3.position.set(0.25, 0.06, -0.45);
carModel.add(seat3);

const seat4 = seat1.clone();
seat4.position.set(-0.25, 0.06, -0.45);
carModel.add(seat4);

// Create body
const bodyGeometry = new THREE.BoxGeometry(1.28, 1.06, 2.49);
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xA52A2A });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.set(0, 0.40, 0.14);
carModel.add(body);

// Create wheels
const wheelGeometry = new THREE.CylinderGeometry(0.235, 0.235, 0.15, 32);
const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheel1.rotation.z = Math.PI / 2;
wheel1.position.set(1.01, -0.25, 1.73);
carModel.add(wheel1);

const wheel2 = wheel1.clone();
wheel2.position.set(-1.01, -0.25, 1.73);
carModel.add(wheel2);

const wheel3 = wheel1.clone();
wheel3.position.set(1.01, -0.25, -1.57);
carModel.add(wheel3);

const wheel4 = wheel1.clone();
wheel4.position.set(-1.01, -0.25, -1.57);
carModel.add(wheel4);

// Set car position
carModel.position.set(-2.82, 14.8, -2.88);

// Add car to the world
world.graphicsWorld.add(carModel);

})();