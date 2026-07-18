import type {
  FaceShape, EyeShape, NoseShape, LipShape, SkinTone,
  Jawline, Cheekbone, BrowDistance, Philtrum, FaceFeatures, FaceLandmark, Proportions,
} from '@/types';

// ============================================================
// 脸型判别 — 双方法投票
// ============================================================

/** 方法1: 基于比例的面部测量法（更精确） */
function classifyFaceShapeByRatios(lm: FaceLandmark[]): FaceShape {
  const faceWidth = Math.abs(lm[16].x - lm[0].x);
  const faceHeight = Math.abs(lm[8].y - lm[27].y);
  const jawWidth = Math.abs(lm[15].x - lm[1].x);
  const cheekWidth = Math.abs(lm[14].x - lm[2].x);
  const foreheadWidth = Math.abs(lm[24].x - lm[19].x);
  const chinToJaw = Math.abs(lm[8].y - lm[7].y);

  const whRatio = faceHeight / Math.max(faceWidth, 1);
  const jawCheekRatio = jawWidth / Math.max(cheekWidth, 1);
  const foreheadCheekRatio = foreheadWidth / Math.max(cheekWidth, 1);
  const chinSharpness = chinToJaw / Math.max(jawWidth, 1);

  // 菱形脸：颧骨显著宽于额头和下颌
  if (foreheadCheekRatio < 0.83 && jawCheekRatio < 0.83 && cheekWidth > foreheadWidth + 8 && cheekWidth > jawWidth + 8) {
    return 'diamond';
  }
  // 瓜子脸：额头宽 → 下巴窄，V型明显
  if (foreheadWidth > jawWidth * 1.12 && jawCheekRatio < 0.82 && chinSharpness < 0.28) {
    return 'heart';
  }
  // 方脸：下颌与颧骨接近，面宽高比接近1
  if (jawCheekRatio > 0.90 && whRatio > 0.82 && whRatio < 1.22 && chinSharpness > 0.35) {
    return 'square';
  }
  // 长脸：高宽比大
  if (whRatio > 1.28) {
    return 'long';
  }
  // 圆脸：高宽比接近1，下颌圆润
  if (whRatio > 0.82 && whRatio < 1.15 && jawCheekRatio > 0.84 && chinSharpness < 0.32) {
    return 'round';
  }
  // 鹅蛋脸：黄金比例
  return 'oval';
}

/** 方法2: 基于关键点距离的角度分析法 */
function classifyFaceShapeByAngles(lm: FaceLandmark[]): FaceShape {
  const faceWidth = Math.abs(lm[16].x - lm[0].x);
  const faceHeight = Math.abs(lm[8].y - lm[27].y);
  const jawWidth = Math.abs(lm[15].x - lm[1].x);
  const cheekWidth = Math.abs(lm[14].x - lm[2].x);
  const foreheadWidth = Math.abs(lm[24].x - lm[19].x);

  // 计算下颌线角度（从耳下到下巴）
  const leftJawAngle = Math.atan2(lm[8].y - lm[5].y, lm[5].x - lm[8].x);
  const rightJawAngle = Math.atan2(lm[8].y - lm[11].y, lm[8].x - lm[11].x);
  const avgJawAngle = (Math.abs(leftJawAngle) + Math.abs(rightJawAngle)) / 2;

  // 下颌角度越锐利 → V脸/瓜子脸
  // 下颌角度越圆钝 → 圆脸/方脸
  const jawForeheadDiff = foreheadWidth - jawWidth;
  const cheekJawDiff = cheekWidth - jawWidth;

  // 菱形脸判断：颧骨突出
  if (cheekJawDiff > 15 && cheekWidth > foreheadWidth + 5) return 'diamond';

  // 瓜子脸/心形：额头最宽，下巴很窄
  if (jawForeheadDiff > 12 && avgJawAngle < 0.65) return 'heart';

  // 方脸：下颌宽，角度大
  if (jawWidth > foreheadWidth * 0.92 && avgJawAngle > 0.78) return 'square';

  // 长脸
  if (faceHeight / faceWidth > 1.28) return 'long';

  // 圆脸
  if (faceHeight / faceWidth < 1.12 && jawWidth > foreheadWidth * 0.85 && avgJawAngle > 0.62) return 'round';

  return 'oval';
}

/** 综合判定：两种方法投票，意见一致直接通过，不一致用比例法（更可靠） */
export function classifyFaceShape(landmarks: FaceLandmark[]): FaceShape {
  const r1 = classifyFaceShapeByRatios(landmarks);
  const r2 = classifyFaceShapeByAngles(landmarks);

  if (r1 === r2) return r1;

  // 不一致时：比例法为主，但对边界情况进行二次判断
  const faceHeight = Math.abs(landmarks[8].y - landmarks[27].y);
  const faceWidth = Math.abs(landmarks[16].x - landmarks[0].x);
  const ratio = faceHeight / Math.max(faceWidth, 1);

  // 如果比例法说long但角度法说oval，看具体比例
  if ((r1 === 'long' || r2 === 'long') && ratio > 1.25) return 'long';
  if ((r1 === 'round' || r2 === 'round') && ratio < 1.12) return 'round';
  if ((r1 === 'square' || r2 === 'square') && Math.abs(landmarks[15].x - landmarks[1].x) / faceWidth > 0.88) return 'square';

  // 默认信任比例法
  return r1;
}

// ============================================================
// 眼型判别 — 增强版
// ============================================================
export function classifyEyeShape(landmarks: FaceLandmark[]): EyeShape {
  const leftEye = landmarks.slice(36, 42);
  const rightEye = landmarks.slice(42, 48);

  // 平均眼高（取多处测量）
  const leftEyeHeight = (
    Math.abs(leftEye[1].y - leftEye[4].y) +  // 上缘→下缘
    Math.abs(leftEye[2].y - leftEye[5].y)    // 第二组
  ) / 2;
  const rightEyeHeight = (
    Math.abs(rightEye[1].y - rightEye[4].y) +
    Math.abs(rightEye[2].y - rightEye[5].y)
  ) / 2;
  const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;

  const avgEyeWidth = (
    Math.abs(leftEye[3].x - leftEye[0].x) +
    Math.abs(rightEye[3].x - rightEye[0].x)
  ) / 2;

  const eyeRatio = avgEyeWidth > 0 ? avgEyeHeight / avgEyeWidth : 0.3;

  // 外眼角 vs 内眼角的Y轴差
  const leftCant = leftEye[3].y - leftEye[0].y;
  const rightCant = rightEye[3].y - rightEye[0].y;
  const avgCant = (leftCant + rightCant) / 2;

  // 上挑眼：外眼角明显高于内眼角（负值因为Y轴向下）
  if (avgCant < -4.5) return 'upturned';
  // 下垂眼：外眼角明显低于内眼角
  if (avgCant > 5) return 'droopy';
  // 丹凤眼：窄长 + 微挑
  if (eyeRatio < 0.30 && avgCant < -1.5) return 'phoenix';
  // 桃花眼：较宽 + 微挑/水平
  if (eyeRatio > 0.36 && avgCant < 1) return 'peach';
  // 圆眼：高宽比大
  if (eyeRatio > 0.34) return 'round';
  // 杏仁眼
  return 'almond';
}

// ============================================================
// 鼻型判别 — 增强版（多点参考 + 鼻翼鼻梁综合判断）
// ============================================================
export function classifyNoseShape(landmarks: FaceLandmark[]): NoseShape {
  const noseWidth = Math.abs(landmarks[35].x - landmarks[31].x);
  const noseHeight = Math.abs(landmarks[33].y - landmarks[27].y);
  const noseBridgeWidth = Math.abs(landmarks[30].x - landmarks[28].x);
  const noseTipToBase = Math.abs(landmarks[33].y - landmarks[30].y);

  // 鼻翼宽度比（鼻翼 vs 鼻梁）
  const wingBridgeRatio = noseWidth / Math.max(noseBridgeWidth, 1);
  const widthHeightRatio = noseWidth / Math.max(noseHeight, 1);

  // 鼻尖位置（相对于鼻翼）
  const noseTipY = landmarks[33].y;
  const leftWingY = landmarks[31].y;
  const rightWingY = landmarks[35].y;
  const wingAvgY = (leftWingY + rightWingY) / 2;

  // 朝天鼻：鼻尖明显高于鼻翼（Y值更小）
  if (noseTipY < wingAvgY - 4) return 'upturned_nose';

  // 鹰钩鼻：鼻梁有明显弯曲 + 鼻尖下钩
  const bridgeCurve = (
    Math.abs(landmarks[28].y - (landmarks[27].y + landmarks[30].y) / 2)
  );
  if (bridgeCurve > 3.5 && noseTipToBase > noseHeight * 0.45) return 'aquiline';

  // 蒜头鼻：鼻翼宽大
  if (wingBridgeRatio > 2.2 || widthHeightRatio > 1.1) return 'bulbous';

  // 塌鼻：鼻梁低平（鼻梁宽度接近鼻翼宽度，鼻高小）
  if (noseHeight < noseWidth * 1.15 && wingBridgeRatio < 1.8) return 'flat';

  // 标准鼻
  return 'standard';
}

// ============================================================
// 唇型判别
// ============================================================
export function classifyLipShape(landmarks: FaceLandmark[]): LipShape {
  const outerLip = landmarks.slice(48, 60);

  const lipWidth = Math.abs(outerLip[6].x - outerLip[0].x);
  const lipHeight = Math.abs(
    Math.max(outerLip[2].y, outerLip[3].y) - Math.min(outerLip[9].y, outerLip[8].y)
  );

  const ratio = lipHeight / Math.max(lipWidth, 1);

  // 嘴角上扬还是下垂
  const leftCorner = outerLip[0];
  const rightCorner = outerLip[6];
  const lipCenter = outerLip[3]; // 上唇中点

  if (ratio < 0.22) return 'thin';
  if (ratio > 0.40) return 'thick';

  // 微笑唇：嘴角高于唇中
  if (leftCorner.y < lipCenter.y - 2 && rightCorner.y < lipCenter.y - 2) return 'smiling';

  // 下垂唇：嘴角低于唇中
  if (leftCorner.y > lipCenter.y + 3 || rightCorner.y > lipCenter.y + 3) return 'droopy_lip';

  return 'standard';
}

// ============================================================
// 肤色判别
// ============================================================
export function classifySkinTone(rgb: { r: number; g: number; b: number }): SkinTone {
  const { r, g, b } = rgb;
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(Math.max(r, g, b), 1);

  // 小麦色：整体偏暗
  if (brightness < 135) return 'wheat';

  // 冷白皮：偏蓝/偏粉，高亮度
  if (r > b * 1.08 && brightness > 175 && saturation < 0.15) return 'cool_white';

  // 暖白皮：偏暖但白皙
  if (brightness > 170 && g > b * 1.02) return 'warm_white';

  // 暖黄皮：黄调明显
  if (g > b * 1.05 && brightness > 140) return 'warm_yellow';

  // 中性皮
  if (Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && brightness > 155) return 'neutral';

  return 'warm_yellow';
}

// ============================================================
// 下颌线判别
// ============================================================
export function classifyJawline(landmarks: FaceLandmark[]): Jawline {
  const jawWidth = Math.abs(landmarks[15].x - landmarks[1].x);
  const cheekWidth = Math.abs(landmarks[14].x - landmarks[2].x);
  const ratio = jawWidth / Math.max(cheekWidth, 1);

  // 计算下颌拐角角度
  const leftAngle = Math.abs(Math.atan2(landmarks[5].y - landmarks[7].y, landmarks[5].x - landmarks[7].x));
  const rightAngle = Math.abs(Math.atan2(landmarks[11].y - landmarks[9].y, landmarks[11].x - landmarks[9].x));
  const avgAngle = (leftAngle + rightAngle) / 2;

  if (ratio < 0.75 || avgAngle < 0.5) return 'v_shape';
  if (ratio > 0.90 || avgAngle > 0.85) return 'angular';
  return 'round';
}

export function classifyCheekbone(landmarks: FaceLandmark[]): Cheekbone {
  const cheekWidth = Math.abs(landmarks[14].x - landmarks[2].x);
  const jawWidth = Math.abs(landmarks[15].x - landmarks[1].x);
  const foreheadWidth = Math.abs(landmarks[24].x - landmarks[19].x);

  const cheekToJaw = cheekWidth / Math.max(jawWidth, 1);
  const cheekToForehead = cheekWidth / Math.max(foreheadWidth, 1);

  if (cheekToJaw > 1.18 || cheekToForehead > 1.13) return 'prominent';
  if (cheekToJaw < 1.03 && cheekToForehead < 1.03) return 'flat';
  return 'moderate';
}

export function classifyBrowDistance(landmarks: FaceLandmark[]): BrowDistance {
  const browBottom = Math.max(
    landmarks[17].y, landmarks[18].y, landmarks[19].y, landmarks[20].y, landmarks[21].y
  );
  const eyeTop = Math.min(
    landmarks[36].y, landmarks[37].y, landmarks[38].y, landmarks[39].y, landmarks[40].y, landmarks[41].y
  );
  const distance = eyeTop - browBottom;

  // 用眼高做归一化
  const eyeHeight = Math.abs(landmarks[37].y - landmarks[40].y);
  const normalizedDistance = eyeHeight > 0 ? distance / eyeHeight : 1;

  if (normalizedDistance < 0.6) return 'close';
  if (normalizedDistance > 1.5) return 'far';
  return 'moderate';
}

export function classifyPhiltrum(landmarks: FaceLandmark[]): Philtrum {
  const noseBottom = landmarks[33].y;
  const upperLip = landmarks[51].y;
  const philtrumHeight = upperLip - noseBottom;
  const faceHeight = landmarks[8].y - landmarks[27].y;
  const ratio = faceHeight > 0 ? philtrumHeight / faceHeight : 0.15;

  if (ratio < 0.11) return 'short';
  if (ratio > 0.17) return 'long';
  return 'moderate';
}

// ============================================================
// 综合分析
// ============================================================
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
