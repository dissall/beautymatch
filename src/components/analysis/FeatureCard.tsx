import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import type { FeatureCardData } from '@/types';

interface FeatureCardProps {
  data: FeatureCardData;
  index: number;
}

export default function FeatureCard({ data, index }: FeatureCardProps) {
  return (
    <Card delay={index * 0.1}>
      <div className="text-center">
        <motion.div
          className="text-5xl mb-3"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {data.icon}
        </motion.div>
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2">
          {data.type}
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">{data.label}</h3>
        <div className="inline-block bg-pink-50 rounded-full px-4 py-1 text-sm font-semibold text-pink-600 mb-2">
          {data.value}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{data.description}</p>
      </div>
    </Card>
  );
}
