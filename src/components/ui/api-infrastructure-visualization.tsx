import React, { useEffect, useRef } from 'react';

export const ApiInfrastructureVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = (e.clientX / window.innerWidth) - 0.5;
      mouseYRef.current = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mesh node configuration
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
      phase: number;
      speed: number;
      size: number;
    }

    interface Packet {
      fromNode: Node;
      toNode: Node;
      progress: number;
      speed: number;
      size: number;
    }

    const w = canvas.offsetWidth || 1200;
    const h = canvas.offsetHeight || 600;

    const nodes: Node[] = [];
    const nodeCount = 50;

    // Initialize nodes scattered in the center & sides
    for (let i = 0; i < nodeCount; i++) {
      const rx = Math.random();
      // Distribute more nodes towards the center/bottom center
      const x = rx * w;
      const y = Math.random() * h;
      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3,
        size: Math.random() * 1.5 + 0.8,
      });
    }

    const packets: Packet[] = [];
    const maxPackets = 20;

    const findConnections = (node: Node) => {
      const connections: Node[] = [];
      const threshold = 180;
      for (const other of nodes) {
        if (other === node) continue;
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.sqrt(dx * dx + dx * dx); // faster approximation or normal dist
        const distance = Math.hypot(dx, dy);
        if (distance < threshold) {
          connections.push(other);
        }
      }
      return connections;
    };

    const draw = () => {
      time += 0.005;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      const targetMouseX = mouseXRef.current * 30;
      const targetMouseY = mouseYRef.current * 30;

      // Update node positions with slow float & mouse offset
      for (const node of nodes) {
        node.x = node.baseX + Math.sin(time * node.speed + node.phase) * 15 + targetMouseX;
        node.y = node.baseY + Math.cos(time * node.speed + node.phase) * 15 + targetMouseY;

        // Draw node
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw grid mesh lines connecting nodes
      const maxDistance = 180;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.055;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Manage and animate data packets
      if (packets.length < maxPackets && Math.random() < 0.04) {
        // Spawn packet
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];
        const possibleTargets = findConnections(startNode);
        if (possibleTargets.length > 0) {
          const endNode = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          packets.push({
            fromNode: startNode,
            toNode: endNode,
            progress: 0,
            speed: 0.01 + Math.random() * 0.015,
            size: Math.random() * 1.5 + 1.0,
          });
        }
      }

      // Draw and update packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const px = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
        const py = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

        // Glowing packet dot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
};
