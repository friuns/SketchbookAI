/// <reference types="three" />
/// <reference types="cannon-es" />
/// <reference types="characters/Character" />
/// <reference types="three/examples/jsm/loaders/GLTFLoader" />
/// <reference types="@tweenjs/tween.js" />

import { GLTF as GLTFLoaderType } from 'three/examples/jsm/loaders/GLTFLoader';
import { Character } from 'characters/Character';

import { Tween } from '@tweenjs/tween.js';
// Declare globals if needed
declare global {
  interface GLTF extends GLTFLoaderType {}
  
  class Character extends Character {}
  class World extends World {}
  const TWEEN = Tween.prototype;
}