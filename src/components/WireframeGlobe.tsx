import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCcw, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface WireframeGlobeProps {
  isListening?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const WireframeGlobe: React.FC<WireframeGlobeProps> = ({
  isListening = false,
  expanded = false,
  onToggleExpand,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const poleTopGlowRef = useRef<THREE.Mesh | null>(null);
  const poleBottomGlowRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const linesMeshRef = useRef<THREE.LineSegments | null>(null);
  const requestRef = useRef<number | null>(null);

  // Interaction tracking
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.2, y: 0 });
  const currentRotation = useRef({ x: 0.2, y: 0 });
  const autoRotateSpeed = useRef(0.0035);
  const [pulseActive, setPulseActive] = useState(false);

  // Reset rotation to default
  const handleResetRotation = useCallback(() => {
    targetRotation.current = { x: 0.2, y: 0 };
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 800);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.z = 5.8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 1. Geodesic Sphere Wireframe
    const radius = 1.65;
    const icosahedronGeo = new THREE.IcosahedronGeometry(radius, 3);
    const wireframeGeo = new THREE.WireframeGeometry(icosahedronGeo);
    
    const wireframeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#78aaff'),
      transparent: true,
      opacity: 0.65,
      linewidth: 1.2
    });

    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeMesh);
    linesMeshRef.current = wireframeMesh;

    // 2. Inner secondary subtle wireframe (for depth)
    const innerGeo = new THREE.IcosahedronGeometry(radius * 0.96, 2);
    const innerWireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(innerGeo),
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#3b82f6'),
        transparent: true,
        opacity: 0.22
      })
    );
    globeGroup.add(innerWireframe);

    // 3. Equatorial rings
    const ringGeo = new THREE.RingGeometry(radius * 1.05, radius * 1.06, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    globeGroup.add(ring);
    ringRef.current = ring;

    // 4. Pole Glowing Accents (Top & Bottom light source nodes)
    const createPoleGlow = (yPos: number, colorHex: number) => {
      const poleGroup = new THREE.Group();

      // Core point
      const coreGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      poleGroup.add(core);

      // Outer luminous halo
      const haloGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.5,
        wireframe: true
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      poleGroup.add(halo);

      poleGroup.position.set(0, yPos, 0);
      return poleGroup;
    };

    const topGlow = createPoleGlow(radius, 0x60a5fa);
    const bottomGlow = createPoleGlow(-radius, 0x38bdf8);
    globeGroup.add(topGlow);
    globeGroup.add(bottomGlow);
    poleTopGlowRef.current = topGlow as unknown as THREE.Mesh;
    poleBottomGlowRef.current = bottomGlow as unknown as THREE.Mesh;

    // 5. Cloud of floating inner nodes / ambient particles
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * (radius * 0.92);
      const sinPhi = Math.sin(phi);
      particlePositions[i] = r * sinPhi * Math.cos(theta);
      particlePositions[i + 1] = r * sinPhi * Math.sin(theta);
      particlePositions[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.035,
      transparent: true,
      opacity: 0.75
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && rendererRef.current) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (globeGroupRef.current) {
        // Auto-rotation when idle
        if (!isDraggingRef.current) {
          targetRotation.current.y += isListening ? 0.009 : autoRotateSpeed.current;
        }

        // Smooth damping interpolation
        currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

        globeGroupRef.current.rotation.x = currentRotation.current.x;
        globeGroupRef.current.rotation.y = currentRotation.current.y;

        // Reactive wave when listening
        if (isListening && linesMeshRef.current) {
          const pulse = Math.sin(elapsedTime * 6) * 0.03;
          linesMeshRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
          (linesMeshRef.current.material as THREE.LineBasicMaterial).color.setHex(0x60a5fa);
          (linesMeshRef.current.material as THREE.LineBasicMaterial).opacity = 0.85;
        } else if (linesMeshRef.current) {
          linesMeshRef.current.scale.set(1, 1, 1);
          (linesMeshRef.current.material as THREE.LineBasicMaterial).color.setHex(0x78aaff);
          (linesMeshRef.current.material as THREE.LineBasicMaterial).opacity = 0.65;
        }

        // Gentle breathing on poles
        if (topGlow) {
          const s = 1 + Math.sin(elapsedTime * 3) * 0.15;
          topGlow.scale.set(s, s, s);
        }
        if (bottomGlow) {
          const s = 1 + Math.cos(elapsedTime * 3) * 0.15;
          bottomGlow.scale.set(s, s, s);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      icosahedronGeo.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      innerGeo.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isListening]);

  // Pointer event handlers for drag rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    targetRotation.current.y += deltaX * 0.006;
    targetRotation.current.x += deltaY * 0.006;

    // Clamp vertical tilt to prevent unnatural flipping
    targetRotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.current.x));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      id="globe-container-frame"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative rounded-[24px] overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-500 select-none ${
        expanded ? 'w-full h-full' : 'w-full h-full max-w-[580px] max-h-[580px]'
      } ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Background glow behind sphere */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={`w-[65%] h-[65%] rounded-full transition-all duration-700 blur-[80px] ${
          isListening 
            ? 'bg-[#2f6fff]/25 scale-110' 
            : 'bg-[#2f6fff]/12 scale-100'
        }`} />
      </div>

      {/* The 3D Canvas */}
      <canvas
        id="globe-three-canvas"
        ref={canvasRef}
        className="w-full h-full relative z-10 block"
      />

      {/* Top-Right Globe Controls (Reset & Expand) */}
      <div 
        id="globe-quick-controls"
        className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          id="btn-reset-globe-rotation"
          onClick={handleResetRotation}
          title="Reset globe rotation"
          className={`w-9 h-9 rounded-full border border-white/20 hover:border-white/60 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 active:scale-95 ${
            pulseActive ? 'rotate-180 text-[#2f6fff] border-[#2f6fff]' : ''
          }`}
          aria-label="Reset globe orientation"
        >
          <RotateCcw className="w-4 h-4 transition-transform" />
        </button>

        {onToggleExpand && (
          <button
            id="btn-expand-globe-view"
            onClick={onToggleExpand}
            title={expanded ? "Minimize globe" : "Expand globe view"}
            className="w-9 h-9 rounded-full border border-white/20 hover:border-white/60 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 active:scale-95"
            aria-label="Toggle globe fullscreen"
          >
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Subtle bottom-center indicator for drag */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
        <span className="text-[10px] tracking-widest uppercase font-mono-code text-white/50 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#2f6fff]" />
          Interactive 3D Sphere • Drag to Orbit
        </span>
      </div>
    </div>
  );
};
