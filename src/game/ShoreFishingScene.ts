import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FishSpeciesDef, FloatDef, LocationDef, RodType, WeatherType } from './types';
import { Fauna3DRig, animateFauna3DMesh, buildFauna3DMesh } from './fish3d';
import {
  BobberRig,
  FishingRodRig,
  ShoreEnvironmentRig,
  buildBobberRig,
  buildFishingRodRig,
  buildShoreEnvironment,
} from './shoreWorldGen';
import {
  clampCastToWaterBounds,
  fromVisualWaterDist,
  getPhotoVisualBounds,
  isScreenPointInPhotoWater,
  isWaterSpotValid,
  toVisualWaterDist,
} from './waterBounds';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _cTop = new THREE.Color();
const _cHor = new THREE.Color();
const _cSun = new THREE.Color();
const _cFog = new THREE.Color();

export type FishingVisualPhase =
  | 'IDLE'
  | 'CHARGING'
  | 'CASTING'
  | 'WAITING'
  | 'NIBBLE'
  | 'BITE'
  | 'FIGHTING'
  | 'SNAGGED'
  | 'CAUGHT';

export interface ShoreSceneSync {
  location: LocationDef;
  rodType: RodType;
  rodLevelIndex: number;
  floatDef?: FloatDef;
  hookedSpecies?: FishSpeciesDef | null;
  timeOfDay: number;
  weather: WeatherType;
  phase: FishingVisualPhase;
  chargeRatio: number; // 0..1
  tensionRatio: number; // 0..1
  isReeling: boolean;
  fishDistanceM: number; // 1..maxCast
  castTargetDistanceM: number;
  maxCastDistanceM: number;
  aimYaw: number; // -0.82 .. +0.82 radians
  fishLateralOffset: number; // -1..+1 during fight
  aimOutOfBounds?: boolean;
}

export class ShoreFishingScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId = 0;
  private disposed = false;
  private contextLost = false;
  private clock = new THREE.Clock();

  private sync: ShoreSceneSync;
  private maxAniso = 4;

  // Sky & Water
  private skyMesh!: THREE.Mesh;
  private skyMat!: THREE.ShaderMaterial;
  private waterMat!: THREE.ShaderMaterial;
  private waterMesh!: THREE.Mesh;
  private fogExp2!: THREE.FogExp2;
  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private isPhotoMode = false;

  // Environment & Actors
  private envRig!: ShoreEnvironmentRig;
  private rodRig!: FishingRodRig;
  private bobberRig!: BobberRig;
  private fishingLine!: THREE.Line;
  private linePositions = new Float32Array(12 * 3); // 12-point catenary line

  // Weather particles (rain / anomaly spores)
  private weatherParticles!: THREE.Points;
  // Ambient wildlife: lightweight procedural birds and occasional fish jumps.
  private ambientBirds: Array<{ group: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh; phase: number; speed: number; radius: number }> = [];
  private jumpingFish!: THREE.Group;
  private fishSplash!: THREE.Mesh;
  private fishJumpStart = -100;
  private fishJumpX = 0;
  private fishJumpZ = -24;
  private nextFishJump = 8;
  private weatherPos!: Float32Array;
  private currentLocId: string;
  private currentRodKey: string;
  private currentFloatId: string;
  private hookedFaunaRig: Fauna3DRig | null = null;
  private hookedSpeciesId: string | null = null;

  // Dynamic bobber / cast state
  private bobberWorldPos = new THREE.Vector3(0, 0.05, -14);
  private castStartPos = new THREE.Vector3(0, 2.2, 0.5);
  private castEndPos = new THREE.Vector3(0, 0.05, -18);
  private castFlightT = 0;
  private rippleTime = -10;
  private rippleStrength = 0;
  private smoothTension = 0;
  private smoothYaw = 0;
  private smoothFishX = 0;
  private aimReticleGroup!: THREE.Group;
  private aimReticleInner!: THREE.Mesh;
  private aimReticleOuter!: THREE.Mesh;
  private raycaster = new THREE.Raycaster();
  private ndcVec = new THREE.Vector2();
  private waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.05);

  constructor(container: HTMLElement, initial: ShoreSceneSync) {
    this.container = container;
    this.sync = initial;
    this.currentLocId = initial.location.id;
    this.currentRodKey = `${initial.rodType}_${initial.rodLevelIndex}`;
    this.currentFloatId = initial.floatDef?.id ?? 'float_wood';

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.isPhotoMode = Boolean(initial.location.backdropPhotoUrl);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setClearColor(0x0b1418, this.isPhotoMode ? 0 : 1);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.fogExp2 = new THREE.FogExp2(0x182520, 0.011);
    this.scene.fog = this.isPhotoMode ? null : this.fogExp2;

    const aspect =
      (container.clientWidth || window.innerWidth) /
      (container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(56, aspect, 0.1, 450);
    this.camera.position.set(0, 2.35, 1.35);
    this.camera.lookAt(0, 1.45, -18);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.setupLighting();
    this.setupSky();
    this.setupWater(initial.location);
    this.rebuildEnvironment(initial.location);
    this.rebuildRod(initial.rodType, initial.rodLevelIndex);
    this.setupBobberAndLine(initial.location);
    this.setupWeatherParticles();
    this.setupAmbientWildlife();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);

    this.clock.start();
    this.tick();
  }

  public updateSync(next: ShoreSceneSync): void {
    const prevPhase = this.sync.phase;
    this.sync = next;

    if (next.location.id !== this.currentLocId) {
      this.currentLocId = next.location.id;
      this.isPhotoMode = Boolean(next.location.backdropPhotoUrl);
      this.renderer.setClearColor(0x0b1418, this.isPhotoMode ? 0 : 1);
      this.skyMesh.visible = !this.isPhotoMode;
      this.scene.fog = this.isPhotoMode ? null : this.fogExp2;
      this.rebuildEnvironment(next.location);
      this.waterMat.uniforms.uPhotoOverlay.value = this.isPhotoMode ? 1.0 : 0.0;
      const photoBounds = getPhotoVisualBounds(next.location);
      this.waterMat.uniforms.uPhotoNearZ.value = -(photoBounds.near - 0.6);
      this.waterMat.uniforms.uPhotoFarZ.value = -(photoBounds.far + 1.0);
      this.waterMat.uniforms.uCurrentSpeed.value = next.location.currentSpeed;
      this.waterMat.uniforms.uGlowColor.value.set(next.location.glowColor);
      this.waterMat.uniforms.uAnomalyGlow.value =
        next.location.waterType === 'anomaly_lake'
          ? 0.85
          : next.location.waterType === 'swamp'
            ? 0.35
            : 0.05;
    }

    const rKey = `${next.rodType}_${next.rodLevelIndex}`;
    if (rKey !== this.currentRodKey) {
      this.currentRodKey = rKey;
      this.rebuildRod(next.rodType, next.rodLevelIndex);
    }

    const nextFloatId = next.floatDef?.id ?? 'float_wood';
    if (nextFloatId !== this.currentFloatId) {
      this.currentFloatId = nextFloatId;
      this.rebuildBobber(next.location, next.floatDef);
    }

    const nextHookedId =
      next.phase === 'FIGHTING' && next.hookedSpecies ? next.hookedSpecies.id : null;
    if (nextHookedId !== this.hookedSpeciesId) {
      this.hookedSpeciesId = nextHookedId;
      if (this.hookedFaunaRig) {
        this.scene.remove(this.hookedFaunaRig.group);
        this.hookedFaunaRig = null;
      }
      if (next.hookedSpecies && next.phase === 'FIGHTING') {
        this.hookedFaunaRig = buildFauna3DMesh(next.hookedSpecies);
        this.hookedFaunaRig.group.scale.multiplyScalar(0.58);
        this.scene.add(this.hookedFaunaRig.group);
      }
    }

    // Trigger cast ballistic flight when transitioning into CASTING
    if (prevPhase !== 'CASTING' && next.phase === 'CASTING') {
      this.rodRig.tipMarker.getWorldPosition(this.castStartPos);
      const dist = this.toVisualWaterDist(next.castTargetDistanceM, next.maxCastDistanceM);
      const yaw = THREE.MathUtils.clamp(next.aimYaw, -0.84, 0.84);
      this.castEndPos.set(Math.sin(yaw) * dist, 0.05, -Math.cos(yaw) * dist);
      this.castFlightT = 0;
    }

    // Trigger water ripple when bobber lands
    if (prevPhase === 'CASTING' && next.phase === 'WAITING') {
      this.rippleTime = this.clock.getElapsedTime();
      this.rippleStrength = 1.0;
    }
  }

  private toVisualWaterDist(distM: number, maxCastM: number): number {
    return toVisualWaterDist(this.sync.location, distM, maxCastM);
  }

  private fromVisualWaterDist(visualDist: number, maxCastM: number): number {
    return fromVisualWaterDist(this.sync.location, visualDist, maxCastM);
  }

  public projectScreenToWater(
    clientX: number,
    clientY: number,
    maxCastM: number
  ): { yaw: number; distM: number; isWater: boolean } {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const loc = this.sync.location;
    if (rect.width <= 0 || rect.height <= 0) {
      const safe = clampCastToWaterBounds(loc, 0, 14, maxCastM);
      return { yaw: safe.yaw, distM: safe.distM, isWater: false };
    }
    const vp = { width: rect.width, height: rect.height };
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const ndcX = (localX / rect.width) * 2 - 1;
    const ndcY = -(localY / rect.height) * 2 + 1;
    this.ndcVec.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.ndcVec, this.camera);

    const hit = new THREE.Vector3();
    const intersected = this.raycaster.ray.intersectPlane(this.waterPlane, hit);
    const minHitZ = this.isPhotoMode ? getPhotoVisualBounds(loc).minWorldZ : -3.5;

    if (!intersected || hit.z > minHitZ) {
      // Pointing at sky/far horizon or down at wooden pier / near bank
      const dir = this.raycaster.ray.direction;
      const far = dir.y >= -0.02;
      const yawRaw = Math.atan2(dir.x, -dir.z);
      const clamped = clampCastToWaterBounds(loc, yawRaw, far ? maxCastM : 4.5, maxCastM, vp);
      return { yaw: clamped.yaw, distM: clamped.distM, isWater: false };
    }

    const yawRaw = Math.atan2(hit.x, -hit.z);
    const visualDist = Math.hypot(hit.x, hit.z);
    const rawDistM = this.fromVisualWaterDist(visualDist, maxCastM);

    const screenInPhotoWater = this.isPhotoMode
      ? isScreenPointInPhotoWater(loc, localX, localY, vp)
      : true;
    const spotValid =
      screenInPhotoWater &&
      Math.abs(yawRaw) <= 0.82 &&
      isWaterSpotValid(loc, yawRaw, rawDistM, maxCastM, vp);

    const clamped = clampCastToWaterBounds(loc, yawRaw, rawDistM, maxCastM, vp);
    return { yaw: clamped.yaw, distM: clamped.distM, isWater: spotValid };
  }

  public projectWaterToScreen(
    yaw: number,
    distM: number,
    maxCastM: number
  ): { xPct: number; yPct: number; visible: boolean } {
    const vDist = this.toVisualWaterDist(distM, maxCastM);
    const clampedYaw = THREE.MathUtils.clamp(yaw, -0.84, 0.84);
    _v1.set(Math.sin(clampedYaw) * vDist, 0.08, -Math.cos(clampedYaw) * vDist);
    _v1.project(this.camera);
    const visible = _v1.z < 1 && _v1.x >= -1.05 && _v1.x <= 1.05 && _v1.y >= -1.05 && _v1.y <= 1.05;
    return {
      xPct: ((_v1.x + 1) * 0.5) * 100,
      yPct: ((1 - _v1.y) * 0.5) * 100,
      visible,
    };
  }

  public triggerWaterSplash(strength = 0.85): void {
    this.rippleTime = this.clock.getElapsedTime();
    this.rippleStrength = strength;
  }

  private setupLighting(): void {
    this.hemiLight = new THREE.HemisphereLight(0x9bc4df, 0x1e2c1d, 0.9);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff1d6, 1.9);
    this.sunLight.position.set(42, 65, -20);
    if (!this.isSoftwareGl) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1024, 1024);
      const d = 42;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0005;
      this.sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.sunLight);
  }

  private setupSky(): void {
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTopColor: { value: new THREE.Color(0x1b476e) },
        uHorizonColor: { value: new THREE.Color(0x88adc4) },
        uSunDir: { value: new THREE.Vector3(0.3, 0.5, -0.7).normalize() },
        uSunColor: { value: new THREE.Color(0xffe5b8) },
        uTime: { value: 0 },
        uNight: { value: 0 },
        uAnomaly: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform float uTime;
        uniform float uNight;
        uniform float uAnomaly;
        varying vec3 vWorldPos;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y, 0.0, 1.0);
          vec3 col = mix(uHorizonColor, uTopColor, pow(h, 0.52));

          float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
          col += uSunColor * pow(sunDot, 18.0) * 0.42;
          col += uSunColor * smoothstep(0.996, 0.9992, sunDot) * 1.25;

          if (uNight > 0.05 && h > 0.08) {
            vec2 starUv = floor(dir.xz / (dir.y + 0.35) * 90.0);
            float s = hash(starUv);
            if (s > 0.992) {
              float tw = 0.6 + 0.4 * sin(uTime * 2.2 + s * 55.0);
              col += vec3(0.8, 0.9, 1.0) * tw * uNight * smoothstep(0.08, 0.35, h);
            }
          }

          if (uAnomaly > 0.08) {
            float wave = sin(dir.x * 5.5 + uTime * 0.5) * cos(dir.z * 4.5 - uTime * 0.4);
            float band = smoothstep(0.08, 0.45, h) * (1.0 - smoothstep(0.45, 0.88, h));
            col += vec3(0.08, 0.62, 0.52) * max(wave, 0.0) * band * uAnomaly * 0.55;
          }

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.skyMesh = new THREE.Mesh(new THREE.SphereGeometry(360, 24, 16), this.skyMat);
    this.skyMesh.visible = !this.isPhotoMode;
    this.scene.add(this.skyMesh);
  }

  private setupWater(loc: LocationDef): void {
    const waterGeo = new THREE.PlaneGeometry(240, 140, 140, 90);
    waterGeo.rotateX(-Math.PI / 2);

    const photoBounds = getPhotoVisualBounds(loc);

    this.waterMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      uniforms: {
        uTime: { value: 0 },
        uPhotoOverlay: { value: this.isPhotoMode ? 1.0 : 0.0 },
        uPhotoNearZ: { value: -(photoBounds.near - 0.6) },
        uPhotoFarZ: { value: -(photoBounds.far + 1.0) },
        uCurrentSpeed: { value: loc.currentSpeed },
        uSunDir: { value: new THREE.Vector3(0.3, 0.5, -0.7).normalize() },
        uSunColor: { value: new THREE.Color(0xffe5b8) },
        uSkyHorizon: { value: new THREE.Color(0x88adc4) },
        uDeepColor: { value: new THREE.Color(loc.waterColorDeep) },
        uShallowColor: { value: new THREE.Color(loc.waterColorShallow) },
        uFogColor: { value: new THREE.Color(loc.fogColor) },
        uFogDensity: { value: 0.011 },
        uGlowColor: { value: new THREE.Color(loc.glowColor) },
        uAnomalyGlow: {
          value: loc.waterType === 'anomaly_lake' ? 0.85 : loc.waterType === 'swamp' ? 0.35 : 0.05,
        },
        uBobberPos: { value: new THREE.Vector2(0, -16) },
        uRippleAge: { value: 10.0 },
        uRippleStrength: { value: 0.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uCurrentSpeed;
        uniform float uPhotoOverlay;
        varying vec3 vWorldPos;

        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          float flow = uTime * (0.85 + uCurrentSpeed * 1.9);
          float h = sin(wp.x * 0.35 + flow) * 0.045 + cos(wp.z * 0.48 - uTime * 1.4) * 0.032;
          h *= (1.0 - uPhotoOverlay * 0.78);
          wp.y += h;
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPhotoOverlay;
        uniform float uPhotoNearZ;
        uniform float uPhotoFarZ;
        uniform float uCurrentSpeed;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform vec3 uSkyHorizon;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uFogColor;
        uniform float uFogDensity;
        uniform vec3 uGlowColor;
        uniform float uAnomalyGlow;
        uniform vec2 uBobberPos;
        uniform float uRippleAge;
        uniform float uRippleStrength;

        varying vec3 vWorldPos;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        float waterSurfaceH(vec2 p) {
          float flow = uTime * (0.9 + uCurrentSpeed * 2.2);
          float w1 = sin(p.x * 0.85 + flow) * 0.04;
          float w2 = cos(p.y * 1.15 - uTime * 1.6) * 0.03;
          float n = noise(p * 1.4 + vec2(flow * 0.35, -uTime * 0.25)) * 0.05;

          // Concentric bobber splash ripple
          float bd = length(p - uBobberPos);
          float rFront = uRippleAge * 4.2;
          float ring = exp(-abs(bd - rFront) * 2.2) * exp(-uRippleAge * 0.9) * sin((bd - rFront) * 8.0) * 0.055 * uRippleStrength;
          return w1 + w2 + n + ring;
        }

        void main() {
          float eps = 0.18;
          float hc = waterSurfaceH(vWorldPos.xz);
          float hx = waterSurfaceH(vWorldPos.xz + vec2(eps, 0.0));
          float hz = waterSurfaceH(vWorldPos.xz + vec2(0.0, eps));
          vec3 n = normalize(vec3(hc - hx, eps * 0.95, hc - hz));

          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(viewDir, n), 0.0), 3.2);

          // Shallow bank transition near z > -6 or far bank z < -46
          float bankMask = smoothstep(-9.0, 1.0, vWorldPos.z) + smoothstep(-44.0, -54.0, vWorldPos.z);
          vec3 col = mix(uDeepColor, uShallowColor, clamp(bankMask, 0.0, 1.0));
          col = mix(col, uSkyHorizon, fresnel * 0.65);

          // Specular highlight
          vec3 halfV = normalize(normalize(uSunDir) + viewDir);
          float spec = pow(max(dot(n, halfV), 0.0), 86.0);
          col += uSunColor * spec * 1.2;

          // Splash ring highlight around bobber
          float bd = length(vWorldPos.xz - uBobberPos);
          float rFront = uRippleAge * 4.2;
          float ringVis = exp(-abs(bd - rFront) * 2.8) * exp(-uRippleAge * 1.1) * uRippleStrength;
          float gentleWave = smoothstep(0.055, 0.11, abs(hc)) * 0.22;
          col += vec3(0.88, 0.94, 1.0) * ringVis * 0.65;

          // Anomalous luminescence in swamps & anomaly lakes
          float bioMask = 0.0;
          if (uAnomalyGlow > 0.04) {
            float bio = noise(vWorldPos.xz * 0.55 - uTime * 0.35) * noise(vWorldPos.xz * 1.2 + uTime * 0.25);
            bioMask = smoothstep(0.28, 0.62, bio) * uAnomalyGlow;
            col += uGlowColor * bioMask * 0.72;
          }

          if (uPhotoOverlay > 0.5) {
            float lakeMask = smoothstep(uPhotoNearZ, uPhotoNearZ - 2.0, vWorldPos.z) * (1.0 - smoothstep(uPhotoFarZ + 2.0, uPhotoFarZ - 2.0, vWorldPos.z));
            float overlayAlpha = clamp((ringVis * 0.8 + spec * 0.24 + gentleWave * 0.28 + bioMask * 0.18) * lakeMask, 0.0, 0.85);
            vec3 overlayCol = mix(vec3(0.75, 0.88, 0.96), uGlowColor, bioMask * 0.5) + uSunColor * spec * 0.4;
            gl_FragColor = vec4(overlayCol, overlayAlpha);
            return;
          }

          float camDist = length(cameraPosition - vWorldPos);
          float fogF = 1.0 - exp(-pow(camDist * uFogDensity, 2.0));
          col = mix(col, uFogColor, clamp(fogF, 0.0, 1.0));

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMat);
    this.waterMesh.position.set(0, 0, -45);
    this.waterMesh.receiveShadow = true;
    this.waterMesh.renderOrder = 1;
    this.scene.add(this.waterMesh);
  }

  private rebuildEnvironment(loc: LocationDef): void {
    if (this.envRig) {
      this.scene.remove(this.envRig.group);
    }
    this.envRig = buildShoreEnvironment(loc, this.maxAniso, this.isSoftwareGl);
    this.envRig.group.visible = !this.isPhotoMode;
    this.scene.add(this.envRig.group);
  }

  private rebuildRod(rodType: RodType, rodLevelIndex: number): void {
    if (this.rodRig) {
      this.scene.remove(this.rodRig.root);
    }
    this.rodRig = buildFishingRodRig(rodType, rodLevelIndex);
    this.rodRig.root.position.set(0.42, 1.58, 0.88);
    this.rodRig.root.rotation.set(0.26, -0.08, -0.05);
    this.scene.add(this.rodRig.root);
  }

  private rebuildBobber(loc: LocationDef, floatDef?: FloatDef): void {
    if (this.bobberRig) {
      this.scene.remove(this.bobberRig.group, this.bobberRig.rippleRing);
    }
    this.bobberRig = buildBobberRig(loc.radiationLevel >= 2, floatDef);
    this.bobberRig.group.visible = false;
    this.bobberRig.group.renderOrder = 2;
    this.bobberRig.rippleRing.visible = false;
    this.bobberRig.rippleRing.renderOrder = 2;
    this.scene.add(this.bobberRig.group, this.bobberRig.rippleRing);
  }

  private setupBobberAndLine(loc: LocationDef): void {
    this.rebuildBobber(loc, this.sync.floatDef);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.fishingLine = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.72,
      })
    );
    this.fishingLine.frustumCulled = false;
    this.fishingLine.visible = false;
    this.scene.add(this.fishingLine);

    // Interactive 3D water casting reticle
    this.aimReticleGroup = new THREE.Group();
    this.aimReticleOuter = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.54, 32),
      new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.aimReticleOuter.rotation.x = -Math.PI / 2;

    this.aimReticleInner = new THREE.Mesh(
      new THREE.CircleGeometry(0.14, 20),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.aimReticleInner.rotation.x = -Math.PI / 2;

    this.aimReticleGroup.add(this.aimReticleOuter, this.aimReticleInner);
    this.aimReticleGroup.renderOrder = 3;
    this.scene.add(this.aimReticleGroup);
  }

  private setupAmbientWildlife(): void {
    // Small dark silhouettes read naturally against the sky and stay inexpensive on mobile.
    const feather = new THREE.MeshStandardMaterial({ color: 0x202a2b, roughness: 0.92, side: THREE.DoubleSide });
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x303a38, roughness: 0.95 });
    for (let i = 0; i < 4; i++) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.105, 7, 5), bodyMat);
      body.scale.set(1.65, 0.72, 0.72);
      group.add(body);
      const wingGeo = new THREE.BufferGeometry();
      wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, -0.42,0.015,-0.13, -0.12,0.025,0.18], 3));
      wingGeo.computeVertexNormals();
      const leftWing = new THREE.Mesh(wingGeo, feather);
      const rightWing = new THREE.Mesh(wingGeo, feather);
      leftWing.position.set(0, 0.025, -0.035);
      rightWing.position.set(0, 0.025, 0.035);
      rightWing.rotation.y = Math.PI;
      group.add(leftWing, rightWing);
      group.scale.setScalar(0.75 + (i % 2) * 0.22);
      this.scene.add(group);
      this.ambientBirds.push({ group, leftWing, rightWing, phase: i * 1.7, speed: 0.48 + i * 0.055, radius: 8 + i * 1.2 });
    }

    // A natural-coloured fish briefly breaks the surface, then disappears with a small ring ripple.
    this.jumpingFish = new THREE.Group();
    const fishBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x87958a, roughness: 0.48, metalness: 0.08 })
    );
    fishBody.scale.set(1.75, 0.72, 0.62);
    this.jumpingFish.add(fishBody);
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.13, 0.28, 5),
      new THREE.MeshStandardMaterial({ color: 0x68796f, roughness: 0.62, side: THREE.DoubleSide })
    );
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -0.43;
    this.jumpingFish.add(tail);
    this.jumpingFish.visible = false;
    this.scene.add(this.jumpingFish);

    this.fishSplash = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.2, 28),
      new THREE.MeshBasicMaterial({ color: 0xc7d8d4, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false })
    );
    this.fishSplash.rotation.x = -Math.PI / 2;
    this.fishSplash.position.y = 0.075;
    this.fishSplash.visible = false;
    this.scene.add(this.fishSplash);
  }

  private updateAmbientWildlife(elapsed: number): void {
    for (const bird of this.ambientBirds) {
      const t = elapsed * bird.speed + bird.phase;
      bird.group.position.set(Math.sin(t * 0.42) * bird.radius, 6.4 + Math.sin(t * 1.15) * 0.48, -19 + Math.cos(t * 0.31) * 5);
      bird.group.rotation.y = Math.cos(t * 0.42) > 0 ? Math.PI : 0;
      const flap = Math.sin(t * 5.2) * 0.52;
      bird.leftWing.rotation.z = flap;
      bird.rightWing.rotation.z = -flap;
    }

    if (elapsed > this.nextFishJump && elapsed - this.fishJumpStart > 2.1) {
      this.fishJumpStart = elapsed;
      this.fishJumpX = (Math.random() - 0.5) * 8;
      this.fishJumpZ = -17 - Math.random() * 17;
      this.nextFishJump = elapsed + 11 + Math.random() * 17;
      this.jumpingFish.visible = true;
      this.fishSplash.visible = true;
      this.fishSplash.position.set(this.fishJumpX, 0.075, this.fishJumpZ);
    }

    const jumpAge = elapsed - this.fishJumpStart;
    if (jumpAge >= 0 && jumpAge < 1.05) {
      const progress = jumpAge / 1.05;
      const arc = Math.sin(progress * Math.PI);
      this.jumpingFish.position.set(this.fishJumpX, 0.12 + arc * 1.35, this.fishJumpZ);
      this.jumpingFish.rotation.z = -Math.cos(progress * Math.PI) * 0.42;
      this.jumpingFish.rotation.y = Math.sin(progress * Math.PI) * 0.18;
      this.jumpingFish.rotation.x = Math.sin(progress * Math.PI * 2) * 0.08;
      this.fishSplash.scale.setScalar(0.45 + progress * 1.9);
      (this.fishSplash.material as THREE.MeshBasicMaterial).opacity = progress > 0.72 ? (1 - progress) * 1.8 : 0.12;
    } else {
      this.jumpingFish.visible = false;
      if (jumpAge >= 1.05 && jumpAge < 2.0) {
        const ripple = (jumpAge - 1.05) / 0.95;
        this.fishSplash.scale.setScalar(1.2 + ripple * 2.2);
        (this.fishSplash.material as THREE.MeshBasicMaterial).opacity = (1 - ripple) * 0.38;
      } else {
        this.fishSplash.visible = false;
      }
    }
  }

  private setupWeatherParticles(): void {
    const count = 460;
    this.weatherPos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.weatherPos[i * 3] = (Math.random() - 0.5) * 48;
      this.weatherPos[i * 3 + 1] = 0.5 + Math.random() * 15;
      this.weatherPos[i * 3 + 2] = 2 - Math.random() * 52;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.weatherPos, 3));
    this.weatherParticles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xbae6fd,
        size: 0.14,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      })
    );
    this.weatherParticles.frustumCulled = false;
    this.scene.add(this.weatherParticles);
  }

  private updateAtmosphere(elapsed: number): void {
    const tod = this.sync.timeOfDay;
    const sunAngle = ((tod - 6) / 24) * Math.PI * 2;
    const sunH = Math.sin(sunAngle);
    const dayF = THREE.MathUtils.clamp((sunH + 0.2) / 0.75, 0, 1);
    const duskF = THREE.MathUtils.clamp(1 - Math.abs(sunH) * 3.6, 0, 1);
    const nightF = 1 - dayF;

    const loc = this.sync.location;
    const isRain = this.sync.weather === 'rain';
    const isFog = this.sync.weather === 'fog';
    const isSurge = this.sync.weather === 'anomaly_surge';

    const sunDirX = Math.cos(sunAngle) * 0.75;
    const sunDirY = Math.max(0.18, Math.abs(sunH) * 0.85);
    this.sunLight.position.set(sunDirX * 70, sunDirY * 80, -35);
    this.waterMat.uniforms.uSunDir.value.set(sunDirX, sunDirY, -0.55).normalize();
    this.skyMat.uniforms.uSunDir.value.set(sunDirX, sunH, -0.55).normalize();

    _cSun
      .setHex(0xfff1d6)
      .lerp(_cHor.setHex(0xf97316), duskF * 0.8)
      .lerp(_cHor.setHex(0x64748b), nightF);
    this.sunLight.color.copy(_cSun);
    this.sunLight.intensity =
      THREE.MathUtils.lerp(0.35, 1.9, dayF) * (isRain ? 0.65 : 1.0);
    this.waterMat.uniforms.uSunColor.value.copy(_cSun);
    this.skyMat.uniforms.uSunColor.value.copy(_cSun);

    _cTop.setHex(0x205480).lerp(_cHor.setHex(0x060b14), nightF);
    _cHor
      .setHex(0x8bb0c7)
      .lerp(_cFog.setHex(0xd46a43), duskF * 0.65)
      .lerp(_cFog.setHex(0x0c1724), nightF);
    _cFog
      .copy(_cHor)
      .lerp(_cSun.set(loc.fogColor), 0.52 + nightF * 0.35);

    this.skyMat.uniforms.uTopColor.value.copy(_cTop);
    this.skyMat.uniforms.uHorizonColor.value.copy(_cHor);
    this.skyMat.uniforms.uTime.value = elapsed;
    this.skyMat.uniforms.uNight.value = nightF;
    this.skyMat.uniforms.uAnomaly.value =
      loc.anomalyActivity / 100 + (isSurge ? 0.5 : 0);

    this.waterMat.uniforms.uTime.value = elapsed;
    this.waterMat.uniforms.uSkyHorizon.value.copy(_cHor);
    this.waterMat.uniforms.uDeepColor.value
      .set(loc.waterColorDeep)
      .lerp(_cTop.setHex(0x03080e), nightF * 0.55);
    this.waterMat.uniforms.uShallowColor.value
      .set(loc.waterColorShallow)
      .lerp(_cTop.setHex(0x081a1f), nightF * 0.5);
    this.waterMat.uniforms.uFogColor.value.copy(_cFog);

    const baseAnomalyGlow =
      loc.waterType === 'anomaly_lake' ? 0.85 : loc.waterType === 'swamp' ? 0.35 : 0.05;
    this.waterMat.uniforms.uAnomalyGlow.value = isSurge
      ? Math.max(baseAnomalyGlow, 0.58 + Math.sin(elapsed * 2.4) * 0.28)
      : baseAnomalyGlow;

    const fogDensity =
      0.0085 +
      nightF * 0.0045 +
      (isFog ? 0.017 : 0) +
      (isRain ? 0.006 : 0) +
      (loc.waterType === 'swamp' ? 0.006 : 0);

    this.waterMat.uniforms.uFogDensity.value = fogDensity;
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(_cFog);
      this.scene.fog.density = fogDensity;
    }

    this.hemiLight.intensity = THREE.MathUtils.lerp(0.32, 0.92, dayF) * (isRain ? 0.8 : 1.0);
    this.envRig.lanternLight.intensity = THREE.MathUtils.lerp(6, 28, nightF);

    // Subtle reed wind sway (stronger in rain / anomaly surge)
    const windMult = isRain ? 2.1 : isSurge ? 1.65 : 1.0;
    this.envRig.reedMesh.rotation.z = Math.sin(elapsed * 1.4 * windMult) * 0.025 * windMult;
  }

  private updateRodBobberAndWeather(dt: number, elapsed: number): void {
    const { phase, chargeRatio, tensionRatio, isReeling, fishDistanceM, aimYaw, fishLateralOffset, location } =
      this.sync;

    this.smoothYaw = THREE.MathUtils.damp(this.smoothYaw, aimYaw, 6, dt);
    this.smoothTension = THREE.MathUtils.damp(
      this.smoothTension,
      phase === 'FIGHTING' || phase === 'SNAGGED' ? tensionRatio : 0,
      8,
      dt
    );
    this.smoothFishX = THREE.MathUtils.damp(
      this.smoothFishX,
      phase === 'FIGHTING' ? fishLateralOffset : 0,
      4.5,
      dt
    );

    // Camera subtle look + slight lean forward during fight
    // In Photo Mode keep camera locked to background horizon so water raycasts match the photo pixel-for-pixel
    const camZoomZ = this.isPhotoMode ? 1.35 : phase === 'FIGHTING' || phase === 'SNAGGED' ? 0.98 : 1.35;
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, camZoomZ, 4, dt);
    const lookX = this.isPhotoMode
      ? 0
      : Math.sin(this.smoothYaw) * 18 + this.smoothFishX * 2.5;
    const lookY = this.isPhotoMode ? -0.35 : phase === 'FIGHTING' ? 0.85 : 1.25;
    this.camera.lookAt(lookX, lookY, -18);

    // Update 3D water aim reticle when in IDLE or CHARGING
    const showReticle = phase === 'IDLE' || phase === 'CHARGING';
    this.aimReticleGroup.visible = showReticle;
    if (showReticle) {
      const aimDist = this.toVisualWaterDist(this.sync.castTargetDistanceM, this.sync.maxCastDistanceM);
      const aimYawClamped = THREE.MathUtils.clamp(aimYaw, -0.84, 0.84);
      const rx = Math.sin(aimYawClamped) * aimDist;
      const rz = -Math.cos(aimYawClamped) * aimDist;
      this.aimReticleGroup.position.set(rx, 0.08, rz);
      const pulse = phase === 'CHARGING' ? 1.15 + Math.sin(elapsed * 10) * 0.14 : 1.0 + Math.sin(elapsed * 3.2) * 0.08;
      this.aimReticleOuter.scale.set(pulse, pulse, 1);
      (this.aimReticleOuter.material as THREE.MeshBasicMaterial).color.setHex(
        this.sync.aimOutOfBounds ? 0xf43f5e : phase === 'CHARGING' ? 0xf97316 : 0xfbbf24
      );
      (this.aimReticleInner.material as THREE.MeshBasicMaterial).color.setHex(
        this.sync.aimOutOfBounds ? 0xfb7185 : 0x34d399
      );
    }

    // Rod pose & physical curvature
    let basePitch = 0.28;
    let baseYaw = -0.14 - this.smoothYaw * 0.65;
    let rodPosZ = 0.88;

    if (phase === 'CHARGING') {
      basePitch = 0.28 + chargeRatio * 0.92; // pull back overhead
      rodPosZ = 0.88 + chargeRatio * 0.16;
    } else if (phase === 'CASTING') {
      basePitch = 0.08; // snap forward
    } else if (phase === 'FIGHTING' || phase === 'SNAGGED') {
      basePitch = 0.48 + this.smoothTension * 0.28;
      baseYaw = -this.smoothYaw * 0.65 - this.smoothFishX * 0.22;
    }

    const breathY = Math.sin(elapsed * 1.9) * 0.012;
    this.rodRig.root.position.set(0.42, 1.58 + breathY, rodPosZ);
    this.rodRig.root.rotation.x = THREE.MathUtils.damp(this.rodRig.root.rotation.x, basePitch, 10, dt);
    this.rodRig.root.rotation.y = THREE.MathUtils.damp(this.rodRig.root.rotation.y, baseYaw, 10, dt);

    // Progressive bend across rod segments
    const bendForce =
      phase === 'FIGHTING' || phase === 'SNAGGED'
        ? 0.08 + this.smoothTension * 0.28
        : phase === 'CHARGING'
          ? chargeRatio * 0.07
          : 0.015;
    this.rodRig.segments.forEach((seg, idx) => {
      const targetSegBend = -bendForce * (0.45 + idx * 0.22);
      seg.rotation.x = THREE.MathUtils.damp(seg.rotation.x, targetSegBend, 10, dt);
      seg.rotation.y = THREE.MathUtils.damp(
        seg.rotation.y,
        phase === 'FIGHTING' ? this.smoothFishX * 0.03 * (idx + 1) : 0,
        8,
        dt
      );
    });

    if (isReeling && (phase === 'FIGHTING' || phase === 'WAITING')) {
      this.rodRig.reelHandle.rotation.z += dt * 16;
      this.rodRig.spoolMesh.rotation.y += dt * 12;
    }

    // Bobber visibility & physics
    const showLine =
      phase === 'CASTING' ||
      phase === 'WAITING' ||
      phase === 'NIBBLE' ||
      phase === 'BITE' ||
      phase === 'FIGHTING' ||
      phase === 'SNAGGED';

    this.bobberRig.group.visible = showLine;
    this.bobberRig.rippleRing.visible = showLine && phase !== 'CASTING';
    this.fishingLine.visible = showLine;

    // Electronic & Night-glow float tip signaling
    const tipMat = this.bobberRig.tipMesh.material as THREE.MeshStandardMaterial;
    if (this.bobberRig.isElectronic) {
      if (phase === 'BITE' || phase === 'SNAGGED') {
        tipMat.emissive.setHex(0xf43f5e);
        tipMat.emissiveIntensity = 2.6 + Math.sin(elapsed * 22) * 1.1;
      } else if (phase === 'NIBBLE') {
        tipMat.emissive.setHex(0xfbbf24);
        tipMat.emissiveIntensity = 2.0 + Math.sin(elapsed * 14) * 0.9;
      } else {
        tipMat.emissive.setHex(this.bobberRig.baseTipHex);
        tipMat.emissiveIntensity = 1.6;
      }
    }

    if (phase === 'CASTING') {
      this.castFlightT = Math.min(1, this.castFlightT + dt * 2.1);
      const t = this.castFlightT;
      this.bobberWorldPos.lerpVectors(this.castStartPos, this.castEndPos, t);
      this.bobberWorldPos.y += Math.sin(t * Math.PI) * 3.6;
      this.bobberRig.group.position.copy(this.bobberWorldPos);
      this.bobberRig.group.rotation.z = Math.sin(t * 14) * 0.3;
    } else if (showLine) {
      const rawDist =
        phase === 'FIGHTING' || phase === 'SNAGGED'
          ? fishDistanceM
          : this.sync.castTargetDistanceM;
      const dist = this.toVisualWaterDist(rawDist, this.sync.maxCastDistanceM);
      const yaw = THREE.MathUtils.clamp(this.smoothYaw, -0.84, 0.84);
      let lat = phase === 'FIGHTING' ? this.smoothFishX * (this.isPhotoMode ? 2.4 : 4.2) : 0;
      let bx = Math.sin(yaw) * dist + lat;
      let bz = -Math.cos(yaw) * dist;
      if (phase === 'FIGHTING' && Math.abs(lat) > 0.05) {
        const effYaw = Math.atan2(bx, -bz);
        const effDistM = this.fromVisualWaterDist(Math.hypot(bx, bz), this.sync.maxCastDistanceM);
        const vp = {
          width: this.container.clientWidth || window.innerWidth,
          height: this.container.clientHeight || window.innerHeight,
        };
        if (!isWaterSpotValid(location, effYaw, effDistM, this.sync.maxCastDistanceM, vp)) {
          const safe = clampCastToWaterBounds(location, effYaw, effDistM, this.sync.maxCastDistanceM, vp);
          const safeVDist = this.toVisualWaterDist(safe.distM, this.sync.maxCastDistanceM);
          bx = Math.sin(safe.yaw) * safeVDist;
          bz = -Math.cos(safe.yaw) * safeVDist;
          lat = 0;
        }
      }

      let dipY = Math.sin(elapsed * 2.8) * 0.028;
      if (phase === 'NIBBLE') {
        dipY = -0.05 + Math.sin(elapsed * 18) * 0.045;
        this.bobberRig.group.rotation.z = Math.sin(elapsed * 16) * 0.25;
      } else if (phase === 'BITE') {
        dipY = -0.22 - Math.abs(Math.sin(elapsed * 14)) * 0.08;
        this.bobberRig.group.rotation.z = 0.45;
      } else if (phase === 'SNAGGED') {
        dipY = -0.18 + Math.sin(elapsed * 28) * 0.015;
        this.bobberRig.group.rotation.z = 0.62 + Math.sin(elapsed * 26) * 0.08;
      } else if (phase === 'FIGHTING') {
        dipY = -0.14 + Math.sin(elapsed * 10) * 0.08;
        this.bobberRig.group.rotation.z = this.smoothFishX * 0.6;
      } else {
        this.bobberRig.group.rotation.z = Math.sin(elapsed * 1.8) * 0.06;
      }

      this.bobberWorldPos.set(bx, 0.06 + dipY, bz);
      this.bobberRig.group.position.copy(this.bobberWorldPos);
      this.bobberRig.rippleRing.position.set(bx, 0.09, bz);
      const rPulse =
        1 +
        ((elapsed * 1.2) % 1.0) *
          (phase === 'BITE' || phase === 'FIGHTING' || phase === 'SNAGGED' ? 2.4 : 0.9);
      this.bobberRig.rippleRing.scale.set(rPulse, rPulse, 1);

      this.waterMat.uniforms.uBobberPos.value.set(bx, bz);
      this.waterMat.uniforms.uRippleAge.value = elapsed - this.rippleTime;
      this.waterMat.uniforms.uRippleStrength.value =
        phase === 'FIGHTING' ? Math.max(this.rippleStrength, 0.75) : this.rippleStrength;

      // Live 3D hooked creature splashing just beneath bobber while fighting near shore
      if (this.hookedFaunaRig) {
        this.hookedFaunaRig.group.visible = phase === 'FIGHTING';
        if (phase === 'FIGHTING') {
          this.hookedFaunaRig.group.position.set(bx, 0.01 + Math.sin(elapsed * 7) * 0.06, bz - 0.12);
          this.hookedFaunaRig.group.rotation.y = Math.PI * 0.5 - this.smoothFishX * 0.9;
          animateFauna3DMesh(this.hookedFaunaRig, elapsed, 1.3);
        }
      }
    } else if (this.hookedFaunaRig) {
      this.hookedFaunaRig.group.visible = false;
    }

    // Update 3D catenary line from rod tip to bobber
    if (showLine) {
      this.rodRig.tipMarker.getWorldPosition(_v1);
      _v2.copy(this.bobberWorldPos);
      const slack = phase === 'FIGHTING' || isReeling ? 0.04 : 0.38;
      for (let i = 0; i < 12; i++) {
        const t = i / 11;
        const x = THREE.MathUtils.lerp(_v1.x, _v2.x, t);
        const z = THREE.MathUtils.lerp(_v1.z, _v2.z, t);
        const sag = Math.sin(t * Math.PI) * slack;
        const y = Math.max(0.03, THREE.MathUtils.lerp(_v1.y, _v2.y + 0.18, t) - sag);
        this.linePositions[i * 3] = x;
        this.linePositions[i * 3 + 1] = y;
        this.linePositions[i * 3 + 2] = z;
      }
      const attr = this.fishingLine.geometry.attributes.position as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }

    // Update Weather / Anomaly Spores in 3D space
    const isRain = this.sync.weather === 'rain';
    const isFog = this.sync.weather === 'fog';
    const isSurge = this.sync.weather === 'anomaly_surge';
    const isAnomaly =
      isSurge ||
      location.radiationLevel >= 1 ||
      this.sync.timeOfDay >= 19 ||
      this.sync.timeOfDay <= 5.5;
    const pMat = this.weatherParticles.material as THREE.PointsMaterial;
    this.weatherParticles.visible = isRain || isAnomaly || isFog;

    if (this.weatherParticles.visible) {
      pMat.color.setHex(
        isRain
          ? 0xcbd5e1
          : isFog
            ? 0xd1fae5
            : isSurge || location.radiationLevel >= 2
              ? 0x22d3ee
              : 0xa3e635
      );
      pMat.size = isRain ? 0.13 : isSurge ? 0.2 : isFog ? 0.22 : 0.15;
      pMat.opacity = isSurge ? 0.8 : isFog ? 0.28 : 0.62;
      const pAttr = this.weatherParticles.geometry.attributes.position as THREE.BufferAttribute;
      const count = this.weatherPos.length / 3;
      for (let i = 0; i < count; i++) {
        if (isRain) {
          this.weatherPos[i * 3 + 1] -= dt * 22;
          this.weatherPos[i * 3] -= dt * 3.1;
          if (this.weatherPos[i * 3 + 1] < 0) {
            this.weatherPos[i * 3 + 1] = 15;
            this.weatherPos[i * 3] = (Math.random() - 0.5) * 48;
          }
        } else if (isFog) {
          this.weatherPos[i * 3] += dt * (0.8 + (i % 3) * 0.25);
          this.weatherPos[i * 3 + 1] += Math.sin(elapsed * 0.8 + i) * dt * 0.18;
          if (this.weatherPos[i * 3] > 24) this.weatherPos[i * 3] = -24;
        } else {
          const speedBoost = isSurge ? 1.85 : 1.0;
          this.weatherPos[i * 3 + 1] +=
            (isSurge ? 0.55 : 0.1) * dt + Math.sin(elapsed * 1.8 + i) * dt * 0.45 * speedBoost;
          this.weatherPos[i * 3] += Math.cos(elapsed * 1.1 + i) * dt * 0.4 * speedBoost;
          if (this.weatherPos[i * 3 + 1] > 15) this.weatherPos[i * 3 + 1] = 0.5;
        }
      }
      pAttr.needsUpdate = true;
    }
  }

  private tick = (): void => {
    if (this.disposed || this.contextLost) return;
    const dt = Math.min(this.clock.getDelta(), 0.08);
    const elapsed = this.clock.getElapsedTime();

    this.updateAtmosphere(elapsed);
    this.updateRodBobberAndWeather(dt, elapsed);
    this.updateAmbientWildlife(elapsed);

    this.renderer.render(this.scene, this.camera);
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private onResize = (): void => {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.contextLost = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
  };

  private onContextRestored = (): void => {
    this.contextLost = false;
    this.clock.start();
    this.tick();
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
