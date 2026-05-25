import { useEffect, useRef } from 'react';

export function OrbitalClusterVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = canvas.offsetHeight || 200);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 300;
      height = canvas.height = canvas.offsetHeight || 200;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;
    const numRings = 3;
    const dotsPerRing = 48;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.008;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw central faint glow core
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
      coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Draw rings in perspective
      for (let r = 0; r < numRings; r++) {
        // Different rotation speed and angle tilt for each ring
        const radiusX = 65 + r * 22;
        const radiusY = 16 + r * 6;
        const speed = 0.5 * (1 - r * 0.2);
        const tiltAngle = (r * Math.PI) / 6;

        for (let i = 0; i < dotsPerRing; i++) {
          const angle = (i / dotsPerRing) * Math.PI * 2 + time * speed;
          
          // Calculate raw ellipse position
          const rx = Math.cos(angle) * radiusX;
          const ry = Math.sin(angle) * radiusY;

          // Apply rotation tilt transformation (3D simulation)
          const px = rx * Math.cos(tiltAngle) - ry * Math.sin(tiltAngle) + centerX;
          const py = rx * Math.sin(tiltAngle) + ry * Math.cos(tiltAngle) + centerY;

          // Alpha coordinates (simulate depth: fade as it goes behind the core)
          const isBehind = Math.sin(angle) < 0;
          const depthAlpha = isBehind ? 0.04 : 0.22;
          const alpha = depthAlpha * (1 - r * 0.15);

          if (alpha <= 0 || px < 0 || px > width || py < 0 || py > height) continue;

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          const size = isBehind ? 0.8 : 1.2;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 select-none z-0"
    />
  );
}
export default OrbitalClusterVisualization;
