import type { FaceFeatures, Proportions, FaceShape, EyeShape, NoseShape, LipShape, SkinTone } from '@/types';

const complimentTemplates: Record<string, Record<string, string>> = {
  faceShape: {
    oval: '标准的鹅蛋脸！这是东方审美中最完美的脸型，线条流畅柔和，任何发型和妆造都能轻松驾驭～',
    round: '可爱的圆脸！满满的胶原蛋白，超显年轻，是传说中的"娃娃脸"，甜美妆容的绝佳画布～',
    square: '大气的方脸，下颌线条分明，是高级脸的代表！超模们最爱的脸型，气场十足～',
    heart: '精致的瓜子脸！上宽下窄的完美比例，自带高级感，什么风格都能轻松驾驭～',
    diamond: '独特的菱形脸，颧骨突出是超模标配，立体感满分，欧美妆简直为你而生～',
    long: '修长的长脸型，气质优雅知性，是古典美人的标准配置～',
  },
  eyeShape: {
    almond: '标致的杏仁眼，眼型如杏仁般完美，是化妆师最爱的眼型，任何眼妆都能完美呈现～',
    round: '圆圆的大眼睛，清澈明亮，少女感满满！日系无辜大眼妆就是为你准备的～',
    phoenix: '独特的丹凤眼，眼角微挑自带冷艳气质，中式古典妆容的绝佳画布～',
    peach: '迷人的桃花眼，眼角微弯自带笑意，看你一眼就让人心动的类型～',
    droopy: '温柔的下垂眼，给人无辜又亲切的感觉，是日系狗狗眼妆的标配～',
    upturned: '妩媚的上挑眼，眼角上扬自带电力，猫眼妆和欧美妆的神级底子～',
  },
  noseShape: {
    standard: '标准的鼻子，鼻梁挺直鼻翼适中，侧面看气质满分～',
    flat: '小巧的鼻子，搭配适合的妆容能显得更加精致立体～',
    aquiline: '独特的鹰钩鼻，鼻梁高挺自带异域风情，是很多超模的标志特征～',
    bulbous: '可爱的蒜头鼻，圆润的鼻头给人亲和力十足的感觉～',
    upturned_nose: '俏皮的朝天鼻，鼻尖微翘显得活泼可爱，少女感满满～',
  },
  lipShape: {
    standard: '标准的唇型，上薄下厚比例完美，各种唇妆都能轻松驾驭～',
    thin: '精致的薄唇，给人干练知性的感觉，浅色唇妆更显气质～',
    thick: '性感的厚唇，饱满有型，是欧美妆和玻尿酸唇的天然优势～',
    smiling: '天生微笑唇，嘴角自然上扬，即使不笑也给人温暖的感觉～',
    droopy_lip: '柔和的唇型，搭配上挑嘴角的画法会更加精神～',
  },
  skinTone: {
    cool_white: '冷白皮！白皙透亮带粉调，是让无数人羡慕的肤色，粉色调的妆容和穿搭最适合你～',
    warm_white: '暖白皮！白皙中透着健康的暖调，几乎所有色系的妆容都能驾驭～',
    neutral: '中性肤色！不偏冷不偏暖，是所有彩妆品都适用的万能肤色～',
    warm_yellow: '暖黄皮！健康的暖调肤色，选对色调就能美得惊人，橘棕色调是你的本命～',
    wheat: '小麦色！阳光健康的高级肤色，欧美妆和古铜妆就是为你而生的～',
  },
};

const proportionComments: Record<string, string> = {
  balanced: '三庭五眼比例非常协调，是标准的黄金比例～',
  upperLong: '上庭偏长，适合用刘海修饰，空气刘海最适合你～',
  middleLong: '中庭偏长，可以通过横向腮红和下眼影来视觉缩短～',
  lowerLong: '下庭偏长，下巴修容和提亮上唇可以起到很好的修饰效果～',
};

function getProportionComment(proportions: Proportions): string {
  const { upperThird, middleThird, lowerThird } = proportions;
  const avg = (upperThird + middleThird + lowerThird) / 3;
  const threshold = 5;

  if (upperThird - avg > threshold) return proportionComments.upperLong!;
  if (middleThird - avg > threshold) return proportionComments.middleLong!;
  if (lowerThird - avg > threshold) return proportionComments.lowerLong!;
  return proportionComments.balanced!;
}

export function generateCompliment(
  features: FaceFeatures,
  proportions: Proportions
): string {
  const facePart = complimentTemplates.faceShape[features.faceShape] || '你的脸型很独特～';
  const eyePart = complimentTemplates.eyeShape[features.eyeShape] || '';
  const skinPart = complimentTemplates.skinTone[features.skinTone] || '';
  const proportionPart = getProportionComment(proportions);

  const parts = [facePart];
  if (eyePart) parts.push(`再看你的眼睛，${eyePart}`);
  if (skinPart) parts.push(`你的肤色是${skinPart}`);
  parts.push(`从比例来看，${proportionPart}`);

  return parts.join('') + ' 总之一句话——你本来就很美！✨';
}
