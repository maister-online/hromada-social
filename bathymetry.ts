import { FISH_MAP } from './data';
import { LocationDef, WeatherType } from './types';

export type FishSizeClass = 'small' | 'medium' | 'large' | 'giant';

export interface SonarFishBlip {
  id: string;
  distM: number;
  depthM: number;
  bottomDepthM: number;
  sizeClass: FishSizeClass;
  estWeightKg: number;
  isMutant: boolean;
  label: string;
}

export interface WaterSpotInfo {
  depthM: number;
  depthNorm: number; // 0..1 within location.depthRangeM
  zoneLabel: string;
  bottomLabel: string;
}

export interface DepthProfilePoint {
  distM: number;
  depthM: number;
}

export interface WaterMapCell {
  yaw: number;
  distM: number;
  depthM: number;
  depthNorm: number;
  hasFishCluster: boolean;
  clusterSize: FishSizeClass;
}

function locHash(locId: string): number {
  let h = 2166136261;
  for (let i = 0; i < locId.length; i++) {
    h ^= locId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/**
 * Deterministic 2D bathymetry field across the entire water body (yaw -0.85..+0.85, dist 4..maxCastM).
 * Creates realistic shoals, drop-offs (бровки), deep pits (ями), and side coves per location.
 */
export function getWaterSpotInfo(
  loc: LocationDef,
  yaw: number,
  distM: number,
  maxCastM: number
): WaterSpotInfo {
  const [dMin, dMax] = loc.depthRangeM;
  const seed = locHash(loc.id) * Math.PI * 2;
  const distNorm = Math.max(0, Math.min(1, (distM - 3) / Math.max(8, maxCastM - 3)));
  const yawNorm = Math.max(-1, Math.min(1, yaw / 0.85));

  // Base longitudinal profile: near-bank shelf -> drop-off -> deep channel/pit -> slight rise near far shore
  let profileFactor: number;
  if (loc.waterType === 'river') {
    // Channel thalweg shifts slightly left/right depending on location
    const channelCenter = Math.sin(seed * 1.7) * 0.25;
    const bankSlope = Math.sin(Math.min(1, distNorm * 1.15) * Math.PI * 0.86);
    const channelBoost = Math.exp(-Math.pow((yawNorm - channelCenter) * 1.5, 2)) * 0.28;
    profileFactor = bankSlope * 0.72 + channelBoost;
  } else if (loc.waterType === 'swamp') {
    // Undulating peat pits and submerged hummocks
    const base = Math.pow(Math.sin(distNorm * Math.PI * 0.92), 0.75) * 0.65;
    const peatPit =
      Math.max(
        0,
        Math.sin(distNorm * 7.2 + yawNorm * 3.1 + seed) * 0.22 +
          Math.cos(yawNorm * 4.5 - distNorm * 3.8 + seed) * 0.14
      );
    profileFactor = base + peatPit;
  } else if (loc.waterType === 'anomaly_lake') {
    // Steep funnel / crater toward the anomalous rift
    const pitX = Math.cos(seed) * 0.22;
    const pitD = 0.62;
    const radial = Math.hypot((yawNorm - pitX) * 0.9, (distNorm - pitD) * 1.35);
    const crater = Math.exp(-radial * radial * 4.2) * 0.62;
    const shelf = Math.sin(distNorm * Math.PI * 0.88) * 0.44;
    profileFactor = shelf + crater;
  } else {
    // Lake / Granite quarry: steep rock drop-off on one side, deep basin in center-far
    const basinOffset = loc.id === 'tomashgorod' ? 0.14 : -0.12;
    const shelf =
      loc.id === 'tomashgorod'
        ? Math.pow(Math.sin(distNorm * Math.PI * 0.88), 0.68) * 0.72
        : Math.sin(distNorm * Math.PI * 0.92) * 0.66;
    const ledge =
      Math.exp(-Math.pow((yawNorm - basinOffset) * 1.4, 2)) *
      Math.sin(distNorm * Math.PI * 0.95) *
      0.32;
    profileFactor = shelf + ledge;
  }

  // Natural micro-relief (submerged logs, granite steps, bars)
  const micro =
    Math.sin(distNorm * 11.5 + yawNorm * 4.2 + seed) * 0.06 +
    Math.cos(yawNorm * 6.5 - distNorm * 5.0 + seed * 0.7) * 0.04;

  const depthNorm = Math.max(0.03, Math.min(1, profileFactor + micro));
  const depthM = Number((dMin + depthNorm * (dMax - dMin)).toFixed(1));

  let zoneLabel = 'Середня вода';
  if (distNorm < 0.2 || depthNorm < 0.25) {
    zoneLabel = Math.abs(yawNorm) > 0.55 ? 'Прибережний очерет' : 'Берегова мілина';
  } else if (distNorm > 0.86 && depthNorm < 0.52) {
    zoneLabel = 'Під протилежним берегом';
  } else if (depthNorm >= 0.76) {
    zoneLabel =
      loc.waterType === 'anomaly_lake'
        ? 'Аномальний вир'
        : loc.id === 'tomashgorod'
          ? 'Гранітна яма'
          : loc.id === 'rokitne'
            ? 'Яма під мостом'
            : 'Глибока яма';
  } else if (depthNorm >= 0.48) {
    zoneLabel =
      loc.waterType === 'river'
        ? loc.id === 'rokitne'
          ? 'Сосновий підмив'
          : 'Руслова бровка'
        : loc.id === 'tomashgorod'
          ? 'Скельний свал'
          : 'Донна бровка';
  } else if (Math.abs(yawNorm) > 0.6) {
    zoneLabel = yawNorm < 0 ? 'Ліва затока' : 'Права затока';
  }

  let bottomLabel = 'Пісок і мул';
  if (loc.id === 'tomashgorod') {
    bottomLabel = depthNorm > 0.6 ? 'Гранітний уступ' : 'Щебінь і пісок';
  } else if (loc.id === 'rokitne') {
    bottomLabel = depthNorm > 0.6 ? 'Глинисте русло під мостом' : 'Галька та коріння сосен';
  } else if (loc.waterType === 'swamp') {
    bottomLabel = depthNorm > 0.55 ? 'Торф’яна яма' : 'Корчі й торф';
  } else if (loc.waterType === 'anomaly_lake') {
    bottomLabel = depthNorm > 0.7 ? 'Кристалічний розлом' : 'Радіоактивний мул';
  } else if (loc.waterType === 'river') {
    bottomLabel = depthNorm > 0.62 ? 'Глинисте русло' : 'Піщана коса';
  }

  return { depthM, depthNorm, zoneLabel, bottomLabel };
}

export function getWaterSectorProfile(
  loc: LocationDef,
  yaw: number,
  maxCastM: number,
  steps = 28
): DepthProfilePoint[] {
  const pts: DepthProfilePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const distM = Number((3 + t * Math.max(8, maxCastM - 3)).toFixed(1));
    const { depthM } = getWaterSpotInfo(loc, yaw, distM, maxCastM);
    pts.push({ distM, depthM });
  }
  return pts;
}

export function scanSectorFish(
  loc: LocationDef,
  yaw: number,
  maxCastM: number,
  timeOfDay: number,
  weather: WeatherType,
  hasGroundbait: boolean,
  scanNonce = 0
): SonarFishBlip[] {
  const pool = loc.speciesIds.map((id) => FISH_MAP[id]).filter(Boolean);
  const sectorBucket = Math.round(yaw * 5); // distinct sectors across the water body
  const timeBucket = Math.floor(timeOfDay * 2);
  const baseSeed =
    locHash(loc.id) * 997 +
    sectorBucket * 37.3 +
    timeBucket * 13.7 +
    scanNonce * 19.1 +
    (weather === 'anomaly_surge' ? 41 : 0);

  const pseudoRand = (idx: number) => {
    const x = Math.sin(baseSeed + idx * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const count = (hasGroundbait ? 5 : 4) + Math.floor(pseudoRand(1) * 3);
  const blips: SonarFishBlip[] = [];

  for (let i = 0; i < count; i++) {
    const r1 = pseudoRand(i * 4 + 2);
    const r2 = pseudoRand(i * 4 + 3);
    const r3 = pseudoRand(i * 4 + 4);
    const r4 = pseudoRand(i * 4 + 5);

    const distM = Number((5.5 + r1 * Math.max(8, maxCastM - 7.5)).toFixed(1));
    const spot = getWaterSpotInfo(loc, yaw, distM, maxCastM);

    const sp = pool.length > 0 ? pool[Math.floor(r2 * pool.length)] : null;
    const rawW = sp
      ? sp.minWeightKg + Math.pow(r3, 1.35 - spot.depthNorm * 0.45) * (sp.maxWeightKg - sp.minWeightKg)
      : 0.6 + r3 * 3.5;
    const estWeightKg = Number((rawW * (hasGroundbait ? 1.15 : 1)).toFixed(1));

    let sizeClass: FishSizeClass = 'small';
    if (estWeightKg >= 10 || (sp?.isMutant && estWeightKg >= 7)) sizeClass = 'giant';
    else if (estWeightKg >= 3.8) sizeClass = 'large';
    else if (estWeightKg >= 1.1) sizeClass = 'medium';

    // Deeper pits hold larger fish closer to the bottom; smaller fish cruise midwater/upper column
    const bottomBias = sizeClass === 'giant' || sizeClass === 'large' ? 0.68 : 0.25;
    const depthFrac = Math.min(0.92, Math.max(0.18, bottomBias + r4 * (0.9 - bottomBias)));
    const swimDepthM = Number(Math.max(0.4, Math.min(spot.depthM - 0.25, spot.depthM * depthFrac)).toFixed(1));

    const isMutant = Boolean(sp?.isMutant) || (r4 < loc.anomalyActivity / 180 && weather === 'anomaly_surge');
    const label =
      sizeClass === 'giant'
        ? isMutant
          ? 'Аномальний гігант'
          : 'Велетень'
        : sizeClass === 'large'
          ? 'Велика (Трофей)'
          : sizeClass === 'medium'
            ? 'Середня риба'
            : 'Дрібна риба';

    blips.push({
      id: `${sectorBucket}_${i}_${scanNonce}`,
      distM,
      depthM: swimDepthM,
      bottomDepthM: spot.depthM,
      sizeClass,
      estWeightKg,
      isMutant,
      label,
    });
  }

  return blips.sort((a, b) => a.distM - b.distM);
}

export function getWaterDepthMapGrid(
  loc: LocationDef,
  maxCastM: number,
  timeOfDay: number,
  cols = 13,
  rows = 8
): WaterMapCell[][] {
  const seed = locHash(loc.id) * 53 + Math.floor(timeOfDay);
  const grid: WaterMapCell[][] = [];
  for (let r = 0; r < rows; r++) {
    // top row = farthest distance, bottom row = nearest shore
    const distFrac = 1 - r / (rows - 1);
    const distM = Number((5 + distFrac * Math.max(8, maxCastM - 5)).toFixed(1));
    const rowCells: WaterMapCell[] = [];
    for (let c = 0; c < cols; c++) {
      const yawFrac = (c / (cols - 1)) * 2 - 1; // -1..+1
      const yaw = Number((yawFrac * 0.82).toFixed(2));
      const info = getWaterSpotInfo(loc, yaw, distM, maxCastM);
      const fishNoise = Math.sin(seed + r * 3.1 + c * 5.7) * 0.5 + 0.5;
      const hasFishCluster = fishNoise > (info.depthNorm > 0.62 ? 0.52 : 0.72);
      const clusterSize: FishSizeClass =
        info.depthNorm > 0.72 && fishNoise > 0.78
          ? 'giant'
          : info.depthNorm > 0.5
            ? 'large'
            : fishNoise > 0.65
              ? 'medium'
              : 'small';
      rowCells.push({
        yaw,
        distM,
        depthM: info.depthM,
        depthNorm: info.depthNorm,
        hasFishCluster,
        clusterSize,
      });
    }
    grid.push(rowCells);
  }
  return grid;
}
