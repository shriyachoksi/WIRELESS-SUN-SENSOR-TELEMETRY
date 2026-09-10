import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTelemetry } from '../context/TelemetryContext';
import type { SensorFace } from '../types/telemetry';

export const CubeSat3D: React.FC = () => {
  const { currentPacket, selectedFace, setSelectedFace } = useTelemetry();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for dynamic updates in animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cubeSatGroupRef = useRef<THREE.Group | null>(null);
  const sunGroupRef = useRef<THREE.Group | null>(null);
  const vectorArrowGroupRef = useRef<THREE.Group | null>(null);
  const faceMeshesRef = useRef<Map<SensorFace, { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; textCanvas: HTMLCanvasElement; textCtx: CanvasRenderingContext2D; textTexture: THREE.CanvasTexture }>>(new Map());
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Set up 3D Scene once on mount
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    sceneRef.current = scene;

    // Background Grid Dots helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // 2. Camera (Positioned for prominent 45-50% view of CubeSat)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.2, 3.2, 4.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 15;
    controls.rotateSpeed = 0.8;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(8, 12, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-8, -6, -8);
    scene.add(dirLight2);

    // 6. Main CubeSat Group
    const cubeSatGroup = new THREE.Group();
    scene.add(cubeSatGroup);
    cubeSatGroupRef.current = cubeSatGroup;

    // Metallic Inner Chassis
    const CUBE_SIZE = 2.6;
    const chassisGeo = new THREE.BoxGeometry(CUBE_SIZE - 0.04, CUBE_SIZE - 0.04, CUBE_SIZE - 0.04);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    cubeSatGroup.add(chassisMesh);

    // Corner Bevel Edges
    const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE));
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
    cubeSatGroup.add(edgesMesh);

    // 7. Create 6 Sensor Faces
    const HALF_SIZE = CUBE_SIZE / 2;
    const faceConfigs: { face: SensorFace; pos: [number, number, number]; rot: [number, number, number] }[] = [
      { face: '+X', pos: [HALF_SIZE, 0, 0], rot: [0, Math.PI / 2, 0] },
      { face: '-X', pos: [-HALF_SIZE, 0, 0], rot: [0, -Math.PI / 2, 0] },
      { face: '+Y', pos: [0, HALF_SIZE, 0], rot: [-Math.PI / 2, 0, 0] },
      { face: '-Y', pos: [0, -HALF_SIZE, 0], rot: [Math.PI / 2, 0, 0] },
      { face: '+Z', pos: [0, 0, HALF_SIZE], rot: [0, 0, 0] },
      { face: '-Z', pos: [0, 0, -HALF_SIZE], rot: [0, Math.PI, 0] },
    ];

    faceConfigs.forEach(({ face, pos, rot }) => {
      const faceGroup = new THREE.Group();
      faceGroup.position.set(...pos);
      faceGroup.rotation.set(...rot);

      // Face Base Material
      const faceGeo = new THREE.PlaneGeometry(CUBE_SIZE - 0.1, CUBE_SIZE - 0.1);
      const faceMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.3,
        metalness: 0.7,
        side: THREE.DoubleSide,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.userData = { face };
      faceGroup.add(faceMesh);

      // Solar Panel Wireframe Pattern
      const gridGeo = new THREE.PlaneGeometry(CUBE_SIZE - 0.2, CUBE_SIZE - 0.2);
      const gridMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true, transparent: true, opacity: 0.3 });
      const gridMesh = new THREE.Mesh(gridGeo, gridMat);
      gridMesh.position.z = 0.005;
      faceGroup.add(gridMesh);

      // Circular LDR Sensor Aperture
      const sensorCylinderGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 32);
      const sensorCylinderMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x1e293b,
        emissiveIntensity: 0.2,
        metalness: 0.95,
        roughness: 0.05,
      });
      const sensorCylinder = new THREE.Mesh(sensorCylinderGeo, sensorCylinderMat);
      sensorCylinder.rotation.x = Math.PI / 2;
      sensorCylinder.position.z = 0.025;
      faceGroup.add(sensorCylinder);

      // Glowing Center Aperture Lens
      const lensGeo = new THREE.CircleGeometry(0.22, 32);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.position.z = 0.056;
      faceGroup.add(lensMesh);

      // Dynamic Canvas Texture for Face Labels (Face Name + ADC Reading)
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 256;
      textCanvas.height = 256;
      const textCtx = textCanvas.getContext('2d')!;
      const textTexture = new THREE.CanvasTexture(textCanvas);
      textTexture.needsUpdate = true;

      const labelGeo = new THREE.PlaneGeometry(CUBE_SIZE - 0.2, CUBE_SIZE - 0.2);
      const labelMat = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.z = 0.01;
      faceGroup.add(labelMesh);

      cubeSatGroup.add(faceGroup);

      faceMeshesRef.current.set(face, {
        mesh: faceMesh,
        mat: faceMat,
        textCanvas,
        textCtx,
        textTexture,
      });
    });

    // 8. Create Visible Sun Light Source Group
    const sunGroup = new THREE.Group();
    scene.add(sunGroup);
    sunGroupRef.current = sunGroup;

    // Glowing Sun Sphere Core
    const sunCoreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const sunCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfbbf24,
      emissiveIntensity: 3.0,
      roughness: 0,
    });
    const sunCore = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunGroup.add(sunCore);

    // Sun Corona Halo 1
    const sunHalo1Geo = new THREE.SphereGeometry(0.75, 24, 24);
    const sunHalo1Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.45 });
    const sunHalo1 = new THREE.Mesh(sunHalo1Geo, sunHalo1Mat);
    sunGroup.add(sunHalo1);

    // Sun Corona Halo 2
    const sunHalo2Geo = new THREE.SphereGeometry(1.0, 24, 24);
    const sunHalo2Mat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.2 });
    const sunHalo2 = new THREE.Mesh(sunHalo2Geo, sunHalo2Mat);
    sunGroup.add(sunHalo2);

    // Point Light from Sun
    const sunPointLight = new THREE.PointLight(0xfff7ed, 4.0, 20);
    sunGroup.add(sunPointLight);

    // 9. Create Prominent 3D Vector Arrow Shaft + Cone Tip
    const vectorArrowGroup = new THREE.Group();
    scene.add(vectorArrowGroup);
    vectorArrowGroupRef.current = vectorArrowGroup;

    // Vector Shaft Beam
    const arrowLength = 4.3;
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, arrowLength, 16);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.rotation.x = Math.PI / 2;
    shaftMesh.position.z = arrowLength / 2;
    vectorArrowGroup.add(shaftMesh);

    // Outer Sheath
    const sheathGeo = new THREE.CylinderGeometry(0.16, 0.16, arrowLength, 16);
    const sheathMat = new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.35 });
    const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
    sheathMesh.rotation.x = Math.PI / 2;
    sheathMesh.position.z = arrowLength / 2;
    vectorArrowGroup.add(sheathMesh);

    // Vector Cone Arrowhead
    const coneGeo = new THREE.ConeGeometry(0.32, 0.65, 24);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf59e0b, emissiveIntensity: 3.0 });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI / 2;
    coneMesh.position.z = arrowLength + 0.25;
    vectorArrowGroup.add(coneMesh);

    // 10. Coordinate Axes Lines (+X Red, +Y Green, +Z Amber)
    const axesGroup = new THREE.Group();

    // +X Axis (Red)
    const xPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(2.6, 0, 0)];
    const xGeo = new THREE.BufferGeometry().setFromPoints(xPoints);
    const xMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
    axesGroup.add(new THREE.Line(xGeo, xMat));

    // +Y Axis (Green)
    const yPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.6, 0)];
    const yGeo = new THREE.BufferGeometry().setFromPoints(yPoints);
    const yMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 3 });
    axesGroup.add(new THREE.Line(yGeo, yMat));

    // +Z Axis (Amber)
    const zPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 2.6)];
    const zGeo = new THREE.BufferGeometry().setFromPoints(zPoints);
    const zMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3.5 });
    axesGroup.add(new THREE.Line(zGeo, zMat));

    scene.add(axesGroup);

    // 11. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cubeSatGroupRef.current) {
        cubeSatGroupRef.current.rotation.y += 0.005;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update dynamic sensor face readings, glowing colors, text labels & vector direction
  useEffect(() => {
    const { sensors, dominantFace, vector } = currentPacket;

    (Object.keys(sensors) as SensorFace[]).forEach((face) => {
      const faceData = faceMeshesRef.current.get(face);
      if (!faceData) return;

      const sensor = sensors[face];
      const rawADC = sensor ? sensor.rawADC : 0;
      const norm = sensor ? sensor.normalized : 0;
      const isDominant = face === dominantFace;
      const isSelected = face === selectedFace;

      if (isSelected) {
        faceData.mat.color.setHex(0x2563eb);
        faceData.mat.emissive.setHex(0x60a5fa);
        faceData.mat.emissiveIntensity = 1.0;
      } else if (isDominant) {
        faceData.mat.color.setHex(0x78350f);
        faceData.mat.emissive.setHex(0xf59e0b);
        faceData.mat.emissiveIntensity = 0.8 + norm * 0.6;
      } else if (norm > 0.4) {
        faceData.mat.color.setHex(0x1e3a8a);
        faceData.mat.emissive.setHex(0x3b82f6);
        faceData.mat.emissiveIntensity = norm * 0.5;
      } else {
        faceData.mat.color.setHex(0x1e293b);
        faceData.mat.emissive.setHex(0x000000);
        faceData.mat.emissiveIntensity = 0;
      }

      const { textCtx, textTexture } = faceData;
      textCtx.clearRect(0, 0, 256, 256);

      textCtx.fillStyle = isDominant ? '#fbbf24' : '#ffffff';
      textCtx.font = 'bold 36px monospace';
      textCtx.textAlign = 'center';
      textCtx.fillText(face, 128, 48);

      textCtx.fillStyle = isDominant ? '#fde68a' : '#cbd5e1';
      textCtx.font = 'bold 28px monospace';
      textCtx.fillText(`${rawADC} ADC`, 128, 220);

      textTexture.needsUpdate = true;
    });

    const sunDist = 4.8;
    const dir = new THREE.Vector3(vector.x, vector.y, vector.z);
    if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
    dir.normalize();

    const sunPos = dir.clone().multiplyScalar(sunDist);

    if (sunGroupRef.current) {
      sunGroupRef.current.position.copy(sunPos);
    }

    if (vectorArrowGroupRef.current) {
      vectorArrowGroupRef.current.lookAt(sunPos);
    }
  }, [currentPacket, selectedFace]);

  const resetView = (preset: 'ISO' | 'Z_TOP' | 'X_FRONT' | 'Y_SIDE') => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (preset === 'ISO') {
      camera.position.set(4.2, 3.2, 4.2);
    } else if (preset === 'Z_TOP') {
      camera.position.set(0, 0.1, 6.5);
    } else if (preset === 'X_FRONT') {
      camera.position.set(6.5, 0.1, 0);
    } else if (preset === 'Y_SIDE') {
      camera.position.set(0.1, 6.5, 0);
    }
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.face) {
        const face = hit.object.userData.face as SensorFace;
        setSelectedFace(selectedFace === face ? null : face);
        break;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] lg:h-[540px] bg-slate-950 rounded-xs overflow-hidden border border-slate-800 shadow-2xl"
    >
      {/* 3D Canvas element */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Camera View Preset Controls (Top Left) */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-1 rounded-xs border border-slate-800 font-bold">
          VIEW:
        </span>
        {(['ISO', 'Z_TOP', 'X_FRONT', 'Y_SIDE'] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => resetView(preset)}
            className="text-[10px] font-mono font-bold text-slate-300 hover:text-amber-400 bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1 rounded-xs border border-slate-800 transition-colors cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Dominant Face Badge (Top Right) */}
      <div className="absolute top-3 right-3 bg-slate-950/95 text-slate-100 border border-amber-500/50 px-3 py-2 rounded-xs font-mono text-xs shadow-lg z-10">
        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">
          DOMINANT FACE
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-base">{currentPacket.dominantFace}</span>
          <span className="text-slate-300 font-mono text-xs">
            ({currentPacket.sensors[currentPacket.dominantFace]?.rawADC} ADC)
          </span>
        </div>
      </div>

      {/* Light Source Annotation Tag */}
      <div className="absolute top-16 right-3 bg-slate-950/90 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xs font-mono text-[11px] font-bold shadow-md z-10 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>LIGHT SOURCE → [{currentPacket.vector.x > 0 ? `+${currentPacket.vector.x}` : currentPacket.vector.x}, {currentPacket.vector.y > 0 ? `+${currentPacket.vector.y}` : currentPacket.vector.y}, {currentPacket.vector.z > 0 ? `+${currentPacket.vector.z}` : currentPacket.vector.z}]</span>
      </div>

      {/* XYZ Orientation Triad Gizmo (Bottom Right) */}
      <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xs z-10 text-[10px] font-mono pointer-events-none">
        <div className="text-slate-400 font-bold mb-1 text-[9px] uppercase">COORDINATE GIZMO</div>
        <div className="flex items-center gap-3">
          <span className="text-red-400 font-bold">+X (RED)</span>
          <span className="text-emerald-400 font-bold">+Y (GREEN)</span>
          <span className="text-amber-400 font-bold">+Z (AMBER)</span>
        </div>
      </div>

      {/* Interaction Help Bar (Bottom Left) */}
      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/90 px-3 py-1.5 rounded-xs border border-slate-800 flex items-center gap-2 pointer-events-none z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>DRAG TO ROTATE • SCROLL TO ZOOM • CLICK FACE TO HIGHLIGHT</span>
      </div>
    </div>
  );
};
