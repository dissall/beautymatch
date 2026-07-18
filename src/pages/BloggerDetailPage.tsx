import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadBloggers } from '@/services/bloggerLoader';
import type { Blogger } from '@/types';

const faceShapeLabels: Record<string, string> = {
  oval: '鹅蛋脸', round: '圆脸', square: '方脸', heart: '瓜子脸', diamond: '菱形脸', long: '长脸',
};
const eyeLabels: Record<string, string> = {
  almond: '杏仁眼', round: '圆眼', phoenix: '丹凤眼', peach: '桃花眼', droopy: '下垂眼', upturned: '上挑眼',
};
const skinLabels: Record<string, string> = {
  cool_white: '冷白皮', warm_white: '暖白皮', neutral: '中性皮', warm_yellow: '暖黄皮', wheat: '小麦色',
};

export default function BloggerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blogger, setBlogger] = useState<Blogger | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadBloggers().then((data) => {
      if (cancelled) return;
      const found = data.find((b) => b.id === id);
      if (found) {
        setBlogger(found);
      } else {
        navigate('/bloggers');
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          💄
        </motion.div>
      </div>
    );
  }

  if (!blogger) return null;

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/bloggers"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-500 mb-6 transition-colors"
        >
          ← 返回博主库
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-pink-100/50 border border-pink-50"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
              <img
                src={blogger.avatar}
                alt={blogger.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blogger.name)}&background=F472B6&color=fff&size=200`;
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{blogger.name}</h1>
              <p className="text-gray-400 mb-3">{blogger.bio}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="text-sm bg-gray-900 text-white px-3 py-1 rounded-full">
                  {blogger.platform === 'both' ? '🎵📕 抖音+小红书' : blogger.platform === 'douyin' ? '🎵 抖音' : '📕 小红书'}
                </span>
                <span className="text-sm bg-pink-50 text-pink-500 px-3 py-1 rounded-full">
                  {blogger.followers} 粉丝
                </span>
              </div>
              <a
                href={blogger.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-shadow"
              >
                {blogger.platform === 'xiaohongshu' ? '📕 去小红书关注' : '🎵 去抖音关注'}
              </a>
            </div>
          </div>

          {/* Face Features */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 面部特征（AI 分析数据）</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: '脸型', value: faceShapeLabels[blogger.faceFeatures.faceShape] },
                { label: '眼型', value: eyeLabels[blogger.faceFeatures.eyeShape] },
                { label: '鼻型', value: getNoseLabel(blogger.faceFeatures.noseShape) },
                { label: '唇型', value: getLipLabel(blogger.faceFeatures.lipShape) },
                { label: '肤色', value: skinLabels[blogger.faceFeatures.skinTone] },
                { label: '下颌', value: blogger.faceFeatures.jawline === 'v_shape' ? 'V型' : blogger.faceFeatures.jawline === 'angular' ? '棱角型' : '圆润型' },
                { label: '颧骨', value: blogger.faceFeatures.cheekbone === 'prominent' ? '突出' : blogger.faceFeatures.cheekbone === 'moderate' ? '适中' : '平缓' },
                { label: '眉眼距', value: blogger.faceFeatures.browDistance === 'close' ? '偏近' : blogger.faceFeatures.browDistance === 'far' ? '偏远' : '适中' },
                { label: '人中', value: blogger.faceFeatures.philtrum === 'short' ? '偏短' : blogger.faceFeatures.philtrum === 'long' ? '偏长' : '适中' },
                { label: '三庭比例', value: `上${blogger.analyzedProportions.upperThird}% 中${blogger.analyzedProportions.middleThird}% 下${blogger.analyzedProportions.lowerThird}%` },
              ].map((item) => (
                <div key={item.label} className="bg-pink-50/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-pink-400 mb-1">{item.label}</div>
                  <div className="font-semibold text-gray-700 text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Proportions detail */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📐 精确比例数据</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '面宽高比', value: blogger.analyzedProportions.faceWidthHeightRatio },
                { label: '下颌/额头比', value: blogger.analyzedProportions.jawForeheadRatio },
                { label: '颧骨宽度比', value: blogger.analyzedProportions.cheekboneWidthRatio },
                { label: '左眼宽度指数', value: blogger.analyzedProportions.leftEyeWidth },
                { label: '右眼宽度指数', value: blogger.analyzedProportions.rightEyeWidth },
              ].map((item) => (
                <div key={item.label} className="bg-purple-50/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-purple-400 mb-1">{item.label}</div>
                  <div className="font-semibold text-gray-700 text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏷️ 风格标签</h2>
            <div className="flex flex-wrap gap-2">
              {blogger.tags.map((tag) => (
                <span key={tag} className="text-sm bg-pink-50 text-pink-500 px-4 py-1.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getNoseLabel(shape: string): string {
  const map: Record<string, string> = {
    standard: '标准鼻', flat: '塌鼻', aquiline: '鹰钩鼻', bulbous: '蒜头鼻', upturned_nose: '朝天鼻',
  };
  return map[shape] || shape;
}

function getLipLabel(shape: string): string {
  const map: Record<string, string> = {
    standard: '标准唇', thin: '薄唇', thick: '厚唇', smiling: '微笑唇', droopy_lip: '下垂唇',
  };
  return map[shape] || shape;
}
