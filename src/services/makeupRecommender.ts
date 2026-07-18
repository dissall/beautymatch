import type { FaceFeatures, FaceShape, MakeupRecommendation, MakeupStyle } from '@/types';
import makeupStyles from '@/data/makeupStyles.json';

const faceShapeStyleMap: Record<FaceShape, MakeupStyle[]> = {
  oval: ['korean_clear', 'japanese_genki', 'pure_desire', 'chinese_classic', 'milk_tea', 'french_lazy'],
  round: ['contour_3d', 'euro_mix', 'japanese_genki', 'cute_age', 'japanese_blush'],
  square: ['soft_korean', 'french_lazy', 'contour_3d', 'milk_tea'],
  heart: ['pure_desire', 'chinese_classic', 'korean_clear', 'milk_tea'],
  diamond: ['japanese_blush', 'milk_tea', 'soft_korean', 'japanese_genki', 'cute_age'],
  long: ['horizontal_blush', 'cute_age', 'japanese_blush', 'contour_3d'],
};

export function getRecommendations(
  features: FaceFeatures,
  topK: number = 3
): MakeupRecommendation[] {
  const suitableStyles = faceShapeStyleMap[features.faceShape] || [];

  const recommendations: MakeupRecommendation[] = [];

  for (const styleId of suitableStyles) {
    const styleData = makeupStyles.find((s) => s.id === styleId);
    if (!styleData) continue;

    recommendations.push({
      style: styleData.id as MakeupStyle,
      name: styleData.name,
      description: styleData.description,
      suitable: styleData.suitable,
      steps: styleData.steps.map((step) => ({
        order: step.order,
        title: step.title,
        description: step.description,
        tips: step.tips,
        products: step.products,
      })),
      icon: getStyleIcon(styleData.id),
    });
  }

  return recommendations.slice(0, topK);
}

function getStyleIcon(styleId: string): string {
  const iconMap: Record<string, string> = {
    korean_clear: '💧',
    japanese_genki: '🌸',
    contour_3d: '✨',
    euro_mix: '💋',
    soft_korean: '🌿',
    french_lazy: '🥖',
    pure_desire: '🎀',
    chinese_classic: '🏮',
    japanese_blush: '🍑',
    milk_tea: '🧋',
    cute_age: '🍬',
    horizontal_blush: '☀️',
  };
  return iconMap[styleId] || '💄';
}
