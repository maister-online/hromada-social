import * as THREE from 'three';
import { FishSpeciesDef } from './types';

export interface Fauna3DRig {
  group: THREE.Group;
  tailPivot: THREE.Object3D;
  claws: THREE.Object3D[];
  electricRings: THREE.Mesh[];
  glowMaterial?: THREE.MeshStandardMaterial;
}

export function buildFauna3DMesh(species: FishSpeciesDef): Fauna3DRig {
  const spec = species.model3d ?? {
    bodyShape: species.faunaKind === 'crayfish' ? 'crayfish' : 'fusiform',
    primaryHex: species.accentColor || '#64748b',
    secondaryHex: '#1e293b',
    finHex: species.accentColor || '#94a3b8',
    eyeCount: species.isMutant ? 3 : 2,
    hasClaws: species.faunaKind === 'crayfish',
    glowHex: species.isMutant ? species.accentColor : undefined,
    armorPlates: false,
    electricArcs: false,
    scaleFactor: 1,
  };

  const root = new THREE.Group();
  const tailPivot = new THREE.Group();
  const claws: THREE.Object3D[] = [];
  const electricRings: THREE.Mesh[] = [];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.primaryHex),
    roughness: spec.bodyShape === 'beetle' || spec.bodyShape === 'crayfish' ? 0.34 : 0.28,
    metalness: spec.bodyShape === 'beetle' ? 0.45 : 0.22,
    emissive: spec.glowHex ? new THREE.Color(spec.glowHex) : new THREE.Color(0x000000),
    emissiveIntensity: spec.glowHex ? 0.36 : 0,
  });

  const bellyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.secondaryHex),
    roughness: 0.42,
    metalness: 0.12,
  });

  const finMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.finHex),
    roughness: 0.35,
    metalness: 0.15,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    emissive: spec.glowHex ? new THREE.Color(spec.glowHex) : new THREE.Color(0x000000),
    emissiveIntensity: spec.glowHex ? 0.55 : 0,
  });

  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: species.isMutant ? 0xfef08a : 0xf8fafc,
    emissive: species.isMutant ? new THREE.Color(spec.glowHex ?? '#22d3ee') : new THREE.Color(0x000000),
    emissiveIntensity: species.isMutant ? 0.8 : 0,
    roughness: 0.2,
  });

  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x020617,
    roughness: 0.15,
  });

  const shape = spec.bodyShape;

  if (shape === 'crayfish') {
    // Segmented armored cephalothorax + abdomen + tail fan + claws + 6 walking legs + antennae
    const thorax = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.34, 6, 12), bodyMat);
    thorax.rotation.z = Math.PI / 2;
    thorax.scale.set(1, 1, 0.85);
    thorax.position.set(0.08, 0, 0);
    root.add(thorax);

    const rostrum = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), bodyMat);
    rostrum.rotation.z = -Math.PI / 2;
    rostrum.position.set(0.36, 0.02, 0);
    root.add(rostrum);

    for (let s = 0; s < 4; s++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 - s * 0.02, 0.16 - s * 0.02, 0.12, 10),
        s % 2 === 0 ? bodyMat : bellyMat
      );
      seg.rotation.z = Math.PI / 2;
      seg.position.set(-0.18 - s * 0.11, -s * 0.015, 0);
      root.add(seg);
    }

    tailPivot.position.set(-0.56, -0.04, 0);
    const tailFan = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 5), finMat);
    tailFan.rotation.z = Math.PI / 2;
    tailFan.scale.set(0.35, 1, 1.35);
    tailFan.position.set(-0.1, 0, 0);
    tailPivot.add(tailFan);
    root.add(tailPivot);

    // Big front claws
    for (const side of [-1, 1]) {
      const clawArm = new THREE.Group();
      clawArm.position.set(0.24, 0, side * 0.18);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.28, 8), bodyMat);
      arm.rotation.z = -Math.PI / 3;
      arm.rotation.y = side * 0.45;
      arm.position.set(0.11, 0, side * 0.06);
      clawArm.add(arm);

      const pincerTop = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.24, 7), finMat);
      pincerTop.rotation.z = -Math.PI / 2;
      pincerTop.position.set(0.28, 0.04, side * 0.13);
      const pincerBot = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.21, 7), finMat);
      pincerBot.rotation.z = -Math.PI / 2;
      pincerBot.position.set(0.27, -0.02, side * 0.13);
      clawArm.add(pincerTop, pincerBot);

      root.add(clawArm);
      claws.push(clawArm);

      // 3 walking legs per side
      for (let l = 0; l < 3; l++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.26, 6), bellyMat);
        leg.position.set(0.1 - l * 0.11, -0.1, side * 0.2);
        leg.rotation.x = side * 0.85;
        root.add(leg);
      }

      // Antenna
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.003, 0.52, 5), finMat);
      ant.rotation.z = -Math.PI / 2.3;
      ant.rotation.y = side * 0.35;
      ant.position.set(0.45, 0.07, side * 0.14);
      root.add(ant);
    }
  } else if (shape === 'beetle' || shape === 'insect') {
    const isBeetle = shape === 'beetle';
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(isBeetle ? 0.26 : 0.17, 14, 10),
      bodyMat
    );
    body.scale.set(isBeetle ? 1.45 : 1.75, 0.72, 1.0);
    root.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), bellyMat);
    head.position.set(isBeetle ? 0.34 : 0.28, 0.02, 0);
    root.add(head);

    if (!isBeetle) {
      // Translucent insect wings
      const wingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.finHex),
        transparent: true,
        opacity: 0.55,
        roughness: 0.15,
        side: THREE.DoubleSide,
      });
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.16), wingMat);
        wing.rotation.x = -Math.PI / 2;
        wing.rotation.z = side * 0.55;
        wing.position.set(-0.06, 0.14, side * 0.2);
        root.add(wing);
        claws.push(wing);
      }
    }

    for (const side of [-1, 1]) {
      for (let l = 0; l < 3; l++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.28, 6), bellyMat);
        leg.position.set(0.14 - l * 0.14, -0.06, side * 0.22);
        leg.rotation.x = side * 1.0;
        root.add(leg);
      }
    }

    tailPivot.position.set(-0.34, 0, 0);
    root.add(tailPivot);
  } else if (shape === 'frog' || shape === 'turtle') {
    const isTurtle = shape === 'turtle';
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), bodyMat);
    torso.scale.set(1.25, isTurtle ? 0.58 : 0.72, 1.1);
    root.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), isTurtle ? bellyMat : bodyMat);
    head.position.set(0.32, 0.06, 0);
    root.add(head);

    for (const side of [-1, 1]) {
      const hindLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), finMat);
      hindLeg.rotation.z = Math.PI / 3;
      hindLeg.rotation.y = side * 0.45;
      hindLeg.position.set(-0.22, -0.06, side * 0.24);
      root.add(hindLeg);
      claws.push(hindLeg);

      const frontLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.16, 4, 8), bellyMat);
      frontLeg.position.set(0.16, -0.1, side * 0.22);
      root.add(frontLeg);
    }
    tailPivot.position.set(-0.32, 0, 0);
    root.add(tailPivot);
  } else if (shape === 'eel' || shape === 'leech' || shape === 'snake') {
    const segCount = 6;
    let curParent: THREE.Object3D = root;
    for (let i = 0; i < segCount; i++) {
      const r1 = Math.max(0.03, 0.13 * (1 - i * 0.12));
      const r2 = Math.max(0.02, 0.13 * (1 - (i + 1) * 0.12));
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, 0.22, 10), i % 2 === 0 ? bodyMat : bellyMat);
      seg.rotation.z = Math.PI / 2;
      if (i === 0) {
        seg.position.set(0.22, 0, 0);
        curParent.add(seg);
      } else {
        const piv = new THREE.Group();
        piv.position.set(-0.2, 0, 0);
        piv.add(seg);
        seg.position.set(-0.08, 0, 0);
        curParent.add(piv);
        curParent = piv;
        if (i === 2) {
          tailPivot.position.set(-0.1, 0, 0);
          piv.add(tailPivot);
        }
      }
    }
  } else {
    // Fish bodies: fusiform, deep, catfish, sturgeon
    const isDeep = shape === 'deep';
    const isCatfish = shape === 'catfish';
    const isSturgeon = shape === 'sturgeon';

    const bodyGeo = new THREE.SphereGeometry(0.28, 18, 14);
    if (isDeep) {
      bodyGeo.scale(1.65, 1.15, 0.45);
    } else if (isCatfish) {
      bodyGeo.scale(1.95, 0.72, 0.78);
    } else if (isSturgeon) {
      bodyGeo.scale(2.2, 0.58, 0.56);
    } else {
      bodyGeo.scale(1.9, 0.76, 0.5);
    }
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    root.add(body);

    // Belly highlight
    const bellyGeo = new THREE.SphereGeometry(0.22, 14, 10);
    bellyGeo.scale(isDeep ? 1.45 : 1.75, 0.55, 0.42);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0.02, isDeep ? -0.13 : -0.09, 0);
    root.add(belly);

    if (isSturgeon) {
      const snout = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 8), bodyMat);
      snout.rotation.z = -Math.PI / 2;
      snout.position.set(0.62, -0.02, 0);
      root.add(snout);
    }

    if (isCatfish) {
      for (const side of [-1, 1]) {
        const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.004, 0.34, 6), finMat);
        whisker.rotation.z = -Math.PI / 3;
        whisker.rotation.y = side * 0.55;
        whisker.position.set(0.54, -0.05, side * 0.14);
        root.add(whisker);
      }
    }

    // Dorsal fin
    const dorsalGeo = new THREE.ConeGeometry(isDeep ? 0.18 : 0.14, isDeep ? 0.28 : 0.24, 4);
    const dorsal = new THREE.Mesh(dorsalGeo, finMat);
    dorsal.scale.set(1.5, 1, 0.2);
    dorsal.rotation.z = 0.28;
    dorsal.position.set(-0.04, isDeep ? 0.36 : 0.24, 0);
    root.add(dorsal);

    // Pectoral & ventral fins
    for (const side of [-1, 1]) {
      const pec = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 4), finMat);
      pec.scale.set(0.8, 1, 0.2);
      pec.rotation.z = 0.9;
      pec.rotation.x = side * 0.45;
      pec.position.set(0.18, -0.08, side * 0.15);
      root.add(pec);
    }

    // Tail peduncle & caudal fin attached to tailPivot
    tailPivot.position.set(isDeep ? -0.38 : -0.46, 0, 0);
    const tailUpper = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 4), finMat);
    tailUpper.scale.set(0.9, 1, 0.16);
    tailUpper.rotation.z = -0.85;
    tailUpper.position.set(-0.16, 0.08, 0);

    const tailLower = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), finMat);
    tailLower.scale.set(0.9, 1, 0.16);
    tailLower.rotation.z = -2.25;
    tailLower.position.set(-0.15, -0.08, 0);

    tailPivot.add(tailUpper, tailLower);
    root.add(tailPivot);
  }

  // Eyes (supports 2 normal or 3+ mutant eyes!)
  const eyeX =
    shape === 'crayfish' ? 0.3 : shape === 'eel' || shape === 'leech' ? 0.28 : shape === 'sturgeon' ? 0.42 : 0.36;
  const eyeY = shape === 'catfish' ? 0.08 : shape === 'frog' ? 0.15 : 0.06;
  const eyeZ = shape === 'crayfish' ? 0.11 : shape === 'eel' ? 0.08 : 0.12;

  for (const side of [-1, 1]) {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), eyeWhiteMat);
    sclera.position.set(eyeX, eyeY, side * eyeZ);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), pupilMat);
    pupil.position.set(eyeX + 0.018, eyeY, side * (eyeZ + 0.02));
    root.add(sclera, pupil);
  }
  if ((spec.eyeCount ?? 2) >= 3) {
    const midSclera = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), eyeWhiteMat);
    midSclera.position.set(eyeX - 0.04, eyeY + 0.075, 0);
    const midPupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), pupilMat);
    midPupil.position.set(eyeX - 0.015, eyeY + 0.085, 0);
    root.add(midSclera, midPupil);
  }

  // Armor dorsal plates for armored mutants / sturgeon
  if (spec.armorPlates || shape === 'sturgeon') {
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.72,
    });
    for (let p = 0; p < 5; p++) {
      const plate = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), plateMat);
      plate.scale.set(1.2, 0.7, 0.7);
      plate.position.set(0.22 - p * 0.12, 0.19 - Math.abs(p - 2) * 0.015, 0);
      root.add(plate);
    }
  }

  // Electric anomaly rings
  if (spec.electricArcs) {
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    for (let r = 0; r < 2; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28 + r * 0.06, 0.01, 6, 20), arcMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(0.08 - r * 0.22, 0, 0);
      root.add(ring);
      electricRings.push(ring);
    }
  }

  const s = spec.scaleFactor ?? 1;
  root.scale.setScalar(s);

  return {
    group: root,
    tailPivot,
    claws,
    electricRings,
    glowMaterial: spec.glowHex ? bodyMat : undefined,
  };
}

export function animateFauna3DMesh(
  rig: Fauna3DRig,
  elapsedSec: number,
  swimIntensity = 1.0
): void {
  const spd = 4.2 + swimIntensity * 6.5;
  rig.tailPivot.rotation.y = Math.sin(elapsedSec * spd) * (0.28 + swimIntensity * 0.25);

  for (let i = 0; i < rig.claws.length; i++) {
    const c = rig.claws[i];
    const dir = i % 2 === 0 ? 1 : -1;
    c.rotation.z = Math.sin(elapsedSec * (spd * 0.7) + i) * 0.14 * dir;
  }

  for (let i = 0; i < rig.electricRings.length; i++) {
    const ring = rig.electricRings[i];
    ring.rotation.x = elapsedSec * (2.5 + i * 1.4);
    const pulse = 0.92 + Math.sin(elapsedSec * 7 + i * 2) * 0.14;
    ring.scale.setScalar(pulse);
  }

  if (rig.glowMaterial) {
    rig.glowMaterial.emissiveIntensity = 0.28 + Math.sin(elapsedSec * 3.1) * 0.16;
  }
}
