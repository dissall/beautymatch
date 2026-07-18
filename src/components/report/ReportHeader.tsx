import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types';

interface ReportHeaderProps {
  result: AnalysisResult;
}

export default function ReportHeader({ result }: ReportHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-4 inline-block"
      >
        ✨
      </motion.div>

      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent mb-4">
        你的专属妆造报告
      </h1>

      {/* Photo display */}
      {result.imageDataUrl && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-pink-200 shadow-xl shadow-pink-200/50"
        >
          <img
            src={result.imageDataUrl}
            alt="分析照片"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Compliment */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 rounded-3xl p-6 md:p-8 border border-pink-100">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-1 text-xs text-pink-400 border border-pink-100 shadow-sm flex items-center gap-1.5">
            💌 整体评价
            {result.aiCompliment && (
              <span className="bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full text-[10px]">AI专属</span>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed text-sm md:text-base pt-2">
            {result.compliment}
          </p>
        </div>
      </motion.div>

      {/* Report date */}
      <p className="mt-4 text-xs text-gray-400">
        分析时间：{new Date(result.createdAt).toLocaleString('zh-CN')}
      </p>
    </motion.div>
  );
}
