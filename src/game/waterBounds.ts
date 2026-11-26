import { LocationDef } from './types';

export interface ViewportDims {
  width: number;
  height: number;
}

interface PhotoWaterSpec {
  natW: number;
  natH: number;
  visualNearDist: number;
  visualFarDist: number;
  minWorldZ: number;
  /** Normalized photo coordinates [u, v] in 0..1 tracing the safe water perimeter */
  waterPolyUV: ReadonlyArray<readonly [number, number]>;
}

const PHOTO_WATER_SPECS: Record<string, PhotoWaterSpec> = {
  tomashgorod: {
    natW: 1200,
    natH: 1600,
    visualNearDist: 5.4,
    visualFarDist: 33.5,
    minWorldZ: -4.2,
    waterPolyUV: [
      [0.445, 0.442],
      [0.665, 0.442],
      [0.815, 0.432],
      [0.985, 0.432],
      [0.985, 0.665],
      [0.500, 0.642],
      [0.015, 0.612],
      [0.015, 0.592],
      [0.160, 0.565],
      [0.300, 0.532],
      [0.395, 0.512],
    ],
  },
  rokitne: {
    natW: 2752,
    natH: 1536,
    visualNearDist: 3.8,
    visualFarDist: 16.0,
    minWorldZ: -2.4,
    waterPolyUV: [
      [0.445, 0.490],
      [0.538, 0.490],
      [0.565, 0.520],
      [0.665, 0.538],
      [0.785, 0.558],
      [0.920, 0.588],
      [0.910, 0.628],
      [0.780, 0.652],
      [0.640, 0.680],
      [0.675, 0.722],
      [0.575, 0.768],
      [0.480, 0.822],
      [0.420, 0.900],
      [0.145, 0.900],
      [0.180, 0.765],
      [0.255, 0.642],
      [0.388, 0.592],
      [0.428, 0.562],
      [0.402, 0.526],
    ],
  },
};

export function getViewportDims(): ViewportDims {
  if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 1280, height: 720 };
}

export function getProceduralFarSafeZ(loc: LocationDef): number {
  if (loc.waterType === 'river') return 47.0;
  if (loc.waterType === 'swamp') return 53.0;
  return 67.0;
}

export function getPhotoVisualBounds(loc: LocationDef): { near: number; far: number; minWorldZ: number } {
  const spec = PHOTO_WATER_SPECS[loc.id];
  if (spec) {
    return { near: spec.visualNearDist, far: spec.visualFarDist, minWorldZ: spec.minWorldZ };
  }
  return { near: 6.0, far: 32.0, minWorldZ: -4.0 };
}

export function toVisualWaterDist(loc: LocationDef, distM: number, maxCastM: number): number {
  const safeMax = Math.max(12, maxCastM);
  if (loc.backdropPhotoUrl) {
    const { near, far } = getPhotoVisualBounds(loc);
    const frac = Math.max(0, Math.min(1, (distM - 1) / Math.max(1, safeMax - 1)));
    return near + frac * (far - near);
  }
  const farSafe = getProceduralFarSafeZ(loc);
  const frac = Math.max(0, Math.min(1, (distM - 1) / Math.max(1, safeMax - 1)));
  return 4.5 + frac * (farSafe - 4.5);
}

export function fromVisualWaterDist(loc: LocationDef, visualDist: number, maxCastM: number): number {
  const safeMax = Math.max(12, maxCastM);
  if (loc.backdropPhotoUrl) {
    const { near, far } = getPhotoVisualBounds(loc);
    const frac = Math.max(0, Math.min(1, (visualDist - near) / Math.max(1, far - near)));
    return Number((1 + frac * Math.max(1, safeMax - 1)).toFixed(1));
  }
  const farSafe = getProceduralFarSafeZ(loc);
  const frac = Math.max(0, Math.min(1, (visualDist - 4.5) / Math.max(1, farSafe - 4.5)));
  return Number((1 + frac * Math.max(1, safeMax - 1)).toFixed(1));
}

function pointInPolygon(x: number, y: number, poly: ReadonlyArray<readonly [number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function screenToPhotoUV(
  spec: PhotoWaterSpec,
  screenX: number,
  screenY: number,
  vp: ViewportDims
): [number, number] {
  const vw = Math.max(1, vp.width);
  const vh = Math.max(1, vp.height);
  const imgAspect = spec.natW / spec.natH;
  const viewAspect = vw / vh;
  const scale = viewAspect > imgAspect ? vw / spec.natW : vh / spec.natH;
  const renderedW = spec.natW * scale;
  const renderedH = spec.natH * scale;
  const offsetX = (vw - renderedW) * 0.5;
  const offsetY = (vh - renderedH) * 0.5;
  return [(screenX - offsetX) / renderedW, (screenY - offsetY) / renderedH];
}

export function isScreenPointInPhotoWater(
  loc: LocationDef,
  localX: number,
  localY: number,
  vp?: ViewportDims
): boolean {
  const spec = PHOTO_WATER_SPECS[loc.id];
  if (!spec) return true;
  const dims = vp ?? getViewportDims();
  if (localX < 0 || localY < 0 || localX > dims.width || localY > dims.height) {
    return false;
  }
  const [u, v] = screenToPhotoUV(spec, localX, localY, dims);
  return pointInPolygon(u, v, spec.waterPolyUV);
}

// Camera projection matching ShoreFishingScene (FOV=56, pos=(0,2.35,1.35), photo lookAt=(0,-0.35,-18))
const PHOTO_CAM_POS = [0, 2.35, 1.35] as const;
const PHOTO_CAM_FWD = (() => {
  const dx = 0;
  const dy = -0.35 - 2.35;
  const dz = -18 - 1.35;
  const len = Math.hypot(dx, dy, dz);
  return [dx / len, dy / len, dz / len] as const;
})();
const PHOTO_CAM_UP = (() => {
  // right is (1, 0, 0), up = right x fwd
  return [0, PHOTO_CAM_FWD[2] * -1, PHOTO_CAM_FWD[1]] as const;
})();
const TAN_HALF_FOV = Math.tan((56 * Math.PI) / 180 / 2);

function projectPhotoWorldToScreen(
  wx: number,
  wy: number,
  wz: number,
  vp: ViewportDims
): { x: number; y: number; inView: boolean } {
  const dx = wx - PHOTO_CAM_POS[0];
  const dy = wy - PHOTO_CAM_POS[1];
  const dz = wz - PHOTO_CAM_POS[2];
  const cz = dx * PHOTO_CAM_FWD[0] + dy * PHOTO_CAM_FWD[1] + dz * PHOTO_CAM_FWD[2];
  if (cz <= 0.4) return { x: -100, y: -100, inView: false };
  const cx = dx;
  const cy = dx * PHOTO_CAM_UP[0] + dy * PHOTO_CAM_UP[1] + dz * PHOTO_CAM_UP[2];
  const aspect = Math.max(0.3, vp.width / Math.max(1, vp.height));
  const ndcX = cx / (cz * TAN_HALF_FOV * aspect);
  const ndcY = cy / (cz * TAN_HALF_FOV);
  const inView = ndcX >= -0.98 && ndcX <= 0.98 && ndcY >= -0.98 && ndcY <= 0.98;
  return {
    x: (ndcX + 1) * 0.5 * vp.width,
    y: (1 - ndcY) * 0.5 * vp.height,
    inView,
  };
}

function isProceduralWorldInWater(loc: LocationDef, x: number, z: number): boolean {
  const farSafe = getProceduralFarSafeZ(loc);
  // Far bank / reeds boundary
  if (z < -farSafe) return false;

  // Smooth near-shore & pier/reeds boundary (z = -3.5 off pier center, ramping smoothly to -4.6 along side reeds)
  const sideRamp = Math.min(1.1, Math.max(0, (Math.abs(x) - 2.5) * 0.55));
  if (z > -(3.5 + sideRamp)) return false;

  // Side bank forest / extreme off-camera lateral limits
  if (Math.abs(x) > 52) return false;

  // Flooded concrete bridge pilings in Snovydovychi
  if (loc.id === 'snovydovychi') {
    const pillars: ReadonlyArray<readonly [number, number]> = [
      [-16, -28],
      [-4, -31],
      [12, -34],
    ];
    for (const [px, pz] of pillars) {
      if (Math.hypot(x - px, z - pz) < 2.2) return false;
    }
  }

  return true;
}

export function isWaterSpotValid(
  loc: LocationDef,
  yaw: number,
  distM: number,
  maxCastM: number,
  vp?: ViewportDims
): boolean {
  if (loc.isBunker || maxCastM <= 0) return false;
  if (Math.abs(yaw) > 0.83 || distM < 1 || distM > maxCastM + 0.05) return false;

  const vDist = toVisualWaterDist(loc, distM, maxCastM);
  const wx = Math.sin(yaw) * vDist;
  const wz = -Math.cos(yaw) * vDist;

  if (loc.backdropPhotoUrl) {
    const spec = PHOTO_WATER_SPECS[loc.id];
    if (!spec) return true;
    if (wz > spec.minWorldZ) return false;
    const dims = vp ?? getViewportDims();
    const scr = projectPhotoWorldToScreen(wx, 0.08, wz, dims);
    if (!scr.inView) return false;
    const [u, v] = screenToPhotoUV(spec, scr.x, scr.y, dims);
    return pointInPolygon(u, v, spec.waterPolyUV);
  }

  return isProceduralWorldInWater(loc, wx, wz);
}

export function getWaterDistBoundsForYaw(
  loc: LocationDef,
  yaw: number,
  maxCastM: number,
  vp?: ViewportDims
): { minDistM: number; maxDistM: number; hasWater: boolean } {
  const safeYaw = Math.max(-0.82, Math.min(0.82, yaw));
  const dims = vp ?? getViewportDims();
  const steps = 40;
  let minValid: number | null = null;
  let maxValid: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const d = 1 + (i / steps) * Math.max(1, maxCastM - 1);
    if (isWaterSpotValid(loc, safeYaw, d, maxCastM, dims)) {
      if (minValid === null) minValid = d;
      maxValid = d;
    }
  }

  if (minValid === null || maxValid === null) {
    return { minDistM: 1, maxDistM: Math.min(maxCastM, 16), hasWater: false };
  }

  return {
    minDistM: Number((Math.ceil(minValid * 10) / 10).toFixed(1)),
    maxDistM: Number((Math.floor(maxValid * 10) / 10).toFixed(1)),
    hasWater: true,
  };
}

export function clampCastToWaterBounds(
  loc: LocationDef,
  yaw: number,
  distM: number,
  maxCastM: number,
  vp?: ViewportDims
): { yaw: number; distM: number; clamped: boolean } {
  const dims = vp ?? getViewportDims();
  const cYaw = Number(Math.max(-0.82, Math.min(0.82, yaw)).toFixed(3));
  const cDist = Number(Math.max(1, Math.min(maxCastM, distM)).toFixed(1));

  if (isWaterSpotValid(loc, cYaw, cDist, maxCastM, dims)) {
    return {
      yaw: cYaw,
      distM: cDist,
      clamped: Math.abs(cYaw - yaw) > 0.005 || Math.abs(cDist - distM) > 0.15,
    };
  }

  // First try clamping distance along the exact requested yaw
  const sameYawBounds = getWaterDistBoundsForYaw(loc, cYaw, maxCastM, dims);
  if (sameYawBounds.hasWater) {
    const clampedD = Number(
      Math.max(sameYawBounds.minDistM, Math.min(sameYawBounds.maxDistM, cDist)).toFixed(1)
    );
    if (isWaterSpotValid(loc, cYaw, clampedD, maxCastM, dims)) {
      return { yaw: cYaw, distM: clampedD, clamped: true };
    }
    // If an internal obstacle (e.g. bridge piling) blocks clampedD, probe nearest valid distance along same yaw
    for (let offset = 1; offset <= 12; offset++) {
      const dPlus = Number(Math.min(sameYawBounds.maxDistM, clampedD + offset * 0.8).toFixed(1));
      if (isWaterSpotValid(loc, cYaw, dPlus, maxCastM, dims)) {
        return { yaw: cYaw, distM: dPlus, clamped: true };
      }
      const dMinus = Number(Math.max(sameYawBounds.minDistM, clampedD - offset * 0.8).toFixed(1));
      if (isWaterSpotValid(loc, cYaw, dMinus, maxCastM, dims)) {
        return { yaw: cYaw, distM: dMinus, clamped: true };
      }
    }
  }

  // Otherwise step yaw inward toward center water channel (yaw=0)
  for (let step = 1; step <= 20; step++) {
    const t = step / 20;
    const testYaw = Number((cYaw * (1 - t)).toFixed(3));
    const bounds = getWaterDistBoundsForYaw(loc, testYaw, maxCastM, dims);
    if (bounds.hasWater) {
      const clampedD = Number(
        Math.max(bounds.minDistM, Math.min(bounds.maxDistM, cDist)).toFixed(1)
      );
      if (isWaterSpotValid(loc, testYaw, clampedD, maxCastM, dims)) {
        return { yaw: testYaw, distM: clampedD, clamped: true };
      }
    }
  }

  // Guaranteed safe center fallback
  return {
    yaw: 0,
    distM: Number(Math.max(1, Math.min(maxCastM, 12)).toFixed(1)),
    clamped: true,
  };
}
