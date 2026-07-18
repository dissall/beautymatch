import type { FaceFeatures, Blogger, FaceShape, EyeShape, SkinTone, NoseShape } from '@/types';
import { loadBloggers } from '@/services/bloggerLoader';

// ============================================================
// 分部位精细化推荐：每个部位→最适合学习的博主
// ============================================================

export interface PartRecommendation {
  part: string;
  partKey: string;
  userFeature: string;
  userFeatureLabel: string;
  icon: string;
  tip: string;
  recommendedBloggers: Blogger[];
  why: string;
}

// ============================================================
// 每个脸型/眼型 → 专门的化妆技巧
// ============================================================
const eyeTips: Record<EyeShape, string> = {
  almond: '你的杏仁眼是化妆师最爱的眼型！内眼线+自然睫毛就很美，眼尾可以稍微拉长增加妩媚感～',
  round: '圆眼超显可爱！试试下垂眼线打造无辜狗狗眼，亮片眼影点在眼皮中央放大双眼效果满分～',
  phoenix: '丹凤眼自带古典冷艳气质！上扬眼线是你的标志，红棕色系眼影最能衬托你的独特韵味～',
  peach: '桃花眼笑起来像月牙！粉色系眼影+卧蚕提亮，笑起来眼睛会发光，约会妆绝杀～',
  droopy: '下垂眼温柔无辜！避免向下拉眼线，试试在眼尾1/3处微微上挑，立刻精神又有神～',
  upturned: '上挑眼电力十足！猫眼妆和截断式眼影就是为你而生的，欧美妆的完美底子～',
};

const faceTips: Record<FaceShape, string> = {
  oval: '鹅蛋脸百无禁忌！腮红打在苹果肌最高点，修容只需轻扫下颌线就足够～',
  round: '圆脸修容是重中之重！下颌线+颧骨下方打阴影，腮红斜向上扫可以视觉拉长脸型～',
  square: '方脸要柔化线条！腮红横向晕染+圆形腮红打法，避免棱角分明的修容，选择柔和的弯眉～',
  heart: '瓜子脸额头偏宽！在额头两侧和太阳穴打阴影，腮红集中在苹果肌中央平衡上下比例～',
  diamond: '菱形脸的关键是柔和颧骨！腮红从颧骨斜向下晕染+太阳穴提亮，让脸型线条更流畅～',
  long: '长脸重点是横向延伸！腮红从鼻梁中间横向打到颧骨外侧，下眼影加重让视觉重心下移～',
};

const skinTips: Record<SkinTone, string> = {
  cool_white: '冷白皮是天选之色！粉色系、莓果色、蓝调红唇是你的本命色，荧光色也能轻松驾驭～',
  warm_white: '暖白皮超百搭！蜜桃色、珊瑚色最适合日常，金色高光比银色更衬你～',
  neutral: '中性皮最自在！冷暖色调都可以尝试，推荐裸色系日常妆+偶尔玩转彩色眼线～',
  warm_yellow: '暖黄皮选对色调美十倍！橘棕色、砖红色、暖豆沙是你的安全区，避开荧光粉和冷调紫～',
  wheat: '小麦色欧美妆绝配！古铜色修容+裸色唇+金色高光，健康光泽感就是你最美的武器～',
};

const noseTips: Record<NoseShape, string> = {
  standard: '标准鼻型不用刻意修容，日常轻扫鼻梁高光即可凸显立体感～',
  flat: '鼻影从眉头到鼻翼两侧轻扫，鼻梁中间高光提亮，视觉增高鼻梁！',
  aquiline: '鹰钩鼻很有个性！鼻尖下方打阴影视觉缩短，避免在鼻梁中间打高光～',
  bulbous: '蒜头鼻修饰重点在鼻翼！鼻翼两侧打阴影+鼻头高光点涂，瞬间精致～',
  upturned_nose: '朝天鼻用鼻尖下方阴影来修饰，选哑光高光比珠光更自然～',
};

// ============================================================
// 博主↔部位匹配
// ============================================================
function findBestBloggersForFeature(
  allBloggers: Blogger[],
  featureKey: keyof FaceFeatures,
  userValue: string,
  count: number = 3
): Blogger[] {
  const exactMatches = allBloggers.filter(
    (b) => b.faceFeatures[featureKey] === userValue
  );
  const relatedMatches = allBloggers.filter(
    (b) => b.faceFeatures[featureKey] !== userValue
  );

  const ranked = [...exactMatches, ...relatedMatches];
  const seen = new Set<string>();
  const unique: Blogger[] = [];
  for (const b of ranked) {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      unique.push(b);
    }
    if (unique.length >= count) break;
  }
  return unique.slice(0, count);
}

// ============================================================
// 主推荐函数（异步加载博主数据）
// ============================================================
let _bloggersCache: Blogger[] | null = null;

async function ensureBloggers(): Promise<Blogger[]> {
  if (!_bloggersCache) {
    _bloggersCache = await loadBloggers();
  }
  return _bloggersCache;
}

export async function getGranularRecommendations(features: FaceFeatures): Promise<PartRecommendation[]> {
  const allBloggers = await ensureBloggers();

  const recs: PartRecommendation[] = [
    {
      part: '眼妆',
      partKey: 'eyeShape',
      userFeature: features.eyeShape,
      userFeatureLabel: eyeLabel[features.eyeShape] || features.eyeShape,
      icon: '👁️',
      tip: eyeTips[features.eyeShape] || '根据你的眼型选择适合的眼妆风格～',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'eyeShape', features.eyeShape),
      why: `她们的${eyeLabel[features.eyeShape] || features.eyeShape}和你高度相似，眼妆技巧可以直接照搬！`,
    },
    {
      part: '脸型修容',
      partKey: 'faceShape',
      userFeature: features.faceShape,
      userFeatureLabel: faceShapeLabel[features.faceShape] || features.faceShape,
      icon: '✨',
      tip: faceTips[features.faceShape] || '根据脸型选择最适合的修容方式～',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'faceShape', features.faceShape),
      why: `同为${faceShapeLabel[features.faceShape] || features.faceShape}，她们的修容手法最适合你参考！`,
    },
    {
      part: '底妆配色',
      partKey: 'skinTone',
      userFeature: features.skinTone,
      userFeatureLabel: skinLabel[features.skinTone] || features.skinTone,
      icon: '🎨',
      tip: skinTips[features.skinTone] || '选对粉底色号和彩妆色调是关键～',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'skinTone', features.skinTone),
      why: `肤色同为${skinLabel[features.skinTone] || features.skinTone}，她们的底妆产品和色号选择最有参考价值！`,
    },
    {
      part: '鼻影修饰',
      partKey: 'noseShape',
      userFeature: features.noseShape,
      userFeatureLabel: noseLabel[features.noseShape] || features.noseShape,
      icon: '👃',
      tip: noseTips[features.noseShape] || '鼻影修饰可以提升整体立体感～',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'noseShape', features.noseShape),
      why: `鼻型相似，她们的鼻影修饰技巧可以直接参考！`,
    },
  ];

  return recs;
}

// 同步版本（需预加载）
export function getGranularRecommendationsSync(features: FaceFeatures): PartRecommendation[] {
  if (!_bloggersCache) {
    console.warn('Bloggers not loaded yet, returning empty recommendations');
    return [];
  }
  const allBloggers = _bloggersCache;

  return [
    {
      part: '眼妆', partKey: 'eyeShape', userFeature: features.eyeShape,
      userFeatureLabel: eyeLabel[features.eyeShape] || features.eyeShape,
      icon: '👁️', tip: eyeTips[features.eyeShape] || '',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'eyeShape', features.eyeShape),
      why: `她们的${eyeLabel[features.eyeShape] || features.eyeShape}和你高度相似！`,
    },
    {
      part: '脸型修容', partKey: 'faceShape', userFeature: features.faceShape,
      userFeatureLabel: faceShapeLabel[features.faceShape] || features.faceShape,
      icon: '✨', tip: faceTips[features.faceShape] || '',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'faceShape', features.faceShape),
      why: `同为${faceShapeLabel[features.faceShape] || features.faceShape}，修容手法最适合你！`,
    },
    {
      part: '底妆配色', partKey: 'skinTone', userFeature: features.skinTone,
      userFeatureLabel: skinLabel[features.skinTone] || features.skinTone,
      icon: '🎨', tip: skinTips[features.skinTone] || '',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'skinTone', features.skinTone),
      why: `肤色同为${skinLabel[features.skinTone] || features.skinTone}，选品最有参考价值！`,
    },
    {
      part: '鼻影修饰', partKey: 'noseShape', userFeature: features.noseShape,
      userFeatureLabel: noseLabel[features.noseShape] || features.noseShape,
      icon: '👃', tip: noseTips[features.noseShape] || '',
      recommendedBloggers: findBestBloggersForFeature(allBloggers, 'noseShape', features.noseShape),
      why: `鼻型相似，修饰技巧可直接参考！`,
    },
  ];
}

// ============================================================
// 辅助 label maps
// ============================================================
export const faceShapeLabel: Record<string, string> = {
  oval: '鹅蛋脸', round: '圆脸', square: '方脸', heart: '瓜子脸', diamond: '菱形脸', long: '长脸',
};
export const eyeLabel: Record<string, string> = {
  almond: '杏仁眼', round: '圆眼', phoenix: '丹凤眼', peach: '桃花眼', droopy: '下垂眼', upturned: '上挑眼',
};
export const noseLabel: Record<string, string> = {
  standard: '标准鼻', flat: '塌鼻', aquiline: '鹰钩鼻', bulbous: '蒜头鼻', upturned_nose: '朝天鼻',
};
export const lipLabel: Record<string, string> = {
  standard: '标准唇', thin: '薄唇', thick: '厚唇', smiling: '微笑唇', droopy_lip: '下垂唇',
};
export const skinLabel: Record<string, string> = {
  cool_white: '冷白皮', warm_white: '暖白皮', neutral: '中性皮', warm_yellow: '暖黄皮', wheat: '小麦色',
};
