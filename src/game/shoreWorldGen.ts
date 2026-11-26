import * as THREE from 'three';
import { FloatDef, LocationDef, RodType } from './types';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

export function createGrassMudTexture(maxAniso: number, isSwamp: boolean): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = isSwamp ? '#272c18' : '#263820';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 1 + Math.random() * 3.5;
    ctx.fillStyle =
      Math.random() > 0.45
        ? isSwamp
          ? 'rgba(72, 82, 36, 0.35)'
          : 'rgba(58, 92, 42, 0.35)'
        : 'rgba(28, 22, 16, 0.38)';
    ctx.fillRect(x, y, r, r);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export function createWoodPlankTexture(maxAniso: number): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#4a3525';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    ctx.fillStyle = y % 64 === 0 ? '#543c2a' : '#433021';
    ctx.fillRect(0, y, 256, 30);
    ctx.fillStyle = '#22170f';
    ctx.fillRect(0, y + 30, 256, 2);
    for (let g = 0; g < 18; g++) {
      ctx.fillStyle = 'rgba(25, 16, 10, 0.25)';
      ctx.fillRect(0, y + Math.random() * 28, 256, 1.5);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export function createRockTexture(maxAniso: number): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#475159';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const shade = 52 + Math.floor(Math.random() * 55);
    ctx.fillStyle = `rgba(${shade}, ${shade + 4}, ${shade + 7}, 0.45)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 7, 2 + Math.random() * 6);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export interface FishingRodRig {
  root: THREE.Group;
  rodBlank: THREE.Mesh;
  rodBasePositions: Float32Array;
  rodGuideGroups: THREE.Group[];
  rodGuideT: number[];
  rodLength: number;
  tipMarker: THREE.Object3D;
  reelHandle: THREE.Group;
  spoolMesh: THREE.Mesh;
}

export function buildFishingRodRig(rodType: RodType, rodLevelIndex: number): FishingRodRig {
  const root = new THREE.Group();

  const blankColors = [0x6b4c2e, 0x1e293b, 0x3f1d1d, 0x0f766e];
  const blankColor = blankColors[Math.min(rodLevelIndex, blankColors.length - 1)];

  const corkMat = new THREE.MeshStandardMaterial({
    color: 0xb98b5b,
    roughness: 0.96,
    metalness: 0,
  });
  const corkSeamMat = new THREE.MeshStandardMaterial({
    color: 0x765338,
    roughness: 1,
    metalness: 0,
  });
  const evaMat = new THREE.MeshStandardMaterial({
    color: 0x181c22,
    roughness: 0.72,
    metalness: 0.08,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x87919a,
    roughness: 0.34,
    metalness: 0.82,
  });
  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0x171d20,
    roughness: 0.2,
    metalness: 0.18,
    clearcoat: 0.8,
  });
  const threadMat = new THREE.MeshStandardMaterial({
    color: 0x252b2e,
    roughness: 0.42,
    metalness: 0.28,
  });
  const blankMat = new THREE.MeshPhysicalMaterial({
    color: blankColor,
    roughness: rodType === 'float' ? 0.27 : 0.19,
    metalness: rodLevelIndex >= 3 ? 0.42 : 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x343c42,
    roughness: 0.28,
    metalness: 0.82,
  });

  // Butt & cork grip (bottom-center along -Z forward/up)
  const buttCap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.06, 32), metalMat);
  buttCap.rotation.x = Math.PI / 2;
  buttCap.position.set(0, 0, 0.14);
  root.add(buttCap);

  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.36, 32), corkMat);
  grip.rotation.x = Math.PI / 2;
  grip.position.set(0, 0, -0.06);
  root.add(grip);
  // Fine cork grip rings and a worn, matte end collar.
  for (let i = 0; i < 7; i++) {
    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.0205, 0.0014, 5, 16), corkSeamMat);
    seam.rotation.x = Math.PI / 2;
    seam.position.set(0, 0, -0.205 + i * 0.043);
    root.add(seam);
  }

  const reelSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.11, 32), evaMat);
  reelSeat.rotation.x = Math.PI / 2;
  reelSeat.position.set(0, 0, -0.28);
  root.add(reelSeat);

  // Reel assembly suspended under reel seat
  const reelGroup = new THREE.Group();
  reelGroup.position.set(0, -0.045, -0.28);

  const reelStem = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.055, 0.026), metalMat);
  reelStem.position.set(0, 0.022, 0);
  reelGroup.add(reelStem);

  const reelBody = new THREE.Mesh(new THREE.SphereGeometry(0.043, 32, 24), evaMat);
  reelBody.scale.set(0.78, 0.66, 1.12);
  reelBody.position.set(0, -0.018, 0.01);
  reelGroup.add(reelBody);
  const reelSidePlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.034, 0.012, 32),
    accentMat
  );
  reelSidePlate.rotation.x = Math.PI / 2;
  reelSidePlate.position.set(0, -0.018, 0.047);
  reelGroup.add(reelSidePlate);
  const dragKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.016, 0.018, 24),
    metalMat
  );
  dragKnob.rotation.x = Math.PI / 2;
  dragKnob.position.set(0, -0.012, -0.069);
  reelGroup.add(dragKnob);

  const spoolCore = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.048, 18), metalMat);
  spoolCore.rotation.x = Math.PI / 2;
  spoolCore.position.set(0, -0.012, -0.036);
  reelGroup.add(spoolCore);
  const spoolMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.029, 0.052, 32), accentMat);
  spoolMesh.rotation.x = Math.PI / 2;
  spoolMesh.position.set(0, -0.012, -0.036);
  reelGroup.add(spoolMesh);
  // Spool lips and a thin fishing-line coil make the reel read as real tackle.
  for (const z of [-0.063, -0.009]) {
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.0024, 6, 20), metalMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.set(0, -0.012, z);
    reelGroup.add(lip);
  }
  const lineCoilMat = new THREE.MeshStandardMaterial({ color: 0x8a9a8b, roughness: 0.55, metalness: 0.12 });
  for (let i = 0; i < 5; i++) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.022 + i * 0.0004, 0.0009, 4, 24), lineCoilMat);
    coil.rotation.x = Math.PI / 2;
    coil.position.set(0, -0.012, -0.04 + i * 0.003);
    reelGroup.add(coil);
  }

  const reelHandle = new THREE.Group();
  reelHandle.position.set(0.026, -0.018, 0.012);
  const crankArm = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.042, 0.008), metalMat);
  crankArm.position.set(0.008, -0.018, 0);
  const crankKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.022, 8), corkMat);
  crankKnob.rotation.z = Math.PI / 2;
  crankKnob.position.set(0.018, -0.036, 0);
  reelHandle.add(crankArm, crankKnob);
  reelGroup.add(reelHandle);

  root.add(reelGroup);

  // First-person hand grip: natural skin, fabric sleeve and wrapped fingers.
  // The hand is attached to the rod, so it follows casting and reeling motion.
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xb77d5c,
    roughness: 0.98,
    metalness: 0,
  });
  const skinLightMat = new THREE.MeshStandardMaterial({
    color: 0xc88f70,
    roughness: 0.96,
    metalness: 0,
  });
  const nailMat = new THREE.MeshStandardMaterial({
    color: 0xd1a18a,
    roughness: 0.9,
    metalness: 0,
  });
  const sleeveMat = new THREE.MeshStandardMaterial({
    color: 0x303a2d,
    roughness: 0.96,
    metalness: 0,
  });
  const cuffMat = new THREE.MeshStandardMaterial({
    color: 0x202820,
    roughness: 0.9,
    metalness: 0.02,
  });
  const handGroup = new THREE.Group();
  handGroup.position.set(0, -0.015, 0.055);

  const forearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.09, 0.34, 12),
    sleeveMat
  );
  forearm.rotation.x = Math.PI / 2;
  forearm.position.set(0, -0.005, 0.24);
  handGroup.add(forearm);

  const cuff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.078, 0.07, 16),
    cuffMat
  );
  cuff.rotation.x = Math.PI / 2;
  cuff.position.set(0, -0.005, 0.075);
  handGroup.add(cuff);
  const cuffStitch = new THREE.Mesh(
    new THREE.TorusGeometry(0.078, 0.002, 5, 20),
    new THREE.MeshStandardMaterial({ color: 0x59624d, roughness: 1 })
  );
  cuffStitch.rotation.x = Math.PI / 2;
  cuffStitch.position.set(0, -0.005, 0.04);
  handGroup.add(cuffStitch);

  const palm = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 16, 12),
    skinMat
  );
  palm.scale.set(0.82, 0.72, 1.18);
  palm.position.set(0.006, -0.005, -0.055);
  handGroup.add(palm);

  // Four naturally curled fingers, with knuckles and small nail plates visible.
  for (let finger = 0; finger < 4; finger++) {
    const x = -0.057 + finger * 0.037;
    const length = finger === 0 ? 0.105 : finger === 3 ? 0.085 : 0.098;
    const segment = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.018, length, 5, 10),
      skinMat
    );
    segment.rotation.x = Math.PI / 2;
    segment.rotation.z = -0.12 + finger * 0.06;
    segment.position.set(x, -0.035, -0.105);
    handGroup.add(segment);

    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 8), skinLightMat);
    knuckle.scale.set(1, 0.78, 0.72);
    knuckle.position.set(x, -0.028, -0.145);
    handGroup.add(knuckle);

    const nail = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), nailMat);
    nail.scale.set(1.25, 0.42, 1.55);
    nail.position.set(x, -0.017, -0.17);
    handGroup.add(nail);
  }
  const thumb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.019, 0.09, 5, 10),
    skinMat
  );
  thumb.rotation.set(Math.PI / 2, 0, -0.82);
  thumb.position.set(0.085, 0.035, -0.045);
  handGroup.add(thumb);
  const thumbKnuckle = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), skinLightMat);
  thumbKnuckle.position.set(0.072, 0.041, -0.085);
  handGroup.add(thumbKnuckle);
  const thumbNail = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), nailMat);
  thumbNail.scale.set(1.3, 0.45, 1.5);
  thumbNail.position.set(0.091, 0.052, -0.105);
  handGroup.add(thumbNail);
  root.add(handGroup);

  // The second hand steadies the reel seat, like a real two-handed cast.
  const supportHand = new THREE.Group();
  supportHand.position.set(0.055, -0.115, -0.285);
  const supportPalm = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), skinMat);
  supportPalm.scale.set(0.78, 0.7, 1.25);
  supportPalm.position.set(0.005, -0.005, 0.015);
  supportHand.add(supportPalm);
  for (let finger = 0; finger < 4; finger++) {
    const fingerMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.07, 4, 8), skinMat);
    fingerMesh.rotation.x = Math.PI / 2;
    fingerMesh.rotation.z = -0.1 + finger * 0.06;
    fingerMesh.position.set(-0.043 + finger * 0.027, -0.035, -0.035);
    supportHand.add(fingerMesh);
  }
  const supportThumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.065, 4, 8), skinMat);
  supportThumb.rotation.set(Math.PI / 2, 0, -0.75);
  supportThumb.position.set(0.06, 0.025, 0.035);
  supportHand.add(supportThumb);
  root.add(supportHand);

  // One continuous tapered blank: the rod bends as a single elastic piece,
  // not as five visibly hinged sections.
  const rodLength = rodType === 'float' ? 2.82 : 2.46;
  const longitudinalSegments = 64;
  const radialSegments = 12;
  const rodPositions = new Float32Array((longitudinalSegments + 1) * (radialSegments + 1) * 3);
  const rodIndices: number[] = [];
  for (let row = 0; row <= longitudinalSegments; row++) {
    const t = row / longitudinalSegments;
    const radius = THREE.MathUtils.lerp(0.0145, 0.0021, Math.pow(t, 0.92));
    const z = -0.34 - rodLength * t;
    for (let side = 0; side <= radialSegments; side++) {
      const a = (side / radialSegments) * Math.PI * 2;
      const idx = (row * (radialSegments + 1) + side) * 3;
      rodPositions[idx] = Math.cos(a) * radius;
      rodPositions[idx + 1] = Math.sin(a) * radius;
      rodPositions[idx + 2] = z;
      if (row < longitudinalSegments && side < radialSegments) {
        const a0 = row * (radialSegments + 1) + side;
        const b0 = a0 + radialSegments + 1;
        rodIndices.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1);
      }
    }
  }
  const rodGeometry = new THREE.BufferGeometry();
  rodGeometry.setAttribute('position', new THREE.BufferAttribute(rodPositions.slice(), 3));
  rodGeometry.setIndex(rodIndices);
  rodGeometry.computeVertexNormals();
  const rodBlank = new THREE.Mesh(rodGeometry, blankMat);
  rodBlank.castShadow = true;
  rodBlank.receiveShadow = true;
  rodBlank.frustumCulled = false;
  root.add(rodBlank);

  const addStrut = (group: THREE.Group, from: THREE.Vector3, to: THREE.Vector3) => {
    const delta = new THREE.Vector3().subVectors(to, from);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0015, 0.0022, delta.length(), 8),
      metalMat
    );
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    group.add(mesh);
  };

  // Lightweight ceramic guides follow the same smooth curve as the blank.
  const rodGuideGroups: THREE.Group[] = [];
  const rodGuideT: number[] = [];
  const guidePositions = [0.12, 0.25, 0.38, 0.51, 0.64, 0.76, 0.87, 0.96];
  guidePositions.forEach((t, i) => {
    const radius = THREE.MathUtils.lerp(0.016, 0.0055, t);
    const guide = new THREE.Group();
    guide.position.set(0, -radius * 0.82, -0.34 - rodLength * t);
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.002, 8, 32),
      metalMat
    );
    const ceramicInsert = new THREE.Mesh(
      new THREE.TorusGeometry(radius - 0.0027, 0.0011, 8, 32),
      ceramicMat
    );
    guide.add(outerRing, ceramicInsert);
    addStrut(guide, new THREE.Vector3(-radius * 0.68, -radius * 0.72, 0),
      new THREE.Vector3(-0.0025, radius * 0.22, 0));
    addStrut(guide, new THREE.Vector3(radius * 0.68, -radius * 0.72, 0),
      new THREE.Vector3(0.0025, radius * 0.22, 0));
    // Small dark thread wraps at both guide feet.
    for (const offset of [-0.012, -0.007]) {
      const wrap = new THREE.Mesh(
        new THREE.TorusGeometry(Math.max(0.003, radius * 0.42), 0.0007, 5, 20),
        threadMat
      );
      wrap.rotation.x = Math.PI / 2;
      wrap.position.z = offset;
      guide.add(wrap);
    }
    root.add(guide);
    rodGuideGroups.push(guide);
    rodGuideT.push(t);
  });

  // Contrasting tip ring makes the fine, flexible end visible against water.
  const tipMarker = new THREE.Object3D();
  tipMarker.position.set(0, 0, -0.34 - rodLength);
  root.add(tipMarker);
  const tipBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0027, 0.0032, 0.045, 16),
    new THREE.MeshStandardMaterial({ color: 0xd66b2e, roughness: 0.38, metalness: 0.06 })
  );
  tipBand.rotation.x = Math.PI / 2;
  tipBand.position.z = 0.025;
  tipMarker.add(tipBand);
  return { root, rodBlank, rodBasePositions: rodPositions, rodGuideGroups, rodGuideT, rodLength, tipMarker, reelHandle, spoolMesh };
}

export interface BobberRig {
  group: THREE.Group;
  rippleRing: THREE.Mesh;
  tipMesh: THREE.Mesh;
  baseTipHex: number;
  isNightGlow: boolean;
  isElectronic: boolean;
}

export function buildBobberRig(isAnomalyGlow: boolean, floatDef?: FloatDef): BobberRig {
  const group = new THREE.Group();
  const style = floatDef?.style ?? 'wood';
  const bodyHex = floatDef ? new THREE.Color(floatDef.colorHex).getHex() : 0xf8fafc;
  const tipHex = floatDef
    ? new THREE.Color(floatDef.tipHex).getHex()
    : isAnomalyGlow ? 0x22d3ee : 0xef4444;
  const isNightGlow = Boolean(floatDef?.nightGlow || isAnomalyGlow);
  const isElectronic = Boolean(floatDef?.electronic);
  const isBall = style === 'ball';
  const isSlim = style === 'pencil' || style === 'goose' || style === 'waggler';
  const isHeavy = style === 'catfish' || style === 'livebait';
  const radius = isHeavy ? 0.068 : isBall ? 0.057 : isSlim ? 0.031 : 0.046;
  const height = isBall ? 0.105 : style === 'goose' ? 0.24 : style === 'waggler' || style === 'pencil' ? 0.29 : 0.19;

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: bodyHex,
    roughness: 0.24,
    metalness: style === 'electronic' ? 0.22 : 0.035,
    clearcoat: 0.92,
    clearcoatRoughness: 0.12,
  });
  const tipMat = new THREE.MeshPhysicalMaterial({
    color: tipHex,
    roughness: 0.2,
    metalness: 0.04,
    clearcoat: 0.85,
    emissive: isNightGlow || isElectronic ? tipHex : 0x000000,
    emissiveIntensity: isElectronic ? 1.35 : isNightGlow ? 0.9 : 0.04,
  });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.28, metalness: 0.82 });
  const paleMetal = new THREE.MeshStandardMaterial({ color: 0xc6d0d4, roughness: 0.22, metalness: 0.88 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.02 });

  if (isBall) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 32), bodyMat);
    group.add(ball);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.006, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.46), tipMat);
    cap.position.y = radius * 0.12;
    group.add(cap);
  } else {
    const profile = isHeavy
      ? [[0.006, -height * 0.58], [radius * 0.52, -height * 0.48], [radius * 0.92, -height * 0.24], [radius, 0], [radius * 0.82, height * 0.24], [radius * 0.48, height * 0.42], [0.006, height * 0.58]]
      : [[0.004, -height * 0.56], [radius * 0.55, -height * 0.40], [radius, -height * 0.08], [radius * 0.82, height * 0.20], [radius * 0.46, height * 0.40], [0.004, height * 0.56]];
    const body = new THREE.Mesh(
      new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 40),
      bodyMat
    );
    group.add(body);

    // A clearly painted shoulder and a narrow reflective band give the float a finished tackle-shop look.
    const shoulder = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.48, radius * 0.82, height * 0.075, 32),
      tipMat
    );
    shoulder.position.y = height * 0.36;
    group.add(shoulder);
    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.78, 0.0022, 8, 40),
      bandMat
    );
    trim.position.y = height * 0.23;
    group.add(trim);
  }

  // High-visibility antenna with two fine contrasting paint bands.
  const antennaH = style === 'waggler' || style === 'pencil' ? 0.34 : style === 'goose' ? 0.29 : 0.25;
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0065, 0.010, antennaH, 20),
    tipMat
  );
  antenna.position.y = (isBall ? radius * 0.82 : height * 0.49) + antennaH * 0.48;
  group.add(antenna);
  for (const bandY of [0.32, 0.62]) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0072, 0.0072, 0.012, 16),
      bandMat
    );
    band.position.y = antenna.position.y - antennaH * 0.5 + antennaH * bandY;
    group.add(band);
  }
  const antennaTop = new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 12), tipMat);
  antennaTop.position.y = antenna.position.y + antennaH * 0.5;
  group.add(antennaTop);

  // Realistic weighted keel, tiny metal eyelet and line attachment.
  const keelLength = isHeavy ? 0.19 : 0.15;
  const keel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0055, keelLength, 16),
    darkMetal
  );
  keel.position.y = -(isBall ? radius * 0.88 : height * 0.48) - keelLength * 0.5;
  group.add(keel);
  const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0026, 8, 24), paleMetal);
  eyelet.position.y = keel.position.y - keelLength * 0.48;
  group.add(eyelet);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.018, 20), paleMetal);
  collar.position.y = keel.position.y + keelLength * 0.42;
  group.add(collar);

  if (isElectronic || isNightGlow) {
    const glow = new THREE.PointLight(tipHex, isElectronic ? 0.7 : 0.38, 1.15, 2);
    glow.position.y = antenna.position.y;
    group.add(glow);
  }

  const rippleRing = new THREE.Mesh(
    new THREE.RingGeometry(0.14, 0.22, 48),
    new THREE.MeshBasicMaterial({
      color: isElectronic ? 0x22d3ee : 0xe2e8f0,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  rippleRing.rotation.x = -Math.PI / 2;
  rippleRing.position.y = 0.02;

  return { group, rippleRing, tipMesh: antenna, baseTipHex: tipHex, isNightGlow, isElectronic };
}

export interface ShoreEnvironmentRig {
  group: THREE.Group;
  reedMesh: THREE.InstancedMesh;
  lanternLight: THREE.PointLight;
  anomalyNodes: THREE.Mesh[];
}

export function buildShoreEnvironment(
  loc: LocationDef,
  maxAniso: number,
  isSoftwareGl: boolean
): ShoreEnvironmentRig {
  const group = new THREE.Group();
  const isSwamp = loc.waterType === 'swamp' || loc.waterType === 'anomaly_lake';
  const grassTex = createGrassMudTexture(maxAniso, isSwamp);
  const woodTex = createWoodPlankTexture(maxAniso);
  const rockTex = createRockTexture(maxAniso);

  const groundMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 0.94,
    metalness: 0.02,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.85,
    metalness: 0.04,
  });
  const rockMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    roughness: 0.9,
    metalness: 0.06,
    flatShading: true,
  });

  // Near shore terrain bank (player stands around x=0, z=4, facing -Z over the water!)
  const shoreGeo = new THREE.PlaneGeometry(140, 32, 48, 16);
  shoreGeo.rotateX(-Math.PI / 2);
  const posAttr = shoreGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i); // -16 .. +16 (shifted so z=0..18 is shore, z<0 drops under water)
    let y = 0;
    if (z < -2) {
      y = -1.6 + (z + 2) * 0.14;
    } else {
      y = Math.min(2.6, (z + 2) * 0.16) + Math.sin(x * 0.18) * 0.35 + Math.cos(x * 0.07 + z * 0.2) * 0.25;
    }
    posAttr.setY(i, y);
  }
  shoreGeo.computeVertexNormals();
  const nearShore = new THREE.Mesh(shoreGeo, groundMat);
  nearShore.position.set(0, 0, 10);
  nearShore.receiveShadow = true;
  group.add(nearShore);

  // Opposite bank across the river/lake (at z = -54..-90) so the scene feels grounded in Polissia
  const farGeo = new THREE.PlaneGeometry(240, 64, 56, 18);
  farGeo.rotateX(-Math.PI / 2);
  const farPos = farGeo.attributes.position as THREE.BufferAttribute;
  const bankDist = loc.waterType === 'river' ? -58 : loc.waterType === 'swamp' ? -64 : -78;
  for (let i = 0; i < farPos.count; i++) {
    const x = farPos.getX(i);
    const z = farPos.getZ(i);
    const edge = z > 18 ? -(z - 18) * 0.22 : Math.min(4.8, (18 - z) * 0.16);
    farPos.setY(i, edge + Math.sin(x * 0.11 + z * 0.1) * 0.85);
  }
  farGeo.computeVertexNormals();
  const farShore = new THREE.Mesh(farGeo, groundMat);
  farShore.position.set(0, 0, bankDist - 22);
  farShore.receiveShadow = true;
  group.add(farShore);

  // Wooden Fishing Pier / Pomist extending from bank into water
  const pierGroup = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 7.2), woodMat);
  deck.position.set(0, 0.82, 2.2);
  deck.castShadow = !isSoftwareGl;
  deck.receiveShadow = true;
  pierGroup.add(deck);

  for (const pz of [-1.0, 1.5, 4.0]) {
    for (const px of [-1.45, 1.45]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.4, 8), woodMat);
      post.position.set(px, 0.1, pz);
      pierGroup.add(post);
    }
  }

  // Shore props on pier: tackle box, fishing bucket, lantern
  const tackleBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.28, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.65, metalness: 0.15 })
  );
  tackleBox.position.set(-1.1, 1.07, 0.9);
  tackleBox.rotation.y = 0.32;
  pierGroup.add(tackleBox);

  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.19, 0.38, 12),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.65 })
  );
  bucket.position.set(1.05, 1.12, 0.8);
  pierGroup.add(bucket);

  // Pier lantern post
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.35, 8), woodMat);
  lanternPost.position.set(-1.38, 1.5, -1.0);
  pierGroup.add(lanternPost);

  const lanternGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.2, 8),
    new THREE.MeshBasicMaterial({ color: 0xfde047 })
  );
  lanternGlass.position.set(-1.38, 2.2, -1.0);
  pierGroup.add(lanternGlass);

  const lanternLight = new THREE.PointLight(0xfbbf24, 16, 18, 1.5);
  lanternLight.position.set(-1.38, 2.25, -1.0);
  pierGroup.add(lanternLight);

  group.add(pierGroup);

  // Shoreline Boulders (Tomashgorod gets extra river rapids boulders)
  const rockCount = loc.id === 'tomashgorod' ? 18 : 9;
  for (let i = 0; i < rockCount; i++) {
    const rx = (i - rockCount / 2) * (loc.id === 'tomashgorod' ? 5.5 : 8) + (Math.sin(i * 4.2) * 3);
    const rz = loc.id === 'tomashgorod' ? -8 - (i % 4) * 9 : 1.5 - (i % 3) * 3.5;
    if (Math.abs(rx) < 4.5 && rz > -5) continue;
    const scale = 0.8 + (i % 3) * 0.55;
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 1), rockMat);
    boulder.scale.set(1.2, 0.65, 1.0);
    boulder.position.set(rx, 0.18, rz);
    boulder.rotation.set(i * 0.5, i * 1.1, 0);
    boulder.castShadow = !isSoftwareGl;
    boulder.receiveShadow = true;
    group.add(boulder);
  }

  // Instanced Swaying Reeds along both shores
  const reedCount = 160;
  const reedGeo = new THREE.CylinderGeometry(0.015, 0.045, 2.2, 5);
  reedGeo.translate(0, 1.1, 0);
  const reedMat = new THREE.MeshStandardMaterial({
    color: isSwamp ? 0x5c6430 : 0x4d6e32,
    roughness: 0.85,
  });
  const reedMesh = new THREE.InstancedMesh(reedGeo, reedMat, reedCount);
  const dummy = new THREE.Object3D();
  const cTint = new THREE.Color();
  for (let i = 0; i < reedCount; i++) {
    const onFar = i > reedCount * 0.55;
    let rx = (Math.random() - 0.5) * (onFar ? 130 : 76);
    if (!onFar && Math.abs(rx) < 3.6) {
      rx = rx < 0 ? -4.2 - Math.random() * 6 : 4.2 + Math.random() * 6;
    }
    const rz = onFar
      ? bankDist + 2 + Math.random() * 6
      : 1.0 + Math.random() * 4.2;
    dummy.position.set(rx, -0.25, rz);
    dummy.rotation.set((Math.random() - 0.5) * 0.18, Math.random() * Math.PI, (Math.random() - 0.5) * 0.22);
    const s = 0.75 + Math.random() * 0.65;
    dummy.scale.set(1, s, 1);
    dummy.updateMatrix();
    reedMesh.setMatrixAt(i, dummy.matrix);
    cTint.setHex(isSwamp ? 0x626b32 : 0x557a36).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
    reedMesh.setColorAt(i, cTint);
  }
  reedMesh.instanceMatrix.needsUpdate = true;
  if (reedMesh.instanceColor) reedMesh.instanceColor.needsUpdate = true;
  reedMesh.computeBoundingSphere();
  group.add(reedMesh);

  // Lilypads for lakes and swamps
  if (loc.waterType === 'lake' || loc.waterType === 'swamp' || loc.waterType === 'anomaly_lake') {
    const padCount = 46;
    const padGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.03, 10);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x2e5e2e, roughness: 0.75 });
    const padMesh = new THREE.InstancedMesh(padGeo, padMat, padCount);
    for (let i = 0; i < padCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const px = side * (4.5 + Math.random() * 24);
      const pz = -4 - Math.random() * 26;
      dummy.position.set(px, 0.03, pz);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      const sc = 0.6 + Math.random() * 0.9;
      dummy.scale.set(sc, 1, sc);
      dummy.updateMatrix();
      padMesh.setMatrixAt(i, dummy.matrix);
    }
    padMesh.instanceMatrix.needsUpdate = true;
    padMesh.computeBoundingSphere();
    group.add(padMesh);
  }

  // Polissia Pines & Birches (Instanced trunks + foliage crowns framing the far & side banks)
  const treeCount = 64;
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.36, 6.5, 7);
  trunkGeo.translate(0, 3.25, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3c2c20, roughness: 0.92 });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);

  const crownGeo = new THREE.ConeGeometry(2.3, 7.5, 7);
  crownGeo.translate(0, 7.4, 0);
  const crownMat = new THREE.MeshStandardMaterial({
    color: isSwamp ? 0x233827 : 0x1e4028,
    roughness: 0.88,
    flatShading: true,
  });
  const crowns = new THREE.InstancedMesh(crownGeo, crownMat, treeCount);

  for (let i = 0; i < treeCount; i++) {
    const sideTree = i < 16;
    const tx = sideTree
      ? (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 30)
      : (Math.random() - 0.5) * 160;
    const tz = sideTree ? 6 + Math.random() * 14 : bankDist - 4 - Math.random() * 22;
    const sc = 0.85 + Math.random() * 0.75;
    dummy.position.set(tx, 1.0, tz);
    dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.06);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    crowns.setMatrixAt(i, dummy.matrix);
    cTint.setHex(isSwamp ? 0x283e2a : 0x1f4528).offsetHSL(0, 0, (Math.random() - 0.5) * 0.08);
    crowns.setColorAt(i, cTint);
  }
  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
  trunks.computeBoundingSphere();
  crowns.computeBoundingSphere();
  group.add(trunks, crowns);

  // Location-specific landmarks across the water
  const anomalyNodes: THREE.Mesh[] = [];
  if (loc.id === 'masevychi') {
    // Old wooden bridge framing the far river bend
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(38, 0.5, 2.6), woodMat);
    bridge.position.set(14, 1.5, -49.5);
    bridge.rotation.y = -0.22;
    group.add(bridge);
  } else if (loc.id === 'snovydovychi') {
    // Flooded concrete bridge pilings
    const concMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    [-16, -4, 12].forEach((px, idx) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.8 + idx * 0.4, 2.2), concMat);
      pillar.position.set(px, 1.2, -28 - idx * 3);
      pillar.rotation.z = (idx - 1) * 0.09;
      group.add(pillar);
    });
  } else if (loc.waterType === 'anomaly_lake' || loc.radiationLevel >= 2) {
    // Glowing anomaly crystal clusters along the far shore
    const glowColor = new THREE.Color(loc.glowColor);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 1.6,
      roughness: 0.15,
      clearcoat: 1.0,
    });
    for (let i = 0; i < 6; i++) {
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(1.1 + (i % 2) * 0.5, 0), crystalMat);
      cr.scale.set(0.6, 2.2, 0.6);
      cr.position.set(-28 + i * 11, 1.4, bankDist + 4 + (i % 3) * 3);
      cr.rotation.set(0.2 * i, i, 0.25);
      group.add(cr);
      anomalyNodes.push(cr);
    }
  }

  return { group, reedMesh, lanternLight, anomalyNodes };
}
