import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { animateFauna3DMesh, buildFauna3DMesh } from '../game/fish3d';
import { FishSpeciesDef } from '../game/types';

interface Fauna3DPreviewProps {
  species: FishSpeciesDef;
  className?: string;
}

export const Fauna3DPreview: React.FC<Fauna3DPreviewProps> = ({
  species,
  className = 'w-full h-44',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const rotOffsetRef = useRef({ yaw: 0.45, pitch: 0.16 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const w = host.clientWidth || 320;
    const h = host.clientHeight || 176;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 30);
    camera.position.set(0, 0.18, 2.25);
    camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0xa5f3fc, 0x0f172a, 1.1);
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.1);
    keyLight.position.set(2.5, 3.2, 3.5);
    const rimLight = new THREE.DirectionalLight(
      species.isMutant ? 0x22d3ee : 0x34d399,
      1.2
    );
    rimLight.position.set(-2.5, 1.2, -2.5);
    scene.add(hemi, keyLight, rimLight);

    const rig = buildFauna3DMesh(species);
    // Normalize display size so trophy and small creatures fit cleanly in preview box
    const box = new THREE.Box3().setFromObject(rig.group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.5);
    const normScale = 1.28 / maxDim;
    rig.group.scale.multiplyScalar(normScale);
    scene.add(rig.group);

    let frameId = 0;
    let disposed = false;
    const startMs = performance.now();

    const draw = () => {
      if (disposed) return;
      const elapsed = (performance.now() - startMs) / 1000;
      animateFauna3DMesh(rig, elapsed, 0.65);

      if (!dragRef.current.active) {
        rotOffsetRef.current.yaw += isSoftwareGl ? 0.035 : 0.008;
      }
      rig.group.rotation.y = rotOffsetRef.current.yaw;
      rig.group.rotation.x = rotOffsetRef.current.pitch;

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        frameId = window.setTimeout(draw, 90);
      } else {
        frameId = requestAnimationFrame(draw);
      }
    };

    const onResize = () => {
      if (disposed) return;
      const nw = host.clientWidth || 320;
      const nh = host.clientHeight || 176;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', onResize);
    draw();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [species]);

  return (
    <div
      ref={hostRef}
      onPointerDown={(e) => {
        dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        rotOffsetRef.current.yaw += dx * 0.015;
        rotOffsetRef.current.pitch = Math.max(
          -0.8,
          Math.min(0.8, rotOffsetRef.current.pitch + dy * 0.01)
        );
      }}
      onPointerUp={() => {
        dragRef.current.active = false;
      }}
      onPointerLeave={() => {
        dragRef.current.active = false;
      }}
      className={`relative cursor-grab active:cursor-grabbing touch-none ${className}`}
      title="Потягніть, щоб покрутити 3D-модель"
    >
      <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] text-emerald-300/75 font-mono-num">
        3D-огляд · потягніть
      </span>
    </div>
  );
};
