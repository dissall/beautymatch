// ========== 脸型特征枚举 ==========

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'long';
export type EyeShape = 'almond' | 'round' | 'phoenix' | 'peach' | 'droopy' | 'upturned';
export type NoseShape = 'standard' | 'flat' | 'aquiline' | 'bulbous' | 'upturned_nose';
export type LipShape = 'standard' | 'thin' | 'thick' | 'smiling' | 'droopy_lip';
export type SkinTone = 'cool_white' | 'warm_white' | 'neutral' | 'warm_yellow' | 'wheat';
export type Jawline = 'round' | 'angular' | 'v_shape';
export type Cheekbone = 'prominent' | 'moderate' | 'flat';
export type BrowDistance = 'close' | 'moderate' | 'far';
export type Philtrum = 'short' | 'moderate' | 'long';
export type MakeupStyle =
  | 'korean_clear' | 'japanese_genki' | 'contour_3d' | 'euro_mix'
  | 'soft_korean' | 'french_lazy' | 'pure_desire' | 'chinese_classic'
  | 'japanese_blush' | 'milk_tea' | 'cute_age' | 'horizontal_blush';

export type Platform = 'douyin' | 'xiaohongshu' | 'both';

// ========== 特征标签 ==========

export interface FaceFeatures {
  faceShape: FaceShape;
  eyeShape: EyeShape;
  noseShape: NoseShape;
  lipShape: LipShape;
  skinTone: SkinTone;
  jawline: Jawline;
  cheekbone: Cheekbone;
  browDistance: BrowDistance;
  philtrum: Philtrum;
}

/** 精确面部测量数据（mm） */
export interface FaceMeasurements {
  /** 全脸宽度 mm */
  faceWidth: number;
  /** 全脸高度（发际线→下巴） mm */
  faceHeight: number;
  /** 上庭高度（发际线→眉心） mm */
  upperThirdMm: number;
  /** 中庭高度（眉心→鼻底） mm */
  middleThirdMm: number;
  /** 下庭高度（鼻底→下巴） mm */
  lowerThirdMm: number;
  /** 左眼宽度 mm */
  leftEyeWidthMm: number;
  /** 右眼宽度 mm */
  rightEyeWidthMm: number;
  /** 瞳距 mm */
  interpupillaryDistance: number;
  /** 鼻宽 mm */
  noseWidth: number;
  /** 鼻高 mm */
  noseHeight: number;
  /** 唇宽（嘴角间距） mm */
  lipWidth: number;
  /** 唇高 mm */
  lipHeight: number;
  /** 下颌宽度 mm */
  jawWidth: number;
  /** 额头宽度 mm */
  foreheadWidth: number;
  /** 颧骨宽度 mm */
  cheekboneWidth: number;
  /** 眉眼间距 mm */
  browToEyeDistance: number;
  /** 人中长度 mm */
  philtrumLength: number;
  /** 面宽高比 */
  widthHeightRatio: number;
  /** 下颌额头比 */
  jawForeheadRatio: number;
  /** 颧骨宽度比 */
  cheekboneWidthRatio: number;
}

export interface Proportions {
  upperThird: number;
  middleThird: number;
  lowerThird: number;
  leftEye: number;
  rightEye: number;
  eyeWidth: number;
  /** 精确 mm 测量 */
  measurements: FaceMeasurements;
}

export interface FaceLandmark {
  x: number;
  y: number;
  /** 关键点名称（如左眼内角、鼻尖等） */
  name?: string;
}

// ========== 分析结果 ==========

export interface MakeupRecommendation {
  style: MakeupStyle;
  name: string;
  description: string;
  suitable: string;
  steps: MakeupStep[];
  icon: string;
}

export interface MakeupStep {
  order: number;
  title: string;
  description: string;
  tips: string;
  products: string[];
}

export interface BloggerMatch {
  blogger: Blogger;
  similarity: number;
  matchReasons: string[];
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  imageDataUrl: string;
  /** 上传照片的原始宽高 */
  imageWidth: number;
  imageHeight: number;
  faceShape: FaceShape;
  eyeShape: EyeShape;
  noseShape: NoseShape;
  lipShape: LipShape;
  skinTone: SkinTone;
  jawline: Jawline;
  cheekbone: Cheekbone;
  browDistance: BrowDistance;
  philtrum: Philtrum;
  proportions: Proportions;
  landmarks: FaceLandmark[];
  /** 人脸检测框（在原始图片上的坐标） */
  detectionBox: { x: number; y: number; width: number; height: number } | null;
  recommendations: MakeupRecommendation[];
  matchedBloggers: BloggerMatch[];
  compliment: string;
  aiCompliment?: string;
  granularRecommendations?: PartRecommendationRef[];
}

/** Lightweight reference for granular recs (avoids circular imports) */
export interface PartRecommendationRef {
  part: string;
  partKey: string;
  userFeature: string;
  userFeatureLabel: string;
  icon: string;
  tip: string;
  recommendedBloggerIds: string[];
  why: string;
}

// ========== 博主 ==========

export interface AnalyzedProportions {
  upperThird: number;
  middleThird: number;
  lowerThird: number;
  leftEyeWidth: number;
  rightEyeWidth: number;
  faceWidthHeightRatio: number;
  jawForeheadRatio: number;
  cheekboneWidthRatio: number;
  /** 精确 mm 测量 */
  measurements: FaceMeasurements;
}

export interface Blogger {
  id: string;
  name: string;
  avatar: string;
  platform: Platform;
  platformId: string;
  platformUrl: string;
  followers: string;
  faceFeatures: FaceFeatures;
  analyzedProportions: AnalyzedProportions;
  style: MakeupStyle[];
  tags: string[];
  featuredWorks: string[];
  bio: string;
}

// ========== 妆造风格 ==========

export interface MakeupStyleInfo {
  id: MakeupStyle;
  name: string;
  description: string;
  suitable: string;
  keyPoints: string[];
  steps: MakeupStep[];
}

// ========== 组件 Props ==========

export interface FeatureCardData {
  type: string;
  label: string;
  value: string;
  icon: string;
  description: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fullMark: number;
}
