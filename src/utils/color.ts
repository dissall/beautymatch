import type { SkinTone } from '@/types';

export interface SkinColorInfo {
  tone: SkinTone;
  label: string;
  hex: string;
  description: string;
  suitableColors: string[];
}

export const skinToneInfoMap: Record<SkinTone, SkinColorInfo> = {
  cool_white: {
    tone: 'cool_white',
    label: '冷白皮',
    hex: '#FDE8E9',
    description: '白皙透亮带粉调，选粉色系、莓果色系妆容最适合',
    suitableColors: ['#F8C8D2', '#E8A0B4', '#D4789A', '#C06080'],
  },
  warm_white: {
    tone: 'warm_white',
    label: '暖白皮',
    hex: '#FDEAD5',
    description: '白皙中透着暖调，几乎所有色系都能驾驭，百搭王',
    suitableColors: ['#FDDCB5', '#F5C896', '#EDB478', '#E0A060'],
  },
  neutral: {
    tone: 'neutral',
    label: '中性皮',
    hex: '#F5E0CD',
    description: '不偏冷不偏暖的万能肤色，选什么颜色都好看',
    suitableColors: ['#F0D8C0', '#E8C8A8', '#D8B890', '#C8A878'],
  },
  warm_yellow: {
    tone: 'warm_yellow',
    label: '暖黄皮',
    hex: '#F0D5A8',
    description: '健康的暖调肤色，橘棕、珊瑚色调最适合你',
    suitableColors: ['#F0C890', '#E8B878', '#D8A868', '#C89858'],
  },
  wheat: {
    tone: 'wheat',
    label: '小麦色',
    hex: '#D4A574',
    description: '阳光健康的高级肤色，欧美妆和古铜妆绝配',
    suitableColors: ['#D8A870', '#C89860', '#B88850', '#A87848'],
  },
};

export function getSkinColorInfo(tone: SkinTone): SkinColorInfo {
  return skinToneInfoMap[tone] || skinToneInfoMap.warm_yellow;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function getBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
