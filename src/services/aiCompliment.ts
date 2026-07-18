import type { FaceFeatures, Proportions, FaceShape, EyeShape, SkinTone } from '@/types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

// Label maps for Chinese descriptions
const faceShapeLabel: Record<string, string> = {
  oval: '鹅蛋脸', round: '圆脸', square: '方脸', heart: '瓜子脸', diamond: '菱形脸', long: '长脸',
};
const eyeLabel: Record<string, string> = {
  almond: '杏仁眼', round: '圆眼', phoenix: '丹凤眼', peach: '桃花眼', droopy: '下垂眼', upturned: '上挑眼',
};
const noseLabel: Record<string, string> = {
  standard: '标准鼻', flat: '塌鼻', aquiline: '鹰钩鼻', bulbous: '蒜头鼻', upturned_nose: '朝天鼻',
};
const lipLabel: Record<string, string> = {
  standard: '标准唇', thin: '薄唇', thick: '厚唇', smiling: '微笑唇', droopy_lip: '下垂唇',
};
const skinLabel: Record<string, string> = {
  cool_white: '冷白皮', warm_white: '暖白皮', neutral: '中性皮', warm_yellow: '暖黄皮', wheat: '小麦色',
};

function buildFeatureDescription(features: FaceFeatures, proportions: Proportions): string {
  return `
脸型：${faceShapeLabel[features.faceShape]}
眼型：${eyeLabel[features.eyeShape]}
鼻型：${noseLabel[features.noseShape]}
唇型：${lipLabel[features.lipShape]}
肤色：${skinLabel[features.skinTone]}
三庭比例：上庭${proportions.upperThird}% / 中庭${proportions.middleThird}% / 下庭${proportions.lowerThird}%
下颌线：${features.jawline === 'angular' ? '棱角分明' : features.jawline === 'round' ? '圆润柔和' : 'V型尖下巴'}
颧骨：${features.cheekbone === 'prominent' ? '立体突出' : features.cheekbone === 'moderate' ? '恰到好处' : '平缓柔和'}
  `.trim();
}

export async function generateAICompliment(
  features: FaceFeatures,
  proportions: Proportions
): Promise<string | null> {
  const featureDesc = buildFeatureDescription(features, proportions);

  const systemPrompt = `你是一个温暖、专业的AI美妆顾问，名叫"BeautyMatch小美"。你的任务是给用户写一段真诚、温暖的夸赞和妆容建议。

规则：
1. 用"亲爱的"或"小姐姐"开头
2. 根据用户的具体五官特征，用真诚、不浮夸的语言夸赞她（不要套模板，要有针对性）
3. 给1-2条实用的妆容小建议
4. 结尾要有温暖的祝福
5. 总长度150-250字
6. 用口语化、像闺蜜聊天的语气
7. 加入1-2个合适的emoji
8. 不要提到"根据数据分析"之类的词语，要自然`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请根据以下面部特征，给我写一段温暖的夸赞和妆容建议：\n\n${featureDesc}` },
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.warn('DeepSeek API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content.trim() : null;
  } catch (err) {
    console.warn('AI compliment generation failed, will use template fallback:', err);
    return null;
  }
}
