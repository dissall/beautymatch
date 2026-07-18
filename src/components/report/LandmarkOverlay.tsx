import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { FaceLandmark } from '@/types';

interface LandmarkOverlayProps {
  imageDataUrl: string;
  landmarks: FaceLandmark[];
  detectionBox: { x: number; y: number; width: number; height: number } | null;
  imageWidth: number;
  imageHeight: number;
}

// Groups of landmarks to render with distinct colors
const GROUPS = [
  { indices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], color: '#10B981', label: '脸型轮廓' },   // green: jawline
  { indices: [17,18,19,20,21,22,23,24,25,26], color: '#F59E0B', label: '眉骨' },                  // amber: eyebrows
  { indices: [27,28,29,30,31,32,33,34,35], color: '#EF4444', label: '鼻梁' },                     // red: nose
  { indices: [36,37,38,39,40,41,42,43,44,45,46,47], color: '#8B5CF6', label: '眼部' },           // purple: eyes
  { indices: [48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67], color: '#EC4899', label: '唇部' }, // pink: lips
];

// Key measurement lines to draw
function getMeasurementLines(landmarks: FaceLandmark[]) {
  const lm = landmarks;
  return [
    { from: 0, to: 16, label: '面宽', color: '#F59E0B', offsetY: -5 },
    { from: 27, to: 8, label: '面高', color: '#F59E0B', offsetX: -5 },
    { from: 36, to: 39, label: '眼宽', color: '#8B5CF6', offsetY: -5 },
    { from: 31, to: 35, label: '鼻宽', color: '#EF4444', offsetY: -5 },
    { from: 48, to: 54, label: '唇宽', color: '#EC4899', offsetY: 5 },
  ];
}

export default function LandmarkOverlay({ imageDataUrl, landmarks, detectionBox, imageWidth, imageHeight }: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 400 });
  const [showLabels, setShowLabels] = useState(true);
  const [showBox, setShowBox] = useState(true);

  // Responsive canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const maxW = Math.min(container.clientWidth - 32, 700);
    const ratio = imageHeight / imageWidth;
    const w = maxW;
    const h = w * ratio;
    setCanvasSize({ w: Math.round(w), h: Math.round(h) });
  }, [imageWidth, imageHeight]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = canvasSize;
    canvas.width = w;
    canvas.height = h;

    const scaleX = w / imageWidth;
    const scaleY = h / imageHeight;

    // Draw image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Draw detection bounding box
      if (showBox && detectionBox) {
        const bx = detectionBox.x * scaleX;
        const by = detectionBox.y * scaleY;
        const bw = detectionBox.width * scaleX;
        const bh = detectionBox.height * scaleY;
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);

        // Box label
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('AI检测区域', bx + 4, by - 6);
      }

      // Draw each group of landmarks
      for (const group of GROUPS) {
        const points = group.indices
          .map((i) => landmarks[i])
          .filter(Boolean);

        if (points.length === 0) continue;

        // Draw connecting lines
        ctx.beginPath();
        ctx.strokeStyle = group.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i]!;
          const p2 = points[i + 1]!;
          if (i === 0) ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
          ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw dots
        for (const p of points) {
          ctx.beginPath();
          ctx.fillStyle = group.color;
          ctx.arc(p.x * scaleX, p.y * scaleY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // White border
          ctx.beginPath();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.arc(p.x * scaleX, p.y * scaleY, 2.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw measurement lines
      if (showLabels) {
        const measLines = getMeasurementLines(landmarks);
        for (const ml of measLines) {
          const p1 = landmarks[ml.from];
          const p2 = landmarks[ml.to];
          if (!p1 || !p2) continue;

          const x1 = p1.x * scaleX;
          const y1 = p1.y * scaleY + (ml.offsetY || 0);
          const x2 = p2.x * scaleX + (ml.offsetX || 0);
          const y2 = p2.y * scaleY + (ml.offsetY || 0);

          ctx.beginPath();
          ctx.strokeStyle = ml.color;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrow heads
          const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const dx = (dist > 0) ? (x2 - x1) / dist : 1;
          const dy = (dist > 0) ? (y2 - y1) / dist : 0;

          // Small arrows at both ends
          for (const [sx, sy, sign] of [[x1, y1, 1], [x2, y2, -1]]) {
            ctx.beginPath();
            ctx.fillStyle = ml.color;
            const arrowSize = 4;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - dx * arrowSize * sign - dy * arrowSize, sy - dy * arrowSize * sign + dx * arrowSize);
            ctx.lineTo(sx - dx * arrowSize * sign + dy * arrowSize, sy - dy * arrowSize * sign - dx * arrowSize);
            ctx.fill();
          }

          // Label
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2 - 8;
          const text = ml.label;
          ctx.font = 'bold 11px sans-serif';
          const textW = ctx.measureText(text).width;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillRect(midX - textW / 2 - 4, midY - 10, textW + 8, 16);
          ctx.fillStyle = ml.color;
          ctx.fillText(text, midX - textW / 2, midY + 1);
        }
      }
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, landmarks, detectionBox, imageWidth, imageHeight, canvasSize, showLabels, showBox]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-3xl p-4 shadow-lg shadow-pink-100/50 border border-pink-50"
    >
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🤖 AI 面部特征可视化
        </h3>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-3.5 h-3.5 accent-pink-500"
            />
            标注线
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBox}
              onChange={(e) => setShowBox(e.target.checked)}
              className="w-3.5 h-3.5 accent-pink-500"
            />
            检测框
          </label>
        </div>
      </div>

      <div ref={containerRef} className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="rounded-2xl max-w-full h-auto"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {GROUPS.map((g) => (
          <div key={g.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
            {g.label}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        基于 68 点面部特征检测 · 彩色圆点为 AI 定位的关键特征点
      </p>
    </motion.div>
  );
}
