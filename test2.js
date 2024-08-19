function cloneDepth3(obj, depth = 3, clonedMap = new Map()) {
    if (depth === 0 || obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (clonedMap.has(obj)) {
        return clonedMap.get(obj);
    }

    let clonedObj;
    if (Array.isArray(obj)) {
        clonedObj = [];
    } else if (obj instanceof Function) {
        return obj;
    } else {
        clonedObj = Object.create(Object.getPrototypeOf(obj));
    }
    clonedMap.set(obj, clonedObj);

    for (let key of Reflect.ownKeys(obj)) {
        if (typeof obj[key] === 'function') {
            clonedObj[key] = obj[key];
        } else {
            clonedObj[key] = cloneDepth3(obj[key], depth - 1, clonedMap);
        }
    }

    return clonedObj;
}
function mergeSnapshot(target, source, depth = 3) {
    if (depth === 0 || target === null || typeof target !== 'object' || source === null || typeof source !== 'object') {
        return source;
    }

    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] === null) {
                target[key] = null;
            } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                mergeSnapshot(target[key], source[key], depth - 1);
            } else {
                target[key] = source[key];
            }
        }
    }

    return target;
}

class ExampleObject {
    constructor() {
        this.b = {
            b1: null,
            b2: {
                b21: 3,
                a: [{a: 1}, {b: 2}, {c: 3}],
                b22: {
                    b221: 4,
                    b222: 5
                }
            }
        };
        
    }
}

const originalObject = new ExampleObject();

console.log('Original:', JSON.stringify(originalObject));
const s = cloneDepth3(originalObject);
console.log('Snapshot:', JSON.stringify(s));
originalObject.b.b2.a.push({d:4});
mergeSnapshot(originalObject, s);
console.log('Merged:', JSON.stringify(originalObject));
