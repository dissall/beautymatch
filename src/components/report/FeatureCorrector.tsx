import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { FaceShape, EyeShape, NoseShape, LipShape, SkinTone } from '@/types';

const faceShapeOptions: { value: FaceShape; label: string }[] = [
  { value: 'oval', label: '🥚 鹅蛋脸' }, { value: 'round', label: '⭕ 圆脸' },
  { value: 'square', label: '⬜ 方脸' }, { value: 'heart', label: '💜 瓜子脸' },
  { value: 'diamond', label: '💎 菱形脸' }, { value: 'long', label: '📏 长脸' },
];
const eyeOptions: { value: EyeShape; label: string }[] = [
  { value: 'almond', label: '👁️ 杏仁眼' }, { value: 'round', label: '👀 圆眼' },
  { value: 'phoenix', label: '🦅 丹凤眼' }, { value: 'peach', label: '🌸 桃花眼' },
  { value: 'droopy', label: '🥺 下垂眼' }, { value: 'upturned', label: '😼 上挑眼' },
];
const noseOptions: { value: NoseShape; label: string }[] = [
  { value: 'standard', label: '👃 标准鼻' }, { value: 'flat', label: '🫧 塌鼻' },
  { value: 'aquiline', label: '🦅 鹰钩鼻' }, { value: 'bulbous', label: '🔴 蒜头鼻' },
  { value: 'upturned_nose', label: '🐽 朝天鼻' },
];
const lipOptions: { value: LipShape; label: string }[] = [
  { value: 'standard', label: '👄 标准唇' }, { value: 'thin', label: '💋 薄唇' },
  { value: 'thick', label: '🫦 厚唇' }, { value: 'smiling', label: '😊 微笑唇' },
  { value: 'droopy_lip', label: '😔 下垂唇' },
];
const skinOptions: { value: SkinTone; label: string }[] = [
  { value: 'cool_white', label: '☁️ 冷白皮' }, { value: 'warm_white', label: '🌟 暖白皮' },
  { value: 'neutral', label: '🤍 中性皮' }, { value: 'warm_yellow', label: '🌻 暖黄皮' },
  { value: 'wheat', label: '🌾 小麦色' },
];

export default function FeatureCorrector() {
  const { analysisResult, setAnalysisResult } = useAppStore();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!analysisResult) return null;

  const handleCorrect = (field: string, value: string) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      [field]: value,
      // Mark that user manually corrected
      _userCorrected: true,
    });
  };

  const handleSaveCorrection = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mx-auto text-xs font-medium px-4 py-2 rounded-full border border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
      >
        🔧 {open ? '收起纠错' : 'AI识别有误？点此手动调整'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 mt-4">
              <p className="text-xs text-amber-500 text-center mb-4">
                如果AI分析结果与你的实际特征不符，可以手动修正以获取更精准的推荐
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <CorrectionSelect
                  label="脸型"
                  value={analysisResult.faceShape}
                  options={faceShapeOptions}
                  onChange={(v) => handleCorrect('faceShape', v)}
                />
                <CorrectionSelect
                  label="眼型"
                  value={analysisResult.eyeShape}
                  options={eyeOptions}
                  onChange={(v) => handleCorrect('eyeShape', v)}
                />
                <CorrectionSelect
                  label="鼻型"
                  value={analysisResult.noseShape}
                  options={noseOptions}
                  onChange={(v) => handleCorrect('noseShape', v)}
                />
                <CorrectionSelect
                  label="唇型"
                  value={analysisResult.lipShape}
                  options={lipOptions}
                  onChange={(v) => handleCorrect('lipShape', v)}
                />
                <CorrectionSelect
                  label="肤色"
                  value={analysisResult.skinTone}
                  options={skinOptions}
                  onChange={(v) => handleCorrect('skinTone', v)}
                />
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={handleSaveCorrection}
                  className="text-xs font-medium px-6 py-2 rounded-full bg-amber-400 text-white hover:bg-amber-500 transition-colors"
                >
                  {saved ? '✅ 已保存修正' : '💾 保存修正并刷新推荐'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CorrectionSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-amber-600 mb-1 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs px-2 py-2 rounded-xl border border-amber-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
