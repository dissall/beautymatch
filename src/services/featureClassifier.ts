import type {
  FaceShape, EyeShape, NoseShape, LipShape, SkinTone,
  Jawline, Cheekbone, BrowDistance, Philtrum, FaceFeatures, FaceLandmark, Proportions,
} from '@/types';

/**
 * 脸型判别算法
 * 基于68点特征测量面部宽高比、下颌宽度、颧骨宽度等
 */
export function classifyFaceShape(landmarks: FaceLandmark[]): FaceShape {
  const jawWidth = Math.abs(landmarks[15].x - landmarks[1].x);
  const cheekWidth = Math.abs(landmarks[14].x - landmarks[2].x);
  const foreheadWidth = Math.abs(landmarks[24].x - landmarks[19].x);
  const faceHeight = Math.abs(landmarks[8].y - landmarks[27].y);

  const ratio = faceHeight / cheekWidth;
  const jawCheekRatio = jawWidth / cheekWidth;
  const foreheadCheekRatio = foreheadWidth / cheekWidth;

  // 菱形脸：颧骨最宽，下颌和额头明显收窄
  if (foreheadCheekRatio < 0.82 && jawCheekRatio < 0.82 && cheekWidth > jawWidth && cheekWidth > foreheadWidth) {
    return 'diamond';
  }

  // 瓜子脸/心形脸：额头宽，下巴尖
  if (foreheadWidth > jawWidth * 1.15 && jawWidth / cheekWidth < 0.8) {
    return 'heart';
  }

  // 方脸：宽高比接近1，下颌线分明
  if (ratio > 0.82 && ratio < 1.2 && jawCheekRatio > 0.9) {
    return 'square';
  }

  // 圆脸：宽高比接近1，但下颌线圆润
  if (ratio > 0.82 && ratio < 1.1 && jawCheekRatio > 0.85) {
    return 'round';
  }

  // 长脸：高度明显大于宽度
  if (ratio > 1.25) {
    return 'long';
  }

  // 鹅蛋脸：黄金比例
  return 'oval';
}

/**
 * 眼型判别
 * 基于眼睛关键点(36-41左眼, 42-47右眼)的几何特征
 */
export function classifyEyeShape(landmarks: FaceLandmark[]): EyeShape {
  const leftEye = landmarks.slice(36, 42);
  const rightEye = landmarks.slice(42, 48);

  // 取平均眼型
  const avgEyeHeight = (
    ((leftEye[4].y - leftEye[1].y + leftEye[5].y - leftEye[2].y) / 2) +
    ((rightEye[4].y - rightEye[1].y + rightEye[5].y - rightEye[2].y) / 2)
  ) / 2;

  const avgEyeWidth = (
    (leftEye[3].x - leftEye[0].x) + (rightEye[3].x - rightEye[0].x)
  ) / 2;

  const eyeRatio = avgEyeHeight / avgEyeWidth;

  // 外眼角与内眼角的相对位置
  const leftCant = leftEye[3].y - leftEye[0].y;
  const rightCant = rightEye[3].y - rightEye[0].y;
  const avgCant = (leftCant + rightCant) / 2;

  // 上挑眼：外眼角明显高于内眼角
  if (avgCant < -3) return 'upturned';
  // 下垂眼：外眼角明显低于内眼角
  if (avgCant > 4) return 'droopy';
  // 丹凤眼：窄长 + 微挑
  if (eyeRatio < 0.28 && avgCant < -1) return 'phoenix';
  // 桃花眼：较大 + 微弯
  if (eyeRatio > 0.38 && avgCant < 0) return 'peach';
  // 圆眼：高宽比大
  if (eyeRatio > 0.36) return 'round';
  // 杏仁眼：黄金比例
  return 'almond';
}

/**
 * 鼻型判别
 */
export function classifyNoseShape(landmarks: FaceLandmark[]): NoseShape {
  const noseWidth = Math.abs(landmarks[35].x - landmarks[31].x);
  const noseHeight = Math.abs(landmarks[33].y - landmarks[27].y);
  const noseBridge = Math.abs(landmarks[30].y - landmarks[27].y);

  const widthHeightRatio = noseWidth / noseHeight;
  const bridgeRatio = noseBridge / noseHeight;

  // 鹰钩鼻：鼻梁明显弯曲
  if (bridgeRatio > 0.6 && landmarks[30].y > (landmarks[27].y + landmarks[33].y) / 2 + 5) {
    return 'aquiline';
  }
  // 蒜头鼻：鼻翼宽
  if (widthHeightRatio > 1.05) return 'bulbous';
  // 朝天鼻：鼻尖上翘
  if (landmarks[33].y < landmarks[31].y && landmarks[33].y < landmarks[35].y) {
    return 'upturned_nose';
  }
  // 塌鼻：鼻梁低平
  if (bridgeRatio < 0.42) return 'flat';

  return 'standard';
}

/**
 * 唇型判别
 */
export function classifyLipShape(landmarks: FaceLandmark[]): LipShape {
  const outerLip = landmarks.slice(48, 60);

  const lipWidth = Math.abs(outerLip[6].x - outerLip[0].x);
  const lipHeight = Math.abs(
    (outerLip[2].y + outerLip[3].y) / 2 - (outerLip[9].y + outerLip[8].y) / 2
  );
  const upperLip = Math.abs(outerLip[2].y - outerLip[3].y);

  const ratio = lipHeight / lipWidth;

  // 薄唇
  if (ratio < 0.22) return 'thin';
  // 厚唇
  if (ratio > 0.42) return 'thick';
  // 微笑唇：嘴角微微上扬
  if (outerLip[0].y > outerLip[6].y && outerLip[6].y > outerLip[3].y && outerLip[0].y > outerLip[3].y) {
    return 'smiling';
  }
  // 下垂唇：嘴角下垂
  if (outerLip[0].y < outerLip[6].y - 3) return 'droopy_lip';

  return 'standard';
}

/**
 * 肤色判别
 * 基于RGB值的色相和亮度
 */
export function classifySkinTone(rgb: { r: number; g: number; b: number }): SkinTone {
  const { r, g, b } = rgb;

  // 亮度
  const brightness = (r + g + b) / 3;

  // 红蓝比判断冷暖
  const redBlueRatio = r / Math.max(b, 1);
  const greenRedRatio = g / Math.max(r, 1);

  // 小麦色：整体偏暗
  if (brightness < 140) return 'wheat';

  // 暖黄皮：黄调明显
  if (greenRedRatio > 0.88 && redBlueRatio < 1.25) return 'warm_yellow';

  // 冷白皮：偏蓝/偏粉
  if (redBlueRatio > 1.35 && brightness > 180) return 'cool_white';

  // 暖白皮：偏暖但白皙
  if (brightness > 180 && redBlueRatio > 1.15) return 'warm_white';

  // 中性皮
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && brightness > 160) return 'neutral';

  return 'warm_yellow';
}

/**
 * 下颌线判别
 */
export function classifyJawline(landmarks: FaceLandmark[]): Jawline {
  const jawWidth = Math.abs(landmarks[15].x - landmarks[1].x);
  const cheekWidth = Math.abs(landmarks[14].x - landmarks[2].x);

  const ratio = jawWidth / cheekWidth;

  if (ratio < 0.75) return 'v_shape';
  if (ratio > 0.92) return 'angular';
  return 'round';
}

/**
 * 颧骨判别
 */
export function classifyCheekbone(landmarks: FaceLandmark[]): Cheekbone {
  const cheekWidth = Math.abs(landmarks[14].x - landmarks[2].x);
  const jawWidth = Math.abs(landmarks[15].x - landmarks[1].x);
  const foreheadWidth = Math.abs(landmarks[24].x - landmarks[19].x);

  const cheekToJaw = cheekWidth / Math.max(jawWidth, 1);
  const cheekToForehead = cheekWidth / Math.max(foreheadWidth, 1);

  if (cheekToJaw > 1.2 || cheekToForehead > 1.15) return 'prominent';
  if (cheekToJaw < 1.02 && cheekToForehead < 1.02) return 'flat';
  return 'moderate';
}

/**
 * 眉眼距判别
 */
export function classifyBrowDistance(landmarks: FaceLandmark[]): BrowDistance {
  const leftBrowBottom = Math.max(landmarks[17].y, landmarks[18].y, landmarks[19].y, landmarks[20].y, landmarks[21].y);
  const rightEyeTop = Math.min(landmarks[36].y, landmarks[37].y, landmarks[38].y, landmarks[39].y, landmarks[40].y, landmarks[41].y);
  const distance = rightEyeTop - leftBrowBottom;

  if (distance < 8) return 'close';
  if (distance > 20) return 'far';
  return 'moderate';
}

/**
 * 人中判别
 */
export function classifyPhiltrum(landmarks: FaceLandmark[]): Philtrum {
  const noseBottom = landmarks[33].y;
  const upperLip = landmarks[51].y;
  const philtrumHeight = upperLip - noseBottom;

  const faceHeight = landmarks[8].y - landmarks[27].y;
  const ratio = philtrumHeight / faceHeight;

  if (ratio < 0.12) return 'short';
  if (ratio > 0.18) return 'long';
  return 'moderate';
}

/**
 * 综合特征分类
 */
export function analyzeFeatures(
  landmarks: FaceLandmark[],
  proportions: Proportions,
  skinRgb: { r: number; g: number; b: number }
): FaceFeatures {
  return {
    faceShape: classifyFaceShape(landmarks),
    eyeShape: classifyEyeShape(landmarks),
    noseShape: classifyNoseShape(landmarks),
    lipShape: classifyLipShape(landmarks),
    skinTone: classifySkinTone(skinRgb),
    jawline: classifyJawline(landmarks),
    cheekbone: classifyCheekbone(landmarks),
    browDistance: classifyBrowDistance(landmarks),
    philtrum: classifyPhiltrum(landmarks),
  };
}
