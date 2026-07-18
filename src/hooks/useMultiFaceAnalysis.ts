import { useCallback } from 'react';
import {
  loadModels, detectFace, calculateProportions, extractSkinColor,
} from '@/services/faceAnalysis';
import { analyzeFeatures } from '@/services/featureClassifier';
import { getRecommendations } from '@/services/makeupRecommender';
import { matchBloggers } from '@/services/bloggerMatcher';
import { generateAICompliment } from '@/services/aiCompliment';
import { getGranularRecommendations } from '@/services/granularRecommender';
import { generateCompliment } from '@/utils/compliment';
import { loadBloggers } from '@/services/bloggerLoader';
import { useAppStore } from '@/store/useAppStore';
import type {
  AnalysisResult, PartRecommendationRef, FaceFeatures, Proportions,
  FaceShape, EyeShape, NoseShape, LipShape, SkinTone, Jawline, Cheekbone,
  BrowDistance, Philtrum, FaceLandmark,
} from '@/types';

/** Parsed image info */
interface PhotoAnalysis {
  landmarks: FaceLandmark[];
  features: FaceFeatures;
  proportions: Proportions;
  detectionBox: { x: number; y: number; width: number; height: number } | null;
  succeeded: boolean;
}

/** Majority vote for string features */
function majorityVote<T extends string>(values: T[]): { result: T; confidence: number } {
  const counts = new Map<T, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let maxCount = 0, winner = values[0]!;
  for (const [k, c] of counts) {
    if (c > maxCount) { maxCount = c; winner = k; }
  }
  return { result: winner, confidence: maxCount / values.length };
}

/** Average numerical values */
function averageMeasurements(measurementsList: Proportions['measurements'][]) {
  const keys = Object.keys(measurementsList[0]!) as (keyof Proportions['measurements'])[];
  const result = {} as Proportions['measurements'];
  for (const key of keys) {
    const sum = measurementsList.reduce((acc, m) => acc + (m[key] as number), 0);
    (result as any)[key] = Math.round((sum / measurementsList.length) * 10) / 10;
  }
  return result;
}

function averageProportions(proportionsList: Proportions[]): Proportions {
  const n = proportionsList.length;
  const avg = (key: keyof Proportions) =>
    Math.round((proportionsList.reduce((s, p) => s + (p[key] as number), 0) / n) * 10) / 10;

  return {
    upperThird: avg('upperThird'),
    middleThird: avg('middleThird'),
    lowerThird: avg('lowerThird'),
    leftEye: avg('leftEye'),
    rightEye: avg('rightEye'),
    eyeWidth: avg('eyeWidth'),
    measurements: averageMeasurements(proportionsList.map((p) => p.measurements)),
  };
}

export function useMultiFaceAnalysis() {
  const {
    setIsAnalyzing, setAnalysisProgress, setAnalysisMessage,
    setAnalysisResult, addToHistory,
  } = useAppStore();

  const analyzeMultiplePhotos = useCallback(
    async (imageDataUrls: string[]): Promise<AnalysisResult> => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisMessage('正在加载AI模型...');

      try {
        await loadModels((msg) => setAnalysisMessage(msg));
        const bloggersPromise = loadBloggers();

        const totalPhotos = imageDataUrls.length;
        const photoResults: PhotoAnalysis[] = [];

        // Analyze each photo independently
        for (let i = 0; i < totalPhotos; i++) {
          const baseProgress = 15 + Math.floor((i / totalPhotos) * 55);
          setAnalysisProgress(baseProgress);
          setAnalysisMessage(`正在分析第 ${i + 1}/${totalPhotos} 张照片...`);

          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageDataUrls[i]!;
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('图片加载失败'));
              setTimeout(() => reject(new Error('加载超时')), 20000);
            });

            const detection = await detectFace(img);
            if (!detection) {
              console.warn(`Photo ${i + 1}: no face detected`);
              photoResults.push({ landmarks: [], features: {} as FaceFeatures, proportions: {} as Proportions, detectionBox: null, succeeded: false });
              continue;
            }

            const { landmarks, detectionBox } = detection;

            // Skin analysis
            const canvas = document.createElement('canvas');
            const maxDim = 600;
            let w = img.naturalWidth, h = img.naturalHeight;
            if (w > maxDim) { h = h * (maxDim / w); w = maxDim; }
            if (h > maxDim) { w = w * (maxDim / h); h = maxDim; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const sx = w / img.naturalWidth, sy = h / img.naturalHeight;
            const analysisLandmarks = landmarks.map((lm) => ({ x: lm.x * sx, y: lm.y * sy, name: lm.name }));
            const skinRgb = extractSkinColor(imageData, analysisLandmarks);
            const proportions = calculateProportions(analysisLandmarks);
            const features = analyzeFeatures(analysisLandmarks, proportions, skinRgb);

            photoResults.push({
              landmarks: landmarks.map((lm) => ({ ...lm })),
              features,
              proportions,
              detectionBox: detectionBox ? { ...detectionBox } : null,
              succeeded: true,
            });
          } catch (err) {
            console.warn(`Photo ${i + 1} analysis failed:`, err);
            photoResults.push({ landmarks: [], features: {} as FaceFeatures, proportions: {} as Proportions, detectionBox: null, succeeded: false });
          }
        }

        // Aggregate: only use successful analyses
        const successful = photoResults.filter((r) => r.succeeded);
        if (successful.length === 0) {
          throw new Error(
            '所有照片均未检测到清晰人脸。\n\n请确保：\n1. 照片包含完整正脸\n2. 光线充足均匀\n3. 面部不被遮挡\n\n请换照片重试～'
          );
        }

        setAnalysisProgress(75);
        setAnalysisMessage(`综合分析中（${successful.length}/${totalPhotos} 张照片成功识别）...`);

        // Vote on categorical features
        const faceShapeVote = majorityVote(successful.map((r) => r.features.faceShape));
        const eyeShapeVote = majorityVote(successful.map((r) => r.features.eyeShape));
        const noseShapeVote = majorityVote(successful.map((r) => r.features.noseShape));
        const lipShapeVote = majorityVote(successful.map((r) => r.features.lipShape));
        const skinToneVote = majorityVote(successful.map((r) => r.features.skinTone));
        const jawlineVote = majorityVote(successful.map((r) => r.features.jawline));
        const cheekboneVote = majorityVote(successful.map((r) => r.features.cheekbone));
        const browDistVote = majorityVote(successful.map((r) => r.features.browDistance));
        const philtrumVote = majorityVote(successful.map((r) => r.features.philtrum));

        const overallConfidence = Math.round(
          (faceShapeVote.confidence + eyeShapeVote.confidence + noseShapeVote.confidence +
           lipShapeVote.confidence + skinToneVote.confidence) / 5 * 100
        );

        // Average proportions
        const avgProportions = averageProportions(successful.map((r) => r.proportions));

        // Use first successful photo's landmarks for overlay
        const displayPhoto = successful[0]!;

        // Build combined features
        const combinedFeatures: FaceFeatures = {
          faceShape: faceShapeVote.result,
          eyeShape: eyeShapeVote.result,
          noseShape: noseShapeVote.result,
          lipShape: lipShapeVote.result,
          skinTone: skinToneVote.result,
          jawline: jawlineVote.result,
          cheekbone: cheekboneVote.result,
          browDistance: browDistVote.result,
          philtrum: philtrumVote.result,
        };

        // Recommendations & matching
        setAnalysisProgress(85);
        setAnalysisMessage('正在生成妆造推荐...');
        const recommendations = getRecommendations(combinedFeatures, 3);

        setAnalysisProgress(90);
        setAnalysisMessage('正在匹配博主...');
        const bloggersData = await bloggersPromise;
        const matchedBloggers = matchBloggers(combinedFeatures, avgProportions, bloggersData, 3);

        setAnalysisProgress(93);
        setAnalysisMessage('正在生成分部位推荐...');
        const granularRecs = await getGranularRecommendations(combinedFeatures);
        const granularRefs: PartRecommendationRef[] = granularRecs.map((r) => ({
          part: r.part, partKey: r.partKey,
          userFeature: r.userFeature, userFeatureLabel: r.userFeatureLabel,
          icon: r.icon, tip: r.tip,
          recommendedBloggerIds: r.recommendedBloggers.map((b) => b.id),
          why: r.why,
        }));

        const templateCompliment = generateCompliment(combinedFeatures, avgProportions);

        setAnalysisProgress(97);
        setAnalysisMessage('AI正在写专属夸夸...');
        const aiCompliment = await generateAICompliment(combinedFeatures, avgProportions);

        const result: AnalysisResult = {
          id: `bm_${Date.now()}`,
          createdAt: new Date().toISOString(),
          imageDataUrl: imageDataUrls[0]!,
          imageWidth: 800,
          imageHeight: 800,
          ...combinedFeatures,
          proportions: avgProportions,
          landmarks: displayPhoto.landmarks,
          detectionBox: displayPhoto.detectionBox,
          recommendations,
          matchedBloggers,
          compliment: aiCompliment || templateCompliment,
          aiCompliment: aiCompliment || undefined,
          granularRecommendations: granularRefs,
          _photoCount: totalPhotos,
          _successCount: successful.length,
          _confidence: overallConfidence,
        };

        setAnalysisProgress(100);
        setAnalysisMessage('分析完成！✨');
        setAnalysisResult(result);
        addToHistory(result);

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '分析失败';
        setAnalysisProgress(0);
        setAnalysisMessage(message);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setIsAnalyzing, setAnalysisProgress, setAnalysisMessage, setAnalysisResult, addToHistory]
  );

  return { analyzeMultiplePhotos };
}
