import type { Blogger, FaceFeatures, BloggerMatch, Proportions } from '@/types';

/**
 * Convert categorical features to a one-hot vector
 */
function featuresToVector(features: FaceFeatures): number[] {
  const faceShapeMap: Record<string, number[]> = {
    oval: [1,0,0,0,0,0], round: [0,1,0,0,0,0], square: [0,0,1,0,0,0],
    heart: [0,0,0,1,0,0], diamond: [0,0,0,0,1,0], long: [0,0,0,0,0,1],
  };
  const eyeShapeMap: Record<string, number[]> = {
    almond: [1,0,0,0,0,0], round: [0,1,0,0,0,0], phoenix: [0,0,1,0,0,0],
    peach: [0,0,0,1,0,0], droopy: [0,0,0,0,1,0], upturned: [0,0,0,0,0,1],
  };
  const skinToneMap: Record<string, number[]> = {
    cool_white: [1,0,0,0,0], warm_white: [0,1,0,0,0], neutral: [0,0,1,0,0],
    warm_yellow: [0,0,0,1,0], wheat: [0,0,0,0,1],
  };
  const jawMap: Record<string, number[]> = {
    round: [1,0,0], angular: [0,1,0], v_shape: [0,0,1],
  };
  const cheekMap: Record<string, number[]> = {
    prominent: [1,0,0], moderate: [0,1,0], flat: [0,0,1],
  };
  const browMap: Record<string, number[]> = {
    close: [1,0,0], moderate: [0,1,0], far: [0,0,1],
  };

  return [
    ...(faceShapeMap[features.faceShape] || [0,0,0,0,0,0]),
    ...(eyeShapeMap[features.eyeShape] || [0,0,0,0,0,0]),
    ...(skinToneMap[features.skinTone] || [0,0,0,0,0]),
    ...(jawMap[features.jawline] || [0,0,0]),
    ...(cheekMap[features.cheekbone] || [0,0,0]),
    ...(browMap[features.browDistance] || [0,0,0]),
  ];
}

/**
 * Convert continuous proportions to a normalized vector for comparison
 */
function proportionsToVector(p: Proportions): number[] {
  // Normalize each value by its expected range
  return [
    p.upperThird / 33.3,     // ideal: ~33.3%
    p.middleThird / 33.3,
    p.lowerThird / 33.3,
    p.leftEye / 100,          // ideal: ~100 (20% of face width)
    p.rightEye / 100,
  ];
}

/**
 * Convert blogger analyzedProportions to the same normalized vector
 */
function bloggerProportionsToVector(p: {
  upperThird: number; middleThird: number; lowerThird: number;
  leftEyeWidth: number; rightEyeWidth: number;
  faceWidthHeightRatio: number; jawForeheadRatio: number; cheekboneWidthRatio: number;
}): number[] {
  return [
    p.upperThird / 33.3,
    p.middleThird / 33.3,
    p.lowerThird / 33.3,
    p.leftEyeWidth / 100,
    p.rightEyeWidth / 100,
    p.faceWidthHeightRatio,   // raw ratio already ~0.8-1.3
    p.jawForeheadRatio,        // raw ratio already ~0.7-1.0
    p.cheekboneWidthRatio,     // raw ratio already ~0.9-1.2
  ];
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getFaceShapeLabel(shape: string): string {
  const m: Record<string, string> = {
    oval: '鹅蛋脸', round: '圆脸', square: '方脸',
    heart: '瓜子脸', diamond: '菱形脸', long: '长脸',
  };
  return m[shape] || shape;
}

function getEyeShapeLabel(shape: string): string {
  const m: Record<string, string> = {
    almond: '杏仁眼', round: '圆眼', phoenix: '丹凤眼',
    peach: '桃花眼', droopy: '下垂眼', upturned: '上挑眼',
  };
  return m[shape] || shape;
}

function getSkinToneLabel(tone: string): string {
  const m: Record<string, string> = {
    cool_white: '冷白皮', warm_white: '暖白皮', neutral: '中性皮',
    warm_yellow: '暖黄皮', wheat: '小麦色',
  };
  return m[tone] || tone;
}

function generateMatchReasons(
  userFeatures: FaceFeatures,
  userProportions: Proportions,
  blogger: Blogger
): string[] {
  const reasons: string[] = [];

  if (userFeatures.faceShape === blogger.faceFeatures.faceShape) {
    reasons.push(`同为${getFaceShapeLabel(userFeatures.faceShape)}，脸型高度一致`);
  }
  if (userFeatures.eyeShape === blogger.faceFeatures.eyeShape) {
    reasons.push(`${getEyeShapeLabel(userFeatures.eyeShape)}特征相似`);
  }
  if (userFeatures.skinTone === blogger.faceFeatures.skinTone) {
    reasons.push(`肤色接近，均为${getSkinToneLabel(userFeatures.skinTone)}`);
  }
  if (userFeatures.jawline === blogger.faceFeatures.jawline) {
    reasons.push('下颌线条相似');
  }

  // Compare proportions numerically
  const bp = blogger.analyzedProportions;
  const midDiff = Math.abs(userProportions.middleThird - bp.middleThird);
  if (midDiff < 3) {
    reasons.push('中庭比例非常接近');
  }

  if (reasons.length === 0) {
    reasons.push('整体面部结构有相似之处');
  }

  return reasons;
}

/**
 * Enhanced matching using both categorical features AND continuous proportions.
 * Categorical features: weight 0.4, Proportions: weight 0.6
 */
export function matchBloggers(
  userFeatures: FaceFeatures,
  userProportions: Proportions,
  bloggers: Blogger[],
  topK: number = 3
): BloggerMatch[] {
  const userCategoricalVec = featuresToVector(userFeatures);
  const userProportionsVec = proportionsToVector(userProportions);

  const matches: BloggerMatch[] = bloggers.map((blogger) => {
    const bloggerCategoricalVec = featuresToVector(blogger.faceFeatures);
    const bloggerProportionsVec = bloggerProportionsToVector(blogger.analyzedProportions);

    const categoricalSim = cosineSimilarity(userCategoricalVec, bloggerCategoricalVec);
    const proportionsSim = cosineSimilarity(userProportionsVec, bloggerProportionsVec);

    // Weighted combination: 40% categorical tag match, 60% numerical proportion match
    const similarity = categoricalSim * 0.4 + proportionsSim * 0.6;

    return {
      blogger,
      similarity: Math.round(similarity * 10000) / 100,
      matchReasons: generateMatchReasons(userFeatures, userProportions, blogger),
    };
  });

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches.slice(0, topK);
}
