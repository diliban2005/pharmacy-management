import React, { useEffect, useRef, useState } from 'react';

export default function TrailingCursor() {
  const canvasRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -100, y: -100, targetX: -100, targetY: -100, isHovering: false };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      // Check if hovering over clickable element
      const target = e.target;
      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('.subtab-btn') ||
        target.closest('.clickable-node') ||
        target.closest('.cursor-pointer');
      mouse.isHovering = !!isInteractive;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Trail history
    const trail = [];
    const maxTrail = 14;

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Spring lerp towards target
      mouse.x += (mouse.targetX - mouse.x) * 0.22;
      mouse.y += (mouse.targetY - mouse.y) * 0.22;

      trail.unshift({ x: mouse.x, y: mouse.y });
      if (trail.length > maxTrail) trail.pop();

      // Draw trailing line
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = mouse.isHovering
          ? 'rgba(0, 245, 160, 0.45)'
          : 'rgba(0, 217, 246, 0.25)';
        ctx.lineWidth = mouse.isHovering ? 3.5 : 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Draw primary glow halo
      if (mouse.x > 0 && mouse.y > 0) {
        const radius = mouse.isHovering ? 20 : 10;
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          radius * 2
        );
        gradient.addColorStop(0, mouse.isHovering ? 'rgba(0, 245, 160, 0.6)' : 'rgba(0, 217, 246, 0.5)');
        gradient.addColorStop(0.5, mouse.isHovering ? 'rgba(0, 245, 160, 0.2)' : 'rgba(0, 217, 246, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.isHovering ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00F5A0';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ opacity: 0.95 }}
    />
  );
}
