import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PartRecommendationRef } from '@/types';
import { loadBloggers } from '@/services/bloggerLoader';
import type { Blogger } from '@/types';

interface GranularRecommendationsProps {
  recommendations: PartRecommendationRef[];
}

export default function GranularRecommendations({ recommendations }: GranularRecommendationsProps) {
  const [bloggerMap, setBloggerMap] = useState<Map<string, Blogger>>(new Map());

  useEffect(() => {
    let cancelled = false;
    loadBloggers().then((data) => {
      if (cancelled) return;
      const map = new Map<string, Blogger>();
      for (const b of data) {
        map.set(b.id, b);
      }
      setBloggerMap(map);
    });
    return () => { cancelled = true; };
  }, []);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="mb-10">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-800 text-center mb-3"
      >
        🎯 分部位学习指南
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center text-sm text-gray-400 mb-8"
      >
        每个部位都有最适合你学习的博主，精准提升化妆技巧
      </motion.p>

      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((rec, i) => {
          const bloggers = rec.recommendedBloggerIds
            .map((id) => bloggerMap.get(id))
            .filter(Boolean) as Blogger[];

          return (
            <motion.div
              key={rec.partKey}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.12 }}
            >
              <div className="bg-white rounded-3xl p-5 shadow-lg shadow-pink-100/50 border border-pink-50 h-full">
                {/* Part header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{rec.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{rec.part}</h3>
                    <span className="inline-block bg-pink-50 text-pink-500 text-xs px-2.5 py-0.5 rounded-full font-medium mt-0.5">
                      你的特征：{rec.userFeatureLabel}
                    </span>
                  </div>
                </div>

                {/* Tip */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 mb-4 border border-pink-100">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-semibold text-pink-500">💡 化妆技巧：</span>
                    {rec.tip}
                  </p>
                </div>

                {/* Recommended bloggers for this part */}
                <p className="text-xs text-gray-400 mb-3 font-medium">🎓 推荐学习的博主</p>
                <div className="space-y-3">
                  {bloggers.map((blogger, j) => (
                    <a
                      key={blogger.id}
                      href={blogger.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50/40 hover:bg-pink-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 flex-shrink-0 bg-pink-50">
                        <img
                          src={blogger.avatar}
                          alt={blogger.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blogger.name)}&background=F472B6&color=fff&size=80`;
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-800">
                            {blogger.name}
                          </span>
                          {j === 0 && (
                            <span className="text-xs bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded-full">
                              最推荐
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{blogger.bio}</p>
                      </div>
                      <span className="text-pink-300 group-hover:text-pink-500 transition-colors text-sm flex-shrink-0">
                        去看 →
                      </span>
                    </a>
                  ))}
                </div>

                {/* Why */}
                <p className="text-xs text-gray-400 mt-4 italic">
                  ✦ {rec.why}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
