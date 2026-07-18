import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { Proportions } from '@/types';

interface ProportionsRadarProps {
  proportions: Proportions;
}

export default function ProportionsRadar({ proportions }: ProportionsRadarProps) {
  const data = [
    { name: '上庭', value: proportions.upperThird, fullMark: 40, desc: getSanTingComment(proportions.upperThird) },
    { name: '中庭', value: proportions.middleThird, fullMark: 40, desc: getSanTingComment(proportions.middleThird) },
    { name: '下庭', value: proportions.lowerThird, fullMark: 40, desc: getSanTingComment(proportions.lowerThird) },
    { name: '左眼宽', value: proportions.leftEye, fullMark: 120, desc: getWuYanComment(proportions.leftEye) },
    { name: '右眼宽', value: proportions.rightEye, fullMark: 120, desc: getWuYanComment(proportions.rightEye) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-3xl p-6 shadow-lg shadow-pink-100/50 border border-pink-50"
    >
      <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
        📐 三庭五眼比例
      </h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#FDE8F0" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'auto']}
              tick={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-xl shadow-lg border border-pink-100 text-sm">
                      <p className="font-bold text-gray-700">{d.name}</p>
                      <p className="text-pink-500">值: {d.value}</p>
                      <p className="text-gray-400 text-xs">{d.desc}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="你的比例"
              dataKey="value"
              stroke="#F472B6"
              fill="#F472B6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs text-gray-500">
        <div>
          <span className="font-semibold text-gray-700">上庭</span>
          <p>{proportions.upperThird}%</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">中庭</span>
          <p>{proportions.middleThird}%</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">下庭</span>
          <p>{proportions.lowerThird}%</p>
        </div>
      </div>
    </motion.div>
  );
}

function getSanTingComment(value: number): string {
  if (value >= 31 && value <= 35) return '完美比例 ✨';
  if (value > 35) return '偏长，可通过发型修饰';
  if (value < 31) return '偏短，可通过高颅顶修饰';
  return '在标准范围内';
}

function getWuYanComment(value: number): string {
  if (value >= 90 && value <= 110) return '标准比例 👍';
  return '可通过眼妆调整视觉效果';
}
