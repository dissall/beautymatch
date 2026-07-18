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
import type { AnalysisResult, PartRecommendationRef } from '@/types';

export function useFaceAnalysis() {
  const {
    setIsAnalyzing, setAnalysisProgress, setAnalysisMessage,
    setAnalysisResult, addToHistory,
  } = useAppStore();

  const loadModelsAndAnalyze = useCallback(
    async (imageEl: HTMLImageElement): Promise<AnalysisResult> => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        setAnalysisProgress(5);
        setAnalysisMessage('正在加载AI模型...');
        await loadModels((msg) => setAnalysisMessage(msg));

        // Preload bloggers in background
        setAnalysisProgress(10);
        const bloggersPromise = loadBloggers();

        // Detect face (now returns landmarks + detection box)
        setAnalysisProgress(25);
        setAnalysisMessage('正在检测人脸位置...');
        const detection = await detectFace(imageEl);

        if (!detection) {
          throw new Error(
            '未能检测到清晰的人脸。\n\n请确保：\n1. 照片中包含完整正脸\n2. 光线充足均匀\n3. 面部不被头发或饰品遮挡\n\n请换一张照片重试～'
          );
        }

        const { landmarks: rawLandmarks, detectionBox: rawBox } = detection;

        // Keep original landmarks (natural image coords) for overlay display
        const displayLandmarks = rawLandmarks.map((lm) => ({ ...lm }));

        // Extract skin color from image — use a resized canvas for performance
        setAnalysisProgress(55);
        setAnalysisMessage('正在分析肤色...');
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = imageEl.naturalWidth;
        let h = imageEl.naturalHeight;
        if (w > maxDim) { h = h * (maxDim / w); w = maxDim; }
        if (h > maxDim) { w = w * (maxDim / h); h = maxDim; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(imageEl, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);

        // Scale landmarks to match the analysis canvas for skin sampling + calculations
        const sx = w / imageEl.naturalWidth;
        const sy = h / imageEl.naturalHeight;
        const analysisLandmarks = rawLandmarks.map((lm) => ({
          x: lm.x * sx,
          y: lm.y * sy,
          name: lm.name,
        }));

        const skinRgb = extractSkinColor(imageData, analysisLandmarks);

        // Calculate proportions with mm measurements (uses analysis canvas coords)
        setAnalysisProgress(65);
        setAnalysisMessage('正在测量面部尺寸...');
        const proportions = calculateProportions(analysisLandmarks);

        // Classify features
        setAnalysisProgress(80);
        setAnalysisMessage('正在分析面部特征...');
        const features = analyzeFeatures(analysisLandmarks, proportions, skinRgb);

        // Recommendations
        setAnalysisProgress(85);
        setAnalysisMessage('正在生成妆造推荐...');
        const recommendations = getRecommendations(features, 3);

        // Match bloggers
        setAnalysisProgress(90);
        setAnalysisMessage('正在匹配相似博主...');
        const bloggersData = await bloggersPromise;
        const matchedBloggers = matchBloggers(features, proportions, bloggersData, 3);

        // Granular recs
        setAnalysisProgress(93);
        setAnalysisMessage('正在生成分部位推荐...');
        const granularRecs = await getGranularRecommendations(features);
        const granularRefs: PartRecommendationRef[] = granularRecs.map((r) => ({
          part: r.part, partKey: r.partKey,
          userFeature: r.userFeature, userFeatureLabel: r.userFeatureLabel,
          icon: r.icon, tip: r.tip,
          recommendedBloggerIds: r.recommendedBloggers.map((b) => b.id),
          why: r.why,
        }));

        // Template compliment
        const templateCompliment = generateCompliment(features, proportions);

        // AI compliment
        setAnalysisProgress(97);
        setAnalysisMessage('AI正在为你写专属夸夸...');
        const aiCompliment = await generateAICompliment(features, proportions);

        const result: AnalysisResult = {
          id: `bm_${Date.now()}`,
          createdAt: new Date().toISOString(),
          imageDataUrl: imageEl.src,
          imageWidth: imageEl.naturalWidth,
          imageHeight: imageEl.naturalHeight,
          ...features,
          proportions,
          landmarks: displayLandmarks,
          detectionBox: rawBox
            ? {
                x: rawBox.x,
                y: rawBox.y,
                width: rawBox.width,
                height: rawBox.height,
              }
            : null,
          recommendations,
          matchedBloggers,
          compliment: aiCompliment || templateCompliment,
          aiCompliment: aiCompliment || undefined,
          granularRecommendations: granularRefs,
        };

        setAnalysisProgress(100);
        setAnalysisMessage(aiCompliment ? 'AI夸夸生成完成！✨' : '分析完成！✨');
        setAnalysisResult(result);
        addToHistory(result);

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '分析失败，请重试';
        setAnalysisProgress(0);
        setAnalysisMessage(message);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setIsAnalyzing, setAnalysisProgress, setAnalysisMessage, setAnalysisResult, addToHistory]
  );

  return { loadModelsAndAnalyze };
}
