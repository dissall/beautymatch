import { motion } from 'framer-motion';
import { useMemo } from 'react';

const complimentEndings = [
  '你就是独一无二的美！✨',
  '你的美，不需要被定义 💖',
  '自信的你，就是最美的妆容 🌸',
  '每个女孩都是自己的美妆大师 💫',
  '美，从来不是千篇一律 🎀',
];

const confidenceBoosters = [
  '今天的你，比昨天更了解自己了呢～',
  '知道了自己的优势，化妆就更有方向啦！',
  '美丽的第一步，就是认识自己',
  '最好的妆容，是自信的笑容',
];

interface ComplimentTextProps {
  compliment?: string;
}

export default function ComplimentText({ compliment }: ComplimentTextProps) {
  const randomEnding = useMemo(
    () => complimentEndings[Math.floor(Math.random() * complimentEndings.length)],
    []
  );

  const randomBooster = useMemo(
    () => confidenceBoosters[Math.floor(Math.random() * confidenceBoosters.length)],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="text-center py-8"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 2 }}
        className="text-4xl mb-4"
      >
        💖
      </motion.div>

      {compliment && (
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-4">
          {compliment}
        </p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-pink-500 font-semibold text-lg"
      >
        {randomEnding}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.3 }}
        className="text-gray-400 text-sm mt-3"
      >
        💡 {randomBooster}
      </motion.p>
    </motion.div>
  );
}
