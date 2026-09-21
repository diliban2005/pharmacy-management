import React, { useEffect, useRef } from 'react';

export default function MolecularCanvas({ className = '', interactive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    // Burst particles array
    let burstParticles = [];

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        burstParticles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          decay: Math.random() * 0.03 + 0.015,
          color: Math.random() > 0.5 ? '#00F5A0' : '#00D9F6',
          size: Math.random() * 4 + 2,
        });
      }
    };

    if (interactive) {
      canvas.addEventListener('click', handleClick);
    }

    // Molecular nodes
    const NODE_COUNT = 38;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 3 + 2,
        baseRadius: Math.random() * 3 + 2,
        orbitRadius: Math.random() * 120 + 40,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
        color: Math.random() > 0.4 ? '#00F5A0' : '#00D9F6',
      });
    }

    let capsuleAngle = 0;
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Orbiting Molecular Network
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.orbitAngle += n.orbitSpeed;
        n.x += n.vx;
        n.y += n.vy;

        // Bounce boundaries
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.28;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(0, 245, 160, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Central 3D Translucent Pill Capsule
      capsuleAngle += 0.008;
      const mouseOffsetX = (mouse.x - centerX) * 0.08;
      const mouseOffsetY = (mouse.y - centerY) * 0.08;
      const pillX = centerX + mouseOffsetX;
      const pillY = centerY + mouseOffsetY;

      ctx.save();
      ctx.translate(pillX, pillY);
      ctx.rotate(capsuleAngle + (mouse.x - centerX) * 0.001);

      const pillLength = 90;
      const pillRadius = 24;

      // Glow halo around pill
      const pillGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, pillLength + 20);
      pillGlow.addColorStop(0, 'rgba(0, 245, 160, 0.22)');
      pillGlow.addColorStop(0.6, 'rgba(0, 217, 246, 0.08)');
      pillGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pillGlow;
      ctx.beginPath();
      ctx.arc(0, 0, pillLength + 20, 0, Math.PI * 2);
      ctx.fill();

      // Pill Left Half (Emerald Neon)
      ctx.beginPath();
      ctx.arc(-pillLength / 4, 0, pillRadius, Math.PI / 2, -Math.PI / 2);
      ctx.lineTo(0, -pillRadius);
      ctx.lineTo(0, pillRadius);
      ctx.closePath();
      const gradLeft = ctx.createLinearGradient(-pillLength / 2, -pillRadius, 0, pillRadius);
      gradLeft.addColorStop(0, 'rgba(0, 245, 160, 0.85)');
      gradLeft.addColorStop(1, 'rgba(5, 150, 105, 0.45)');
      ctx.fillStyle = gradLeft;
      ctx.shadowColor = '#00F5A0';
      ctx.shadowBlur = 15;
      ctx.fill();

      // Pill Right Half (Translucent Cyan Glass)
      ctx.beginPath();
      ctx.arc(pillLength / 4, 0, pillRadius, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(0, pillRadius);
      ctx.lineTo(0, -pillRadius);
      ctx.closePath();
      const gradRight = ctx.createLinearGradient(0, -pillRadius, pillLength / 2, pillRadius);
      gradRight.addColorStop(0, 'rgba(0, 217, 246, 0.45)');
      gradRight.addColorStop(1, 'rgba(14, 165, 233, 0.85)');
      ctx.fillStyle = gradRight;
      ctx.shadowColor = '#00D9F6';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Translucent Glass Sheen Reflection
      ctx.beginPath();
      ctx.ellipse(-5, -pillRadius * 0.45, pillLength * 0.38, 4, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();

      // Seam ring
      ctx.beginPath();
      ctx.moveTo(0, -pillRadius);
      ctx.lineTo(0, pillRadius);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // Draw Click Burst Particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= p.decay;

        if (p.life <= 0) {
          burstParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
