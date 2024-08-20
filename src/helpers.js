async function loadModel(glbUrl, intersectionPoint) {
    return new Promise((resolve, reject) => {
        new GLTFLoader().load(glbUrl, (gltf) => {
            const model = gltf.scene;
            model.position.copy(intersectionPoint);
            world.graphicsWorld.add(model);
            resolve(model);
        }, undefined, reject);
    });
}

function addBoxColliderToModel(model, intersectionPoint) {
    const boundingBox = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3().copy(boundingBox.getSize(new THREE.Vector3())).multiplyScalar(0.5);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const boxCollider = new BoxCollider({
        mass: 1,
        position: new THREE.Vector3().copy(intersectionPoint).add(center),
        size: size,
        friction: 0.3
    });

    return { boxCollider, center };
}

function addPhysicsToModel(model, intersectionPoint) {
    const { boxCollider, center } = addBoxColliderToModel(model, intersectionPoint);

    world.physicsWorld.add(boxCollider.body);

    const modelWrapper = new THREE.Object3D();
    modelWrapper.add(model);
    model.position.copy(center.negate());
    world.graphicsWorld.add(modelWrapper);

    world.registerUpdatable({
        updateOrder: 0,
        update: () => {
            modelWrapper.position.copy(Utils.threeVector(boxCollider.body.position));
            modelWrapper.quaternion.copy(Utils.threeQuat(boxCollider.body.quaternion));
        }
    });
}