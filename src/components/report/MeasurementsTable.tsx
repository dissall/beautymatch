import { motion } from 'framer-motion';
import type { FaceMeasurements } from '@/types';

interface MeasurementsTableProps {
  measurements: FaceMeasurements;
}

interface MeasureRow {
  label: string;
  value: string;
  normal: string;
  category: string;
}

function buildRows(m: FaceMeasurements): MeasureRow[] {
  return [
    { label: '面部宽度', value: `${m.faceWidth} mm`, normal: '130-150', category: '基础尺寸' },
    { label: '面部高度', value: `${m.faceHeight} mm`, normal: '180-210', category: '基础尺寸' },
    { label: '面宽高比', value: m.widthHeightRatio.toFixed(3), normal: '0.75-0.90', category: '基础尺寸' },
    { label: '上庭高度', value: `${m.upperThirdMm} mm`, normal: '55-70', category: '三庭' },
    { label: '中庭高度', value: `${m.middleThirdMm} mm`, normal: '55-70', category: '三庭' },
    { label: '下庭高度', value: `${m.lowerThirdMm} mm`, normal: '55-70', category: '三庭' },
    { label: '左眼宽度', value: `${m.leftEyeWidthMm} mm`, normal: '25-32', category: '眼部' },
    { label: '右眼宽度', value: `${m.rightEyeWidthMm} mm`, normal: '25-32', category: '眼部' },
    { label: '瞳距', value: `${m.interpupillaryDistance} mm`, normal: '58-68', category: '眼部' },
    { label: '眉眼间距', value: `${m.browToEyeDistance} mm`, normal: '8-18', category: '眼部' },
    { label: '鼻宽', value: `${m.noseWidth} mm`, normal: '30-40', category: '鼻部' },
    { label: '鼻高', value: `${m.noseHeight} mm`, normal: '42-55', category: '鼻部' },
    { label: '唇宽', value: `${m.lipWidth} mm`, normal: '40-52', category: '唇部' },
    { label: '唇高', value: `${m.lipHeight} mm`, normal: '8-18', category: '唇部' },
    { label: '下颌宽度', value: `${m.jawWidth} mm`, normal: '100-135', category: '轮廓' },
    { label: '额头宽度', value: `${m.foreheadWidth} mm`, normal: '115-140', category: '轮廓' },
    { label: '颧骨宽度', value: `${m.cheekboneWidth} mm`, normal: '125-150', category: '轮廓' },
    { label: '人中长度', value: `${m.philtrumLength} mm`, normal: '12-18', category: '其他' },
    { label: '下颌/额头比', value: m.jawForeheadRatio.toFixed(3), normal: '0.75-0.95', category: '轮廓' },
    { label: '颧骨宽度比', value: m.cheekboneWidthRatio.toFixed(3), normal: '0.90-1.10', category: '轮廓' },
  ];
}

const categoryColors: Record<string, string> = {
  '基础尺寸': '#10B981',
  '三庭': '#F59E0B',
  '眼部': '#8B5CF6',
  '鼻部': '#EF4444',
  '唇部': '#EC4899',
  '轮廓': '#3B82F6',
  '其他': '#6B7280',
};

export default function MeasurementsTable({ measurements }: MeasurementsTableProps) {
  const rows = buildRows(measurements);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-lg shadow-pink-100/50 border border-pink-50"
    >
      <h3 className="text-xl font-bold text-gray-800 text-center mb-5">
        📏 面部精确测量数据
      </h3>
      <p className="text-xs text-gray-400 text-center mb-4 -mt-3">
        基于 68 点面部特征定位 + 虹膜参考比例推算（虹膜 ≈ 11.7mm）
      </p>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pink-100">
              <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">类别</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">测量项目</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">测量值</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">参考范围</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.03 }}
                className="border-b border-pink-50/50 hover:bg-pink-50/30 transition-colors"
              >
                <td className="py-2.5 px-3">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: categoryColors[row.category] || '#999' }}
                  />
                  <span className="text-xs text-gray-400">{row.category}</span>
                </td>
                <td className="py-2.5 px-3 font-medium text-gray-700">{row.label}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-pink-600">{row.value}</td>
                <td className="py-2.5 px-3 text-right text-xs text-gray-400">{row.normal}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-2">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.02 }}
            className="flex items-center justify-between p-3 rounded-xl bg-pink-50/30"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: categoryColors[row.category] || '#999' }}
              />
              <span className="text-sm text-gray-700 truncate">{row.label}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="font-mono font-bold text-pink-600 text-sm">{row.value}</span>
              <span className="text-xs text-gray-400 ml-1">{row.normal}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
