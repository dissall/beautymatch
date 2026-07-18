import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import type { AnalysisResult, FeatureCardData } from '@/types';

const featureMeta: Record<string, { type: string; iconMap: Record<string, string>; descMap: Record<string, string> }> = {
  faceShape: {
    type: '脸型',
    iconMap: {
      oval: '🥚', round: '⭕', square: '⬜', heart: '💜', diamond: '💎', long: '📏',
    },
    descMap: {
      oval: '线条流畅柔和，是最完美的脸型', round: '胶原蛋白满满，超显年轻', square: '下颌分明，高级超模脸',
      heart: '上宽下窄，精致瓜子脸', diamond: '颧骨立体，超模标配', long: '气质优雅，古典美人',
    },
  },
  eyeShape: {
    type: '眼型',
    iconMap: {
      almond: '👁️', round: '👀', phoenix: '🦅', peach: '🌸', droopy: '🥺', upturned: '😼',
    },
    descMap: {
      almond: '眼型完美，任何眼妆都能驾驭', round: '清澈明亮，少女感满满', phoenix: '冷艳气质，中式妆绝配',
      peach: '自带笑意，让人心动', droopy: '无辜亲切，日系标配', upturned: '妩媚电力，猫眼妆神级底子',
    },
  },
  noseShape: {
    type: '鼻型',
    iconMap: {
      standard: '👃', flat: '🫧', aquiline: '🦅', bulbous: '🔴', upturned_nose: '🐽',
    },
    descMap: {
      standard: '鼻梁挺直，侧面气质满分', flat: '小巧精致，搭配妆容更立体', aquiline: '高挺异域风情，超模标志',
      bulbous: '圆润亲和，可爱满分', upturned_nose: '微翘活泼，少女感十足',
    },
  },
  lipShape: {
    type: '唇型',
    iconMap: {
      standard: '👄', thin: '💋', thick: '🫦', smiling: '😊', droopy_lip: '😔',
    },
    descMap: {
      standard: '比例完美，各种唇妆都能驾驭', thin: '干练知性，浅色更显气质', thick: '饱满性感，欧美妆天然优势',
      smiling: '自然上扬，给人温暖感觉', droopy_lip: '搭配上扬画法更精神',
    },
  },
  skinTone: {
    type: '肤色',
    iconMap: {
      cool_white: '☁️', warm_white: '🌟', neutral: '🤍', warm_yellow: '🌻', wheat: '🌾',
    },
    descMap: {
      cool_white: '白皙粉调，粉色妆容最适合', warm_white: '白皙暖调，百搭肤色', neutral: '不冷不暖，万能肤色',
      warm_yellow: '健康暖调，橘棕色调本命', wheat: '阳光健康，欧美妆为你而生',
    },
  },
  jawline: {
    type: '下颌线',
    iconMap: { round: '🟤', angular: '🔷', v_shape: '🔻' },
    descMap: { round: '线条圆润柔和', angular: '棱角分明，气场十足', v_shape: 'V型尖下巴，精致感' },
  },
  cheekbone: {
    type: '颧骨',
    iconMap: { prominent: '✨', moderate: '🌟', flat: '💫' },
    descMap: { prominent: '立体突出，超模同款', moderate: '恰到好处，比例适中', flat: '平缓柔和，温柔感' },
  },
};

interface FaceFeatureGridProps {
  result: AnalysisResult;
}

export default function FaceFeatureGrid({ result }: FaceFeatureGridProps) {
  const features: FeatureCardData[] = [
    { type: '脸型', label: getLabel('faceShape', result.faceShape), value: result.faceShape, icon: featureMeta.faceShape!.iconMap[result.faceShape] || '💫', description: featureMeta.faceShape!.descMap[result.faceShape] || '' },
    { type: '眼型', label: getLabel('eyeShape', result.eyeShape), value: result.eyeShape, icon: featureMeta.eyeShape!.iconMap[result.eyeShape] || '👁️', description: featureMeta.eyeShape!.descMap[result.eyeShape] || '' },
    { type: '鼻型', label: getLabel('noseShape', result.noseShape), value: result.noseShape, icon: featureMeta.noseShape!.iconMap[result.noseShape] || '👃', description: featureMeta.noseShape!.descMap[result.noseShape] || '' },
    { type: '唇型', label: getLabel('lipShape', result.lipShape), value: result.lipShape, icon: featureMeta.lipShape!.iconMap[result.lipShape] || '👄', description: featureMeta.lipShape!.descMap[result.lipShape] || '' },
    { type: '肤色', label: getLabel('skinTone', result.skinTone), value: result.skinTone, icon: featureMeta.skinTone!.iconMap[result.skinTone] || '🤍', description: featureMeta.skinTone!.descMap[result.skinTone] || '' },
    { type: '下颌', label: getLabel('jawline', result.jawline), value: result.jawline, icon: featureMeta.jawline!.iconMap[result.jawline] || '🔷', description: featureMeta.jawline!.descMap[result.jawline] || '' },
    { type: '颧骨', label: getLabel('cheekbone', result.cheekbone), value: result.cheekbone, icon: featureMeta.cheekbone!.iconMap[result.cheekbone] || '✨', description: featureMeta.cheekbone!.descMap[result.cheekbone] || '' },
  ];

  return (
    <section className="mb-10">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-800 text-center mb-6"
      >
        📊 五官特征详情
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.slice(0, 4).map((feat, i) => (
          <motion.div
            key={feat.type}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card hover={false} className="text-center p-4">
              <div className="text-3xl mb-2">{feat.icon}</div>
              <div className="text-xs font-semibold text-pink-400 uppercase mb-1">{feat.type}</div>
              <div className="text-sm font-bold text-gray-800">{feat.label}</div>
              <p className="text-xs text-gray-400 mt-1">{feat.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {features.slice(4).map((feat, i) => (
          <motion.div
            key={feat.type}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <Card hover={false} className="text-center p-4">
              <div className="text-2xl mb-1">{feat.icon}</div>
              <div className="text-xs font-semibold text-pink-400 uppercase mb-1">{feat.type}</div>
              <div className="text-sm font-bold text-gray-800">{feat.label}</div>
              <p className="text-xs text-gray-400 mt-1">{feat.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const labelMap: Record<string, Record<string, string>> = {
  faceShape: { oval: '鹅蛋脸', round: '圆脸', square: '方脸', heart: '瓜子脸', diamond: '菱形脸', long: '长脸' },
  eyeShape: { almond: '杏仁眼', round: '圆眼', phoenix: '丹凤眼', peach: '桃花眼', droopy: '下垂眼', upturned: '上挑眼' },
  noseShape: { standard: '标准鼻', flat: '塌鼻', aquiline: '鹰钩鼻', bulbous: '蒜头鼻', upturned_nose: '朝天鼻' },
  lipShape: { standard: '标准唇', thin: '薄唇', thick: '厚唇', smiling: '微笑唇', droopy_lip: '下垂唇' },
  skinTone: { cool_white: '冷白皮', warm_white: '暖白皮', neutral: '中性皮', warm_yellow: '暖黄皮', wheat: '小麦色' },
  jawline: { round: '圆润型', angular: '棱角型', v_shape: 'V型' },
  cheekbone: { prominent: '突出', moderate: '适中', flat: '平缓' },
};

function getLabel(category: string, key: string): string {
  return labelMap[category]?.[key] || key;
}
