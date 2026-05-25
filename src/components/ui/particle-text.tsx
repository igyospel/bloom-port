import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  driftPhase: number;
}

export function ParticleText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 160 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Keep aspect ratio roughly 600:160, max height 180
        const height = Math.min(180, width * 0.28);
        setDimensions({ width, height });
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

    // Set up high-DPI display canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = [];
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 60,
    };

    // Offscreen canvas to render text and scan pixels
    const offscreen = document.createElement('canvas');
    // We scan at a fixed resolution for consistent particle density, then map to visual size
    const offWidth = 600;
    const offHeight = 160;
    offscreen.width = offWidth;
    offscreen.height = offHeight;
    const octx = offscreen.getContext('2d');

    if (octx) {
      octx.fillStyle = '#ffffff';
      // Use clean geometric monospace font
      octx.font = '700 42px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      octx.textBaseline = 'top';
      
      // Draw two lines of text
      octx.fillText('high-performance', 5, 20);
      octx.fillText('infrastructure', 5, 78);

      const imgData = octx.getImageData(0, 0, offWidth, offHeight);
      const data = imgData.data;

      // Scan the pixel data
      // Step size controls particle density. 3 is a sweet spot for high density.
      const step = 3; 
      for (let y = 0; y < offHeight; y += step) {
        for (let x = 0; x < offWidth; x += step) {
          const index = (y * offWidth + x) * 4;
          const alpha = data[index + 3];
          if (alpha > 128) {
            particles.push({
              x: x,
              y: y,
              baseX: x,
              baseY: y,
              vx: 0,
              vy: 0,
              size: Math.random() * 0.8 + 0.8, // small delicate dots
              alpha: Math.random() * 0.4 + 0.6,
              driftPhase: Math.random() * Math.PI * 2,
            });
          }
        }
      }
    }

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Compute scale factor from virtual offscreen coordinate space to visible canvas
      const scaleX = dimensions.width / offWidth;
      const scaleY = dimensions.height / offHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Center the particle text in the canvas
      const offsetX = (dimensions.width - offWidth * scale) / 2;
      const offsetY = (dimensions.height - offHeight * scale) / 2;

      // Draw all particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Spring back to base position in virtual coords
        const springForce = 0.08;
        const friction = 0.82;
        p.vx += (p.baseX - p.x) * springForce;
        p.vy += (p.baseY - p.y) * springForce;

        // 2. Mouse interaction
        // Convert mouse position back to virtual coordinate space
        const vMouseX = (mouse.x - offsetX) / scale;
        const vMouseY = (mouse.y - offsetY) / scale;
        
        const dx = vMouseX - p.x;
        const dy = vMouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const virtualRadius = mouse.radius / scale;

        if (dist < virtualRadius) {
          const force = (virtualRadius - dist) / virtualRadius;
          const angle = Math.atan2(dy, dx);
          // Push away
          p.vx -= Math.cos(angle) * force * 1.5;
          p.vy -= Math.sin(angle) * force * 1.5;
        }

        // Apply friction and move
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        // 3. Add a tiny organic background drift (floating point-cloud look)
        const driftX = Math.sin(time + p.driftPhase) * 0.15;
        const driftY = Math.cos(time * 0.8 + p.driftPhase) * 0.15;

        // Render coordinate
        const renderX = offsetX + p.x * scale + driftX * scale;
        const renderY = offsetY + p.y * scale + driftY * scale;

        // Draw particle
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size * Math.max(0.6, scale), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseLeave);
    };
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-start overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        className="block cursor-default"
      />
    </div>
  );
}
