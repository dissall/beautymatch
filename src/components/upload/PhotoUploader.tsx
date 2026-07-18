import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

export default function PhotoUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setUploadedImage } = useAppStore();
  const navigate = useNavigate();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件哦～支持 JPG、PNG、WebP 格式');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setError('图片太大了，请上传小于 20MB 的照片～');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;

        // 压缩大图
        const img = new Image();
        img.onload = () => {
          let resized = dataUrl;
          if (img.width > 1200) {
            const canvas = document.createElement('canvas');
            const ratio = 1200 / img.width;
            canvas.width = 1200;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resized = canvas.toDataURL('image/jpeg', 0.85);
          }
          setPreview(resized);
          setUploadedImage(resized);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [setUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] },
    maxFiles: 1,
    multiple: false,
  });

  const handleStartAnalysis = () => {
    if (preview) {
      navigate('/analyzing');
    }
  };

  const handleReset = () => {
    setPreview(null);
    setUploadedImage(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-3xl p-12 text-center
                transition-all duration-300 cursor-pointer
                ${isDragActive
                  ? 'border-pink-400 bg-pink-50 scale-[1.02]'
                  : 'border-pink-200 hover:border-pink-300 hover:bg-pink-50/50'
                }
              `}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-6xl mb-4"
              >
                {isDragActive ? '📸' : '📷'}
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {isDragActive ? '放开就上传啦～' : '点击或拖拽上传照片'}
              </h3>
              <p className="text-gray-400 text-sm">
                支持 JPG / PNG / WebP 格式，建议上传正脸、光线充足的照片
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-pink-200/50">
              <img
                src={preview}
                alt="预览"
                className="w-full max-h-[500px] object-contain bg-gray-50"
              />
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-pink-500 shadow-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-medium hover:border-pink-200 hover:text-pink-500 transition-colors"
              >
                重新选择
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartAnalysis}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transition-shadow"
              >
                ✨ 开始分析
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '💡', text: '正脸朝向镜头，五官清晰可见' },
          { icon: '☀️', text: '光线充足均匀，避免强侧光' },
          { icon: '🔒', text: '照片仅在本地分析，不会上传' },
        ].map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-pink-100 shadow-sm"
          >
            <span className="text-2xl">{tip.icon}</span>
            <span className="text-sm text-gray-500">{tip.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
