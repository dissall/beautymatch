import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-7xl mb-4">💄</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            关于 BeautyMatch
          </h1>
          <p className="text-gray-400">
            AI 驱动的妆造推荐工具，帮助你发现最美的自己
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-pink-100/50 border border-pink-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 项目定位</h2>
            <p className="text-gray-600 leading-relaxed">
              BeautyMatch 是一款面向女性用户的 AI 妆造推荐工具。通过上传照片，AI 会自动分析你的脸型、眼型、鼻型、唇型、
              三庭五眼比例、肤色等多维度特征，然后为你推荐最适合的妆造风格，并匹配特征相似的抖音/小红书美妆博主，
              让你轻松找到适合自己的妆容参考。
            </p>
          </section>

          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-pink-100/50 border border-pink-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🔒 隐私说明</h2>
            <p className="text-gray-600 leading-relaxed">
              你的照片安全是第一位的。BeautyMatch 使用 face-api.js 在浏览器端完成所有的人脸分析，
              照片不会上传到任何服务器。所有数据仅存储在你的本地浏览器中，你可以随时清除。
            </p>
          </section>

          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-pink-100/50 border border-pink-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🛠️ 技术栈</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'React 18', 'TypeScript', 'Vite', 'Tailwind CSS',
                'Framer Motion', 'face-api.js', 'Recharts', 'html2canvas',
              ].map((tech) => (
                <div key={tech} className="bg-pink-50/50 rounded-xl p-3 text-center">
                  <span className="text-sm font-medium text-gray-700">{tech}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-pink-100/50 border border-pink-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 分析维度</h2>
            <div className="flex flex-wrap gap-2">
              {[
                '脸型', '眼型', '鼻型', '唇型', '三庭五眼',
                '肤色', '下颌线', '颧骨', '眉眼距', '人中',
              ].map((dim) => (
                <span key={dim} className="bg-pink-50 text-pink-500 px-4 py-2 rounded-full text-sm font-medium">
                  {dim}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-pink-100/50 border border-pink-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 免责声明</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              BeautyMatch 仅供个人学习和参考使用。AI 分析结果基于算法估算，可能存在误差。
              妆造推荐基于通用规则引擎，不一定适合每个人的具体情况。
              博主数据来源于公开信息，仅供学习参考。如有任何问题，请联系我们。
            </p>
          </section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link to="/upload">
            <Button size="lg" icon="✨">
              开始体验
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
