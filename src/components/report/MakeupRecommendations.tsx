import { motion } from 'framer-motion';
import { useState } from 'react';
import Card from '@/components/common/Card';
import type { MakeupRecommendation } from '@/types';

interface MakeupRecommendationsProps {
  recommendations: MakeupRecommendation[];
}

export default function MakeupRecommendations({ recommendations }: MakeupRecommendationsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (recommendations.length === 0) return null;

  return (
    <section className="mb-10">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-800 text-center mb-6"
      >
        💄 推荐妆造风格
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.style}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.15 }}
          >
            <Card className="h-full">
              <div className="text-center mb-4">
                <motion.div
                  className="text-5xl mb-3"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {rec.icon}
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800">{rec.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                <div className="inline-block mt-2 bg-pink-50 rounded-full px-3 py-1 text-xs text-pink-500">
                  {rec.suitable}
                </div>
              </div>

              {/* Expand/collapse steps */}
              <button
                onClick={() => setExpanded(expanded === rec.style ? null : rec.style)}
                className="w-full text-center text-sm text-pink-500 hover:text-pink-600 font-medium py-2 transition-colors"
              >
                {expanded === rec.style ? '收起步骤 ▲' : '查看化妆步骤 ▼'}
              </button>

              {expanded === rec.style && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 mt-2"
                >
                  {rec.steps.map((step) => (
                    <div key={step.order} className="bg-pink-50/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 bg-pink-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {step.order}
                        </span>
                        <span className="font-semibold text-sm text-gray-700">{step.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-7">{step.description}</p>
                      {step.tips && (
                        <p className="text-xs text-pink-400 ml-7 mt-1">💡 {step.tips}</p>
                      )}
                      {step.products.length > 0 && (
                        <div className="flex flex-wrap gap-1 ml-7 mt-2">
                          {step.products.map((p) => (
                            <span key={p} className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-400 border border-pink-100">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
