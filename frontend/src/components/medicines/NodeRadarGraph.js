import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Layers, Search, Eye } from 'lucide-react';
import SoundFX from '../../utils/SoundFX';

export default function NodeRadarGraph({
  medicines = [],
  onSelectMedicine,
  className = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hudPos, setHudPos] = useState({ x: 0, y: 0 });
  const [searchFilter, setSearchFilter] = useState('');

  const nodesRef = useRef([]);
  const hubsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = (canvas.width = containerRef.current?.clientWidth || 900);
    const height = (canvas.height = 540);

    // Group medicines into hubs
    const categories = Array.from(
      new Set(medicines.map((m) => m.category || m.therapeuticClass || 'General Medicine'))
    ).slice(0, 6);

    const centerX = width / 2;
    const centerY = height / 2;
    const hubRadius = Math.min(width, height) * 0.35;

    // Build hubs in a circular arrangement
    const hubs = categories.map((cat, i) => {
      const angle = (i / categories.length) * Math.PI * 2;
      return {
        id: `hub-${i}`,
        name: cat,
        x: centerX + Math.cos(angle) * hubRadius,
        y: centerY + Math.sin(angle) * hubRadius,
        color: ['#00F5A0', '#00D9F6', '#3B82F6', '#A855F7', '#EC4899', '#F59E0B'][i % 6],
      };
    });
    hubsRef.current = hubs;

    // Build medicine nodes connected to hubs
    const medNodes = medicines.slice(0, 36).map((med, idx) => {
      const hub =
        hubs.find((h) => h.name === (med.category || med.therapeuticClass)) ||
        hubs[idx % hubs.length];

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 75 + 25;

      const isOutOfStock = med.quantity <= 0;
      const isLow = med.quantity > 0 && med.quantity <= 10;
      const glowColor = isOutOfStock
        ? '#EF4444'
        : isLow
        ? '#F59E0B'
        : '#00F5A0';

      return {
        ...med,
        hubId: hub.id,
        x: hub.x + Math.cos(angle) * dist,
        y: hub.y + Math.sin(angle) * dist,
        targetX: hub.x + Math.cos(angle) * dist,
        targetY: hub.y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: 9,
        glowColor,
        orbitAngle: angle,
        orbitSpeed: (Math.random() - 0.5) * 0.015,
        orbitDist: dist,
      };
    });
    nodesRef.current = medNodes;

    let animId;
    let pulsePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      pulsePhase += 0.05;

      // Draw radar background concentric circles
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 245, 160, 0.07)';
      ctx.lineWidth = 1;
      [hubRadius * 0.4, hubRadius * 0.8, hubRadius * 1.2].forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Radar rotating sweep line
      const sweepAngle = pulsePhase * 0.4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * hubRadius * 1.3,
        centerY + Math.sin(sweepAngle) * hubRadius * 1.3
      );
      ctx.strokeStyle = 'rgba(0, 217, 246, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Draw Hubs & connections to their nodes
      hubs.forEach((hub) => {
        // Draw hub center
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fill();
        ctx.strokeStyle = hub.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = hub.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Hub text
        ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(hub.name, hub.x, hub.y + 28);
      });

      // Update & render medicine nodes
      medNodes.forEach((node) => {
        const hub = hubs.find((h) => h.id === node.hubId);
        if (hub) {
          node.orbitAngle += node.orbitSpeed;
          node.x = hub.x + Math.cos(node.orbitAngle) * node.orbitDist;
          node.y = hub.y + Math.sin(node.orbitAngle) * node.orbitDist;

          // Draw connection strand
          ctx.beginPath();
          ctx.moveTo(hub.x, hub.y);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        const isFiltered =
          searchFilter &&
          !node.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
          !node.genericName?.toLowerCase().includes(searchFilter.toLowerCase());

        const isCurrentHover = hoveredNode?._id === node._id;

        // Draw node body
        ctx.beginPath();
        ctx.arc(node.x, node.y, isCurrentHover ? 13 : node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isFiltered ? 'rgba(51, 65, 85, 0.4)' : 'rgba(22, 31, 51, 0.95)';
        ctx.fill();

        // Node Glow Ring
        ctx.strokeStyle = isFiltered ? 'rgba(71, 85, 105, 0.3)' : node.glowColor;
        ctx.lineWidth = isCurrentHover ? 3 : 2;
        ctx.shadowColor = node.glowColor;
        ctx.shadowBlur = isCurrentHover ? 20 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Core pill dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = isFiltered ? '#64748B' : '#FFFFFF';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [medicines, searchFilter, hoveredNode]);

  // Mouse Interaction: Hover and Click
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const found = nodesRef.current.find((n) => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) < n.radius + 6;
    });

    if (found) {
      if (hoveredNode?._id !== found._id) SoundFX.playClick();
      setHoveredNode(found);
      setHudPos({ x: found.x, y: found.y });
    } else {
      setHoveredNode(null);
    }
  };

  const handleClick = () => {
    if (hoveredNode && onSelectMedicine) {
      SoundFX.playClick();
      onSelectMedicine(hoveredNode);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`cyber-card relative overflow-hidden p-6 space-y-4 ${className}`}
    >
      {/* Top Header & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald flex items-center justify-center shadow-glow-emerald">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Visual Spatial Node Radar
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                Interactive Force Graph
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Floating formulation nodes grouped by therapeutic category hubs
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Highlight node..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative min-h-[480px] bg-void-950/90 rounded-2xl overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="w-full h-[500px] cursor-crosshair block"
        />

        {/* Legend */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 text-[10px] font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 backdrop-blur-md">
          <span className="flex items-center gap-1.5 text-cyber-emerald">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald shadow-glow-emerald" /> High Stock
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Reorder Soon
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-crimson" /> Critical / Rx
          </span>
        </div>

        {/* Floating HUD Radar Card on Node Hover */}
        {hoveredNode && (
          <div
            className="absolute z-30 pointer-events-none p-3.5 rounded-2xl bg-void-900/95 border border-cyber-emerald/50 shadow-glass-lg backdrop-blur-xl text-xs space-y-2 max-w-xs transition-all duration-75 animate-fade-in"
            style={{
              left: Math.min(hudPos.x + 18, (containerRef.current?.clientWidth || 800) - 240),
              top: Math.max(hudPos.y - 70, 10),
            }}
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-black text-white leading-tight truncate">
                {hoveredNode.name}
              </span>
              <span
                className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                  hoveredNode.requiresPrescription
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                    : 'bg-emerald-950 text-cyber-emerald border border-cyber-emerald/50'
                }`}
              >
                {hoveredNode.requiresPrescription ? 'Rx' : 'OTC'}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <p className="text-slate-400 truncate">
                Formula: <span className="text-slate-200">{hoveredNode.genericName}</span>
              </p>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                <span className="text-slate-400">
                  Stock: <strong className="text-white font-mono">{hoveredNode.quantity} units</strong>
                </span>
                <span className="font-bold text-cyber-emerald font-mono">
                  ₹{hoveredNode.sellingPrice?.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-cyber-cyan font-mono pt-1">
                📍 Shelf: Bay {hoveredNode.shelfLocation || 'A-02'} • Batch: #{hoveredNode.batchNumber || 'B2026'}
              </p>
            </div>

            <div className="text-[10px] text-cyber-emerald font-bold flex items-center gap-1 pt-1">
              <Eye className="w-3 h-3" /> Click node to inspect details drawer
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
