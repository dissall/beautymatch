import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Blogger } from '@/types';

interface BloggerCardProps {
  blogger: Blogger;
  index: number;
}

const platformLabels: Record<string, { emoji: string; name: string }> = {
  douyin: { emoji: '🎵', name: '抖音' },
  xiaohongshu: { emoji: '📕', name: '小红书' },
  both: { emoji: '🌟', name: '双平台' },
};

const faceShapeLabels: Record<string, string> = {
  oval: '鹅蛋脸', round: '圆脸', square: '方脸', heart: '瓜子脸', diamond: '菱形脸', long: '长脸',
};

const BloggerCard = memo(function BloggerCard({ blogger, index }: BloggerCardProps) {
  const platform = platformLabels[blogger.platform] || platformLabels.douyin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.6), duration: 0.3 }}
    >
      <Link to={`/blogger/${blogger.id}`} className="block">
        <div className="bg-white rounded-3xl p-5 shadow-lg shadow-pink-100/50 border border-pink-50 hover:shadow-xl hover:shadow-pink-200/50 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-pink-200 shadow-md flex-shrink-0 bg-pink-50">
              <img
                src={blogger.avatar}
                alt={blogger.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blogger.name)}&background=F472B6&color=fff&size=200`;
                }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{blogger.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white bg-gray-800 px-2 py-0.5 rounded-full">
                  {platform.emoji} {platform.name}
                </span>
                <span className="text-xs text-gray-400">{blogger.followers}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-xs bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">
              {faceShapeLabels[blogger.faceFeatures.faceShape] || blogger.faceFeatures.faceShape}
            </span>
            {blogger.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-400 line-clamp-2">{blogger.bio}</p>

          <div className="mt-3 text-right">
            <span className="text-xs text-pink-400 font-medium">查看详情 →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default BloggerCard;
