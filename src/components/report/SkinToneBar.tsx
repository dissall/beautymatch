import { motion } from 'framer-motion';
import type { SkinTone } from '@/types';
import { getSkinColorInfo } from '@/utils/color';

interface SkinToneBarProps {
  skinTone: SkinTone;
  rgb?: { r: number; g: number; b: number };
}

export default function SkinToneBar({ skinTone, rgb }: SkinToneBarProps) {
  const info = getSkinColorInfo(skinTone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-white rounded-3xl p-6 shadow-lg shadow-pink-100/50 border border-pink-50"
    >
      <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
        🎨 肤色分析
      </h3>

      {/* Color display */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {rgb && (
          <div
            className="w-20 h-20 rounded-full border-4 border-pink-200 shadow-lg"
            style={{ backgroundColor: `rgb(${rgb.r},${rgb.g},${rgb.b})` }}
          />
        )}
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-600">{info.label}</div>
          <div className="text-sm text-gray-400 mt-1">{info.description}</div>
        </div>
      </div>

      {/* Skin tone gradient bar */}
      <div className="max-w-md mx-auto">
        <div className="flex rounded-full overflow-hidden h-8 shadow-inner mb-4">
          {[
            { label: '冷白', color: '#FDE8E9' },
            { label: '暖白', color: '#FDEAD5' },
            { label: '中性', color: '#F5E0CD' },
            { label: '暖黄', color: '#F0D5A8' },
            { label: '小麦', color: '#D4A574' },
          ].map((tone) => (
            <motion.div
              key={tone.label}
              className="flex-1 relative"
              style={{ backgroundColor: tone.color }}
              whileHover={{ scale: 1.1 }}
            >
              {info.label.includes(tone.label) && (
                <motion.div
                  layoutId="skinToneIndicator"
                  className="absolute -top-1 -bottom-1 left-0 right-0 border-2 border-pink-500 rounded-full z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 px-1">
          <span>冷白皮</span>
          <span>暖白皮</span>
          <span>中性皮</span>
          <span>暖黄皮</span>
          <span>小麦色</span>
        </div>
      </div>

      {/* Suitable colors */}
      <div className="mt-6">
        <p className="text-sm text-gray-500 text-center mb-3">适合你的妆容色调</p>
        <div className="flex justify-center gap-3">
          {info.suitableColors.map((color, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
              className="w-8 h-8 rounded-full shadow-md border-2 border-white"
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.3 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
