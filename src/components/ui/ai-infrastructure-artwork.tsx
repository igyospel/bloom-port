import React, { useEffect, useRef, useState } from 'react';
import { Globe, Cpu, Zap, Activity, ShieldAlert } from 'lucide-react';

export function AiInfrastructureArtwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 700, height: 600 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Responsive canvas resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 550,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // 3D Scene Rotation (Parallax) variables
    let currentRx = 0; // rotation around X (tilt)
    let currentRy = 0; // rotation around Y (pan)
    let targetRx = 0;
    let targetRy = 0;

    // Track mouse to update target rotations
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate normalized offset from center (-0.5 to 0.5)
      const nx = (x / dimensions.width) - 0.5;
      const ny = (y / dimensions.height) - 0.5;
      
      // Set target rotation angles (small range to prevent extreme distortion)
      targetRx = ny * 0.15;
      targetRy = -nx * 0.25;

      setMousePos({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      targetRx = 0;
      targetRy = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Particle system variables
    interface VerticalDataParticle {
      x: number;
      z: number;
      y: number;
      speed: number;
      alpha: number;
      size: number;
    }

    interface BackgroundParticle {
      x: number;
      y: number;
      z: number;
      baseY: number;
      speed: number;
      phase: number;
      alpha: number;
    }

    const verticalParticles: VerticalDataParticle[] = [];
    const bgWaveParticles: BackgroundParticle[] = [];

    // Initialize vertical particles
    const beamCount = 18;
    for (let i = 0; i < beamCount; i++) {
      // Random coordinates inside the central stack core
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 55;
      verticalParticles.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: 60 - Math.random() * 140, // ranges between bottom and top planes
        speed: 1.2 + Math.random() * 1.5,
        alpha: Math.random() * 0.5 + 0.3,
        size: Math.random() * 1.0 + 1.0,
      });
    }

    // Initialize flowing background neural waves (arranged in rows)
    const waveRows = 24;
    const waveCols = 24;
    for (let r = 0; r < waveRows; r++) {
      for (let c = 0; c < waveCols; c++) {
        // Grid spanning from -250 to 250 in isometric space
        const x = -300 + (c / (waveCols - 1)) * 600;
        const z = -300 + (r / (waveRows - 1)) * 600;
        const baseY = 120; // Flowing wave sits under the computing stacks
        bgWaveParticles.push({
          x,
          y: baseY,
          z,
          baseY,
          speed: 0.02 + Math.random() * 0.01,
          phase: (x * 0.01) + (z * 0.01),
          alpha: 0.05 + Math.random() * 0.1, // low opacity, subtle fog
        });
      }
    }

    // 3D Projection Math
    const project = (x: number, y: number, z: number) => {
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2 - 20;

      // 1. Rotate around Y-axis (yaw)
      const cosY = Math.cos(currentRy);
      const sinY = Math.sin(currentRy);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // 2. Rotate around X-axis (pitch)
      const cosX = Math.cos(currentRx);
      const sinX = Math.sin(currentRx);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // 3. Isometric projection angle (30 deg / 0.523 rad)
      const isoAngle = Math.PI / 6;
      const screenX = cx + (x1 - z2) * Math.cos(isoAngle);
      const screenY = cy + (x1 + z2) * Math.sin(isoAngle) + y1;

      // Simple depth value (larger means closer to camera)
      const depth = x1 + z2;

      return { x: screenX, y: screenY, depth };
    };

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.015;

      // Interpolate rotation (smooth damping)
      currentRx += (targetRx - currentRx) * 0.06;
      currentRy += (targetRy - currentRy) * 0.06;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // --- 1. RENDER BACKGROUND WAVE (NEURAL WAVE & PARTICLE FOG) ---
      for (let i = 0; i < bgWaveParticles.length; i++) {
        const p = bgWaveParticles[i];
        
        // 3. Calculate waving height based on sine waves
        // Make it flow across the screen
        p.phase += 0.01;
        const waveHeight = Math.sin(p.phase) * Math.cos(p.phase * 0.5) * 20;
        p.y = p.baseY + waveHeight;

        const proj = project(p.x, p.y, p.z);
        
        // Skip rendering if particle falls out of screen boundaries
        if (proj.x < 0 || proj.x > dimensions.width || proj.y < 0 || proj.y > dimensions.height) {
          continue;
        }

        // Draw background waves
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 2. RENDER INFRASTRUCTURE STACK LAYERS (Back-to-front rendering) ---
      // We will render three layers at different heights:
      // Bottom layer: y = 60
      // Middle layer: y = 0
      // Top layer: y = -60
      
      const layerHeights = [60, 0, -60];
      const layerSize = 110; // Half size of plane

      // Sort layers by depth or simply draw them bottom-up for correct overlap
      for (let l = 0; l < layerHeights.length; l++) {
        const y = layerHeights[l];
        
        // Draw volumetric light beams (vertical shafts connecting planes)
        if (l < layerHeights.length - 1) {
          const yBottom = layerHeights[l];
          const yTop = layerHeights[l + 1];

          // Draw vertical glowing columns in the center
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
          ctx.lineWidth = 1;
          const cornerOffsets = [
            { x: 0, z: 0 },
            { x: -50, z: -50 },
            { x: 50, z: -50 },
            { x: 50, z: 50 },
            { x: -50, z: 50 },
          ];
          cornerOffsets.forEach(offset => {
            const pBot = project(offset.x, yBottom, offset.z);
            const pTop = project(offset.x, yTop, offset.z);
            ctx.beginPath();
            ctx.moveTo(pBot.x, pBot.y);
            ctx.lineTo(pTop.x, pTop.y);
            ctx.stroke();
          });
        }

        // Project plane corners
        const c1 = project(-layerSize, y, -layerSize);
        const c2 = project(layerSize, y, -layerSize);
        const c3 = project(layerSize, y, layerSize);
        const c4 = project(-layerSize, y, layerSize);

        // A. Draw solid semi-transparent backplane (to block items behind it)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c4.x, c4.y);
        ctx.closePath();
        ctx.fill();

        // B. Draw wireframe border (glassy edge)
        ctx.strokeStyle = l === 2 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = l === 2 ? 1.5 : 1;
        ctx.stroke();

        // C. Draw a subtle glowing grid inside each plane
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.5;
        const gridDivisions = 5;
        for (let g = 1; g < gridDivisions; g++) {
          const ratio = -layerSize + (g / gridDivisions) * (layerSize * 2);
          
          // Parallel to X axis
          const px1 = project(-layerSize, y, ratio);
          const px2 = project(layerSize, y, ratio);
          ctx.beginPath();
          ctx.moveTo(px1.x, px1.y);
          ctx.lineTo(px2.x, px2.y);
          ctx.stroke();

          // Parallel to Z axis
          const pz1 = project(ratio, y, -layerSize);
          const pz2 = project(ratio, y, layerSize);
          ctx.beginPath();
          ctx.moveTo(pz1.x, pz1.y);
          ctx.lineTo(pz2.x, pz2.y);
          ctx.stroke();
        }

        // D. Draw dot matrix node points on the planes
        const nodeDivs = 6;
        for (let r = 0; r <= nodeDivs; r++) {
          for (let c = 0; c <= nodeDivs; c++) {
            const px = -layerSize + (c / nodeDivs) * (layerSize * 2);
            const pz = -layerSize + (r / nodeDivs) * (layerSize * 2);
            const projNode = project(px, y, pz);

            // Compute distance to center of plane
            const distToCenter = Math.sqrt(px * px + pz * pz);
            
            if (l === 2) {
              // Top plane: Draw high-density processing core in the center
              if (distToCenter < 60) {
                // Wave pulsing core dots
                const pulse = Math.sin(time * 3 + distToCenter * 0.05) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.5})`;
                ctx.beginPath();
                ctx.arc(projNode.x, projNode.y, 1.25 + pulse * 0.75, 0, Math.PI * 2);
                ctx.fill();
              } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(projNode.x, projNode.y, 0.8, 0, Math.PI * 2);
                ctx.fill();
              }
            } else {
              // Lower planes: static, dimmer dots
              ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
              ctx.beginPath();
              ctx.arc(projNode.x, projNode.y, 0.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // --- 3. RENDER VERTICAL STREAM PARTICLES ---
      for (let i = 0; i < verticalParticles.length; i++) {
        const p = verticalParticles[i];
        // Move particle upward
        p.y -= p.speed;
        
        // Reset particle if it climbs past the top layer (y = -60)
        if (p.y < -65) {
          p.y = 65;
          p.alpha = Math.random() * 0.5 + 0.3;
        }

        const proj = project(p.x, p.y, p.z);
        
        // Glow effect
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw a tail
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.3})`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        const tailProj = project(p.x, p.y + 12, p.z);
        ctx.lineTo(tailProj.x, tailProj.y);
        ctx.stroke();
      }

      // --- 4. RENDER POINTERS TO FLOATING HTML CARDS ---
      // We will draw thin dotted lines from nodes on the planes to the floating cards.
      // Define the target node coordinates in 3D isometric space
      const pointerConnections = [
        {
          from3D: { x: -layerSize, y: -60, z: -layerSize }, // Top plane, back-left corner
          to2D: { x: dimensions.width * 0.16, y: dimensions.height * 0.28 }, // Deploy globally card
        },
        {
          from3D: { x: layerSize, y: -60, z: -layerSize }, // Top plane, back-right corner
          to2D: { x: dimensions.width * 0.84, y: dimensions.height * 0.22 }, // Memory layer card
        },
        {
          from3D: { x: layerSize, y: 0, z: layerSize }, // Middle plane, front-right corner
          to2D: { x: dimensions.width * 0.88, y: dimensions.height * 0.56 }, // Scale instantly card
        },
        {
          from3D: { x: 0, y: 60, z: layerSize }, // Bottom plane, front center node
          to2D: { x: dimensions.width * 0.44, y: dimensions.height * 0.88 }, // Run any model card
        },
        {
          from3D: { x: -layerSize, y: 0, z: layerSize }, // Middle plane, front-left corner
          to2D: { x: dimensions.width * 0.18, y: dimensions.height * 0.65 }, // Agent orchestration card
        }
      ];

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]); // Dotted lines

      pointerConnections.forEach(conn => {
        const fromProj = project(conn.from3D.x, conn.from3D.y, conn.from3D.z);
        
        ctx.beginPath();
        ctx.moveTo(fromProj.x, fromProj.y);
        ctx.lineTo(conn.to2D.x, conn.to2D.y);
        ctx.stroke();

        // Draw a tiny solid white dot on the plane node
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fromProj.x, fromProj.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw a tiny solid white dot on the connection point at the card end
        ctx.beginPath();
        ctx.arc(conn.to2D.x, conn.to2D.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.setLineDash([]); // Reset line dash

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] lg:h-[550px] flex items-center justify-center overflow-visible select-none"
    >
      {/* 3D Canvas Visualizer */}
      <canvas
        ref={canvasRef}
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        className="block bg-transparent"
      />

      {/* Embedded style tag for premium float animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-float-1 { animation: float-1 4.5s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 6s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 5s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 5.5s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 4s ease-in-out infinite; }
      `}} />

      {/* Floating Glassmorphic UI Cards */}
      {/* 1. Deploy Globally */}
      <div
        className="absolute animate-float-1 flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white shadow-xl hover:border-white/30 hover:bg-black/60 transition-all duration-300"
        style={{
          left: '16%',
          top: '28%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-1 rounded bg-white/5 border border-white/10 text-white/70">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Deploy</span>
          <span className="text-xs text-white/95 font-medium tracking-tight whitespace-nowrap">At Global Scale</span>
        </div>
      </div>

      {/* 2. Memory Layer */}
      <div
        className="absolute animate-float-2 flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white shadow-xl hover:border-white/30 hover:bg-black/60 transition-all duration-300"
        style={{
          left: '84%',
          top: '22%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-1 rounded bg-white/5 border border-white/10 text-white/70">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Memory</span>
          <span className="text-xs text-white/95 font-medium tracking-tight whitespace-nowrap">Stateful Layer</span>
        </div>
      </div>

      {/* 3. Scale Instantly */}
      <div
        className="absolute animate-float-3 flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white shadow-xl hover:border-white/30 hover:bg-black/60 transition-all duration-300"
        style={{
          left: '88%',
          top: '56%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-1 rounded bg-white/5 border border-white/10 text-white/70">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Scale</span>
          <span className="text-xs text-white/95 font-medium tracking-tight whitespace-nowrap">In Minutes</span>
        </div>
      </div>

      {/* 4. Run Any Model */}
      <div
        className="absolute animate-float-4 flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white shadow-xl hover:border-white/30 hover:bg-black/60 transition-all duration-300"
        style={{
          left: '44%',
          top: '88%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-1 rounded bg-white/5 border border-white/10 text-white/70">
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Run</span>
          <span className="text-xs text-white/95 font-medium tracking-tight whitespace-nowrap">Any Model</span>
        </div>
      </div>

      {/* 5. Agent Orchestration */}
      <div
        className="absolute animate-float-5 flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white shadow-xl hover:border-white/30 hover:bg-black/60 transition-all duration-300"
        style={{
          left: '18%',
          top: '65%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-1 rounded bg-white/5 border border-white/10 text-white/70">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Orchestrate</span>
          <span className="text-xs text-white/95 font-medium tracking-tight whitespace-nowrap">Agent Routing</span>
        </div>
      </div>
    </div>
  );
}
