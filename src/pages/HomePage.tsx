import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { history, analysisResult, removeFromHistory, restoreFromHistory } = useAppStore();

  // Show history if there are saved reports OR a current analysis exists
  const hasCurrent = !!analysisResult;
  const pastHistory = history.filter((r) => r.id !== analysisResult?.id);
  const showHistory = hasCurrent || pastHistory.length > 0;
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-7xl md:text-8xl mb-6"
        >
          💄
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
            BeautyMatch
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl text-gray-500 mb-2"
        >
          上传一张照片，AI 帮你分析脸部特征
        </motion.p>

        <motion.p
          {...fadeUp}
          transition={{ delay: 0.6 }}
          className="text-base text-gray-400 mb-10"
        >
          找到最匹配的美妆博主，获得专属妆造推荐 ✨
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/upload">
            <Button size="lg" icon="📸">
              开始分析我的脸型
            </Button>
          </Link>
          <Link to="/bloggers">
            <Button variant="secondary" size="lg" icon="👩‍🎤">
              浏览博主库
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20"
      >
        {[
          {
            icon: '🔒',
            title: '隐私安全',
            desc: '照片在浏览器端分析，不会上传到任何服务器',
          },
          {
            icon: '🤖',
            title: 'AI 驱动',
            desc: '基于深度学习的人脸特征检测，精准分析五官',
          },
          {
            icon: '💖',
            title: '专属推荐',
            desc: '智能匹配美妆博主，找到适合你的妆容风格',
          },
        ].map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + i * 0.15 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center border border-pink-100 shadow-lg shadow-pink-50"
          >
            <div className="text-4xl mb-3">{feat.icon}</div>
            <h3 className="font-bold text-gray-800 mb-2">{feat.title}</h3>
            <p className="text-sm text-gray-400">{feat.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="max-w-4xl mx-auto mt-20 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-8">📋 三步搞定</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {[
            { step: '1', icon: '📸', title: '上传照片', desc: '拖拽或点击上传正脸照' },
            { step: '2', icon: '🤖', title: 'AI 分析', desc: '自动检测脸部特征' },
            { step: '3', icon: '📊', title: '查看报告', desc: '获得专属妆造推荐' },
          ].map((item, i) => (
            <div key={i} className="flex md:flex-col items-center gap-4 md:gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-pink-200">
                {item.icon}
              </div>
              <div className="text-left md:text-center">
                <div className="text-xs text-pink-400 font-bold">Step {item.step}</div>
                <div className="font-bold text-gray-700">{item.title}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
              {i < 2 && (
                <div className="hidden md:block text-pink-300 text-2xl">→</div>
              )}
              {i < 2 && (
                <div className="md:hidden text-pink-300 text-xl absolute left-8">↓</div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* History Section */}
      {showHistory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">📋 我的报告</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Current analysis */}
            {hasCurrent && analysisResult && (
              <div className="bg-white rounded-2xl p-4 shadow-lg shadow-pink-100/50 border-2 border-pink-300 cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/report')}>
                <div className="flex items-center gap-3 mb-2">
                  {analysisResult.imageDataUrl && (
                    <img src={analysisResult.imageDataUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">当前分析结果</p>
                    <p className="text-xs text-pink-400">
                      {new Date(analysisResult.createdAt).toLocaleDateString('zh-CN')}
                      {analysisResult._confidence && ` · ${analysisResult._confidence}%`}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 truncate">{analysisResult.compliment?.slice(0, 40)}...</p>
              </div>
            )}
            {/* Past history */}
            {pastHistory.slice(0, hasCurrent ? 5 : 6).map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 cursor-pointer hover:shadow-lg hover:border-pink-300 transition-all group" onClick={() => { restoreFromHistory(r.id); navigate('/report'); }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800 text-sm truncate">{new Date(r.createdAt).toLocaleDateString('zh-CN')}</p>
                  <button onClick={(e) => { e.stopPropagation(); removeFromHistory(r.id); }} className="text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{r.compliment?.slice(0, 60)}...</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="text-center mt-16 mb-12">
        <Link to="/upload">
          <Button size="lg" icon="✨">
            免费开始使用
          </Button>
        </Link>
        <p className="text-xs text-gray-400 mt-3">完全免费，无需注册，保护隐私</p>
      </motion.div>
    </div>
  );
}
