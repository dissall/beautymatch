import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import type { BloggerMatch } from '@/types';

interface BloggerMatchesProps {
  matches: BloggerMatch[];
}

const platformLabels: Record<string, { emoji: string; name: string; color: string }> = {
  douyin: { emoji: '🎵', name: '抖音', color: 'bg-gray-900' },
  xiaohongshu: { emoji: '📕', name: '小红书', color: 'bg-red-500' },
  both: { emoji: '🌟', name: '双平台', color: 'bg-gradient-to-r from-gray-900 to-red-500' },
};

export default function BloggerMatches({ matches }: BloggerMatchesProps) {
  if (matches.length === 0) return null;

  return (
    <section className="mb-10">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-800 text-center mb-6"
      >
        👩‍🎤 与你相似的博主
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6">
        {matches.map((match, i) => {
          const platform = platformLabels[match.blogger.platform] || platformLabels.douyin;
          const isTop = i === 0;

          return (
            <motion.div
              key={match.blogger.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + i * 0.15 }}
            >
              <Card className={`relative overflow-hidden ${isTop ? 'ring-2 ring-pink-300' : ''}`}>
                {isTop && (
                  <div className="absolute -top-1 right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-b-lg font-bold">
                    🥇 最佳匹配
                  </div>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg mb-3">
                    <img
                      src={match.blogger.avatar}
                      alt={match.blogger.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.blogger.name)}&background=F472B6&color=fff&size=200`;
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{match.blogger.name}</h3>
                  <span className={`text-xs text-white px-2 py-0.5 rounded-full mt-1 ${platform.color}`}>
                    {platform.emoji} {platform.name}
                  </span>
                </div>

                {/* Similarity score */}
                <div className="text-center mb-4">
                  <motion.div
                    className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.15, type: 'spring' }}
                  >
                    {match.similarity}%
                  </motion.div>
                  <div className="text-xs text-gray-400">相似度</div>
                </div>

                {/* Match reasons */}
                <div className="space-y-1.5 mb-4">
                  {match.matchReasons.map((reason, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-pink-400">✦</span>
                      {reason}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {match.blogger.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-gray-400 text-center mb-4">
                  {match.blogger.bio}
                </p>

                {/* Platform links */}
                <div className="flex gap-2">
                  <a
                    href={match.blogger.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-medium py-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                  >
                    {match.blogger.platform === 'xiaohongshu' ? '📕 去小红书看' : '🎵 去抖音看'}
                  </a>
                  {match.blogger.platform === 'both' && (
                    <a
                      href={`https://www.xiaohongshu.com/user/profile/${match.blogger.platformId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-xs font-medium py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      📕 去小红书看
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
