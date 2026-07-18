import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

const progressTips = [
  { min: 0, max: 15, tip: 'AI正在初始化模型，请稍等... ⏳' },
  { min: 15, max: 35, tip: '正在定位你的脸部位置 🔍' },
  { min: 35, max: 55, tip: '提取面部特征点中... 就像化妆师在观察你 👀' },
  { min: 55, max: 75, tip: '测量三庭五眼黄金比例 📐' },
  { min: 75, max: 90, tip: '分析肤色和五官特征 🎨' },
  { min: 90, max: 99, tip: '匹配最适合你的妆造风格 💄' },
  { min: 99, max: 100, tip: '马上就好！✨' },
];

const funFacts = [
  '你知道吗？鹅蛋脸是东方审美中的完美脸型 🥚',
  '三庭五眼是古代画家衡量面部比例的黄金标准 📏',
  '杏仁眼被认为是最百搭的眼型 👁️',
  '每个人的脸都是独一无二的艺术品 🎨',
  '合适的妆容可以突出你最美的特征 💫',
];

export default function AnalysisProgress() {
  const { analysisProgress, analysisMessage } = useAppStore();

  const currentTip = progressTips.find(
    (t) => analysisProgress >= t.min && analysisProgress < t.max
  );
  const randomFact = funFacts[Math.floor(analysisProgress / 10) % funFacts.length];

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      {/* Animated character */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-8xl mb-8"
      >
        🔍
      </motion.div>

      {/* Progress circle */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="#FDE8F0"
            strokeWidth="8"
          />
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            animate={{
              strokeDashoffset: 2 * Math.PI * 42 * (1 - analysisProgress / 100),
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={Math.floor(analysisProgress)}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-pink-500"
          >
            {analysisProgress}%
          </motion.span>
        </div>
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={analysisMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-medium text-gray-700 mb-4"
        >
          {analysisMessage}
        </motion.p>
      </AnimatePresence>

      {/* Tip card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="inline-block bg-pink-50 rounded-2xl px-6 py-3 text-sm text-pink-600 mb-6"
      >
        {currentTip?.tip}
      </motion.div>

      {/* Fun fact */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-gray-400 text-xs italic"
      >
        💡 {randomFact}
      </motion.div>

      {/* Spinning dots */}
      <div className="flex justify-center gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-pink-300"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
