import * as faceapi from 'face-api.js';
import type { FaceLandmark, Proportions, FaceMeasurements } from '@/types';

// Model files are organized in subdirectories under public/models/
// Use Vite's BASE_URL so it works on both dev server and GitHub Pages subpath
const MODEL_BASE = `${import.meta.env.BASE_URL}models`;
const SSD_URL = `${MODEL_BASE}/ssd_mobilenetv1`;
const LANDMARK_URL = `${MODEL_BASE}/face_landmark_68`;
const RECOG_URL = `${MODEL_BASE}/face_recognition`;

// Average human iris diameter in mm — used as reference for pixel→mm conversion
const AVG_IRIS_MM = 11.7;

let modelsLoaded = false;

// 68-point landmark names
const LANDMARK_NAMES: string[] = [
  // Jawline (0-16): 17 points
  '左下颌0','左下颌1','左下颌2','左下颌3','左下颌4','左下颌5','左下颌6','左下颌7',
  '下巴','右下颌7','右下颌6','右下颌5','右下颌4','右下颌3','右下颌2','右下颌1','右下颌0',
  // Right eyebrow (17-21): 5 points
  '右眉尾','右眉中','右眉头','右眉上','右眉内',
  // Left eyebrow (22-26): 5 points
  '左眉内','左眉上','左眉头','左眉中','左眉尾',
  // Nose bridge (27-30): 4 points
  '鼻梁上','鼻梁中','鼻梁下','鼻尖下',
  // Nose bottom (31-35): 5 points
  '鼻底左','鼻底中左','鼻底中','鼻底中右','鼻底右',
  // Left eye (36-41): 6 points
  '左眼外角','左眼上缘','左眼内角','左眼下缘','左眼下外','左眼上外',
  // Right eye (42-47): 6 points
  '右眼内角','右眼上缘','右眼外角','右眼下缘','右眼下内','右眼上内',
  // Outer lip (48-59): 12 points
  '唇左角','唇左上','唇中上','唇右上','唇右角','唇右下','唇中下','唇左下','唇左上内','唇右上内','唇右下内','唇左下内',
  // Inner lip (60-67): 8 points
  '内唇左','内唇上1','内唇上2','内唇右','内唇下2','内唇下1','内唇上内','内唇下内',
];

export async function loadModels(onProgress?: (msg: string) => void): Promise<void> {
  if (modelsLoaded) return;

  try {
    onProgress?.('正在加载人脸检测模型...');
    await faceapi.nets.ssdMobilenetv1.loadFromUri(SSD_URL);

    onProgress?.('正在加载特征点模型...');
    await faceapi.nets.faceLandmark68Net.loadFromUri(LANDMARK_URL);

    onProgress?.('正在加载人脸识别模型...');
    await faceapi.nets.faceRecognitionNet.loadFromUri(RECOG_URL);

    modelsLoaded = true;
    onProgress?.('模型加载完成！');
  } catch (err) {
    modelsLoaded = false;
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`模型加载失败: ${msg}。请检查网络连接后刷新页面重试。`);
  }
}

export interface DetectionResult {
  landmarks: FaceLandmark[];
  detectionBox: { x: number; y: number; width: number; height: number };
  score: number;
}

export async function detectFace(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<DetectionResult | undefined> {
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 });
  const result = await faceapi
    .detectSingleFace(input, options)
    .withFaceLandmarks();

  if (!result) return undefined;

  const box = result.detection.box;
  const positions = result.landmarks.positions;

  const landmarks: FaceLandmark[] = positions.map((p, i) => ({
    x: p.x,
    y: p.y,
    name: LANDMARK_NAMES[i] || `点${i}`,
  }));

  return {
    landmarks,
    detectionBox: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    },
    score: result.detection.score,
  };
}

/**
 * Estimate pixel→mm conversion using iris diameter as reference.
 * The iris (visible part of the eye between landmarks) is ~11.7mm on average.
 */
function estimatePixelToMmRatio(landmarks: FaceLandmark[]): number {
  const lm = landmarks;
  // Left iris width: distance between eye inner corner (36) and outer corner (39) ≈ visible eye width
  // Iris is roughly 1/3 of visible eye width, or we use the eye height as approximation
  const leftEyeHeight = Math.abs(lm[37].y - lm[40].y);
  const rightEyeHeight = Math.abs(lm[43].y - lm[46].y);
  // Iris ~= eye height in a fully open eye
  const avgIrisPx = (leftEyeHeight + rightEyeHeight) / 2;

  if (avgIrisPx <= 0) return 0.15; // fallback

  return AVG_IRIS_MM / avgIrisPx;
}

/**
 * Get 68-point landmarks with Chinese names
 */
export function extractLandmarks(
  result: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
): FaceLandmark[] {
  return result.landmarks.positions.map((p, i) => ({
    x: p.x,
    y: p.y,
    name: LANDMARK_NAMES[i] || `点${i}`,
  }));
}

/**
 * Calculate proportions and mm measurements from 68-point landmarks.
 */
export function calculateProportions(landmarks: FaceLandmark[]): Proportions {
  const lm = landmarks;
  const pxToMm = estimatePixelToMmRatio(landmarks);

  // === 像素级测量 ===
  const topY = Math.min(lm[19].y, lm[20].y, lm[21].y, lm[22].y, lm[23].y, lm[24].y);
  const browY = (lm[21].y + lm[22].y) / 2;
  const noseBottomY = lm[33].y;
  const chinY = lm[8].y;
  const totalHeight = chinY - topY;

  // 三庭百分比
  const upperThird = totalHeight > 0 ? ((browY - topY) / totalHeight) * 100 : 33;
  const middleThird = totalHeight > 0 ? ((noseBottomY - browY) / totalHeight) * 100 : 33;
  const lowerThird = totalHeight > 0 ? ((chinY - noseBottomY) / totalHeight) * 100 : 34;

  // 五眼
  const leftEyeWidthPx = lm[39].x - lm[36].x;
  const rightEyeWidthPx = lm[45].x - lm[42].x;
  const faceWidthPx = lm[16].x - lm[0].x;

  const leftEye = faceWidthPx > 0 ? (leftEyeWidthPx / faceWidthPx) * 500 : 100;
  const rightEye = faceWidthPx > 0 ? (rightEyeWidthPx / faceWidthPx) * 500 : 100;
  const eyeWidth = faceWidthPx > 0 ? ((leftEyeWidthPx + rightEyeWidthPx) / 2 / faceWidthPx) * 1000 : 200;

  // === mm 测量 ===
  const measurements: FaceMeasurements = {
    faceWidth: Math.round(faceWidthPx * pxToMm * 10) / 10,
    faceHeight: Math.round(totalHeight * pxToMm * 10) / 10,
    upperThirdMm: Math.round((browY - topY) * pxToMm * 10) / 10,
    middleThirdMm: Math.round((noseBottomY - browY) * pxToMm * 10) / 10,
    lowerThirdMm: Math.round((chinY - noseBottomY) * pxToMm * 10) / 10,
    leftEyeWidthMm: Math.round(leftEyeWidthPx * pxToMm * 10) / 10,
    rightEyeWidthMm: Math.round(rightEyeWidthPx * pxToMm * 10) / 10,
    interpupillaryDistance: Math.round(Math.abs(lm[39].x + lm[36].x - lm[45].x - lm[42].x) / 2 * pxToMm * 10) / 10,
    noseWidth: Math.round(Math.abs(lm[35].x - lm[31].x) * pxToMm * 10) / 10,
    noseHeight: Math.round(Math.abs(lm[33].y - lm[27].y) * pxToMm * 10) / 10,
    lipWidth: Math.round(Math.abs(lm[54].x - lm[48].x) * pxToMm * 10) / 10,
    lipHeight: Math.round(Math.abs(lm[57].y - lm[51].y) * pxToMm * 10) / 10,
    jawWidth: Math.round(Math.abs(lm[15].x - lm[1].x) * pxToMm * 10) / 10,
    foreheadWidth: Math.round(Math.abs(lm[24].x - lm[19].x) * pxToMm * 10) / 10,
    cheekboneWidth: Math.round(Math.abs(lm[14].x - lm[2].x) * pxToMm * 10) / 10,
    browToEyeDistance: Math.round(Math.abs((lm[37].y + lm[43].y) / 2 - (lm[20].y + lm[23].y) / 2) * pxToMm * 10) / 10,
    philtrumLength: Math.round(Math.abs(lm[51].y - lm[33].y) * pxToMm * 10) / 10,
    widthHeightRatio: Math.round((faceWidthPx / totalHeight) * 1000) / 1000,
    jawForeheadRatio: Math.round((Math.abs(lm[15].x - lm[1].x) / Math.abs(lm[24].x - lm[19].x)) * 1000) / 1000,
    cheekboneWidthRatio: Math.round((Math.abs(lm[14].x - lm[2].x) / faceWidthPx) * 1000) / 1000,
  };

  return {
    upperThird: Math.round(upperThird * 10) / 10,
    middleThird: Math.round(middleThird * 10) / 10,
    lowerThird: Math.round(lowerThird * 10) / 10,
    leftEye: Math.round(leftEye * 10) / 10,
    rightEye: Math.round(rightEye * 10) / 10,
    eyeWidth: Math.round(eyeWidth * 10) / 10,
    measurements,
  };
}

/**
 * Extract skin color from multiple facial regions
 */
export function extractSkinColor(
  imageData: ImageData,
  landmarks: FaceLandmark[]
): { r: number; g: number; b: number } {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  const sampleRegions = [
    { x: landmarks[21].x, y: Math.max(0, landmarks[21].y - 30), r: 10 },
    { x: landmarks[1].x + 10, y: landmarks[1].y + 20, r: 10 },
    { x: landmarks[15].x - 10, y: landmarks[15].y + 20, r: 10 },
    { x: landmarks[8].x, y: landmarks[8].y - 15, r: 8 },
  ];

  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  for (const region of sampleRegions) {
    const sx = Math.max(0, Math.floor(region.x - region.r));
    const sy = Math.max(0, Math.floor(region.y - region.r));
    const sw = Math.min(region.r * 2, imageData.width - sx);
    const sh = Math.min(region.r * 2, imageData.height - sy);

    if (sw <= 0 || sh <= 0) continue;

    try {
      const regionData = ctx.getImageData(sx, sy, sw, sh);
      for (let i = 0; i < regionData.data.length; i += 4) {
        totalR += regionData.data[i];
        totalG += regionData.data[i + 1];
        totalB += regionData.data[i + 2];
        count++;
      }
    } catch {
      continue;
    }
  }

  if (count === 0) return { r: 200, g: 180, b: 160 };

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };
}
