//IMPORTANT: Always use AutoScale(model, scale) to scale the model
//IMPORTANT: Always use expose(variable, name) to expose the parameters to GUI

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

let world = new World();
await world.initialize('build/assets/world.glb');


let textPrompt: HTMLDivElement = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);


let playerModel = await loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");
AutoScale(playerModel.scene, 1.7);
addMethodListener(world, world.update, function () {
    TWEEN.update();
});

class Pistol extends THREE.Object3D {
    bulletSpeed: number;
    bullets: Bullet[];
    reloadTime: number;
    lastShotTime: number;

    constructor(parent: THREE.Object3D) {
        super();
        parent.attach(this);
        this.bulletSpeed = 10;
        this.bullets = [];
        this.reloadTime = 0.5;
        this.lastShotTime = 0;
    }

    update(timeStep: number): void {
        this.bullets.forEach((bullet, index) => {
            bullet.position.add(bullet.direction.clone().multiplyScalar(this.bulletSpeed * timeStep));
            if (bullet.position.distanceTo(this.parent!.position) > 20) {
                this.bullets.splice(index, 1);
                world.remove(bullet);
            }
        });
    }

    shoot(): void {
        if (Date.now() - this.lastShotTime > this.reloadTime * 1000) {
            this.lastShotTime = Date.now();
            const bullet = new Bullet();
            bullet.position.copy(this.parent!.getWorldPosition(new THREE.Vector3()));
            bullet.direction.copy(world.camera.getWorldDirection(new THREE.Vector3()));
            world.add(bullet);
            this.bullets.push(bullet);
        }
    }
}

class Bullet extends THREE.Mesh {
    direction: THREE.Vector3;

    constructor() {
        super(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 'red' }));
        this.direction = new THREE.Vector3();
    }
}

class Player extends Character {
    rhand: THREE.Object3D | null;
    pistol: Pistol | null;

    constructor(model: THREE.Object3D) {
        super(model);
        this.rhand = model.getObjectByName("rhand");
        this.pistol = null;
        
        // Load the pistol model
        loader.loadAsync('build/assets/pistol.glb').then(gltf => {
            if (this.rhand) {
                this.pistol = new Pistol(this.rhand);
                this.pistol.attach(gltf.scene);
                this.pistol.position.set(0.1, -0.1, 0.1);
                this.pistol.rotation.set(0, Math.PI / 2, 0);
            }
        });
    }

    update(timeStep: number): void {
        super.update(timeStep);
        if (this.pistol) {
            this.pistol.update(timeStep);
        }
    }
    
    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
    }

    handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true && this.pistol) {
            this.pistol.shoot();
        }
    }
}

let player: Player = new Player(playerModel.scene);
expose(player.speed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);

player.takeControl();

world.startRenderAndUpdatePhysics?.();