import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnalysisProgress from '@/components/analysis/AnalysisProgress';
import Button from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';

export default function AnalyzingPage() {
  const navigate = useNavigate();
  const {
    uploadedImage, setAnalysisProgress, setAnalysisMessage,
  } = useAppStore();
  const { loadModelsAndAnalyze } = useFaceAnalysis();
  const analyzingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uploadedImage) {
      navigate('/upload');
      return;
    }

    if (analyzingRef.current) return;
    analyzingRef.current = true;

    const runAnalysis = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('图片加载失败，请回到上一步重新上传'));
          // Timeout after 30 seconds
          setTimeout(() => reject(new Error('图片加载超时，请检查图片是否过大')), 30000);
        });

        await loadModelsAndAnalyze(img);
        // Brief delay to show 100%
        await new Promise((r) => setTimeout(r, 600));
        navigate('/report', { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : '分析失败';
        setError(message);
        setAnalysisProgress(0);
        setAnalysisMessage('');
      }
    };

    runAnalysis();
  }, []); // Run only once on mount

  const handleRetry = () => {
    setError(null);
    analyzingRef.current = false;
    navigate('/upload');
  };

  if (error) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-7xl mb-6">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">分析遇到了一点问题</h2>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-left">
            <p className="text-red-600 text-sm whitespace-pre-line leading-relaxed">
              {error}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={handleRetry} icon="🔄">
              重新上传
            </Button>
            <Button onClick={() => window.location.reload()} icon="🔃">
              刷新页面
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          AI 分析中...
        </h1>
        <p className="text-gray-400">
          请稍等片刻，正在仔细分析你的面部特征
        </p>
      </motion.div>

      <AnalysisProgress />

      {/* Privacy notice */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-gray-300 mt-12 text-center"
      >
        🔒 照片仅在本地浏览器中分析，不会上传到任何服务器
      </motion.p>
    </div>
  );
}
