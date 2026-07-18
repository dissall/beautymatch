import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 20;
const MAX_WIDTH = 1200;

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= MAX_WIDTH) { resolve(dataUrl); return; }
      const c = document.createElement('canvas');
      const r = MAX_WIDTH / img.width;
      c.width = MAX_WIDTH; c.height = img.height * r;
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}

export default function PhotoUploader() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setUploadedImage } = useAppStore();
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addPhotos = useCallback(async (files: File[]) => {
    setError(null);
    setPhotos((prev) => {
      if (prev.length + files.length > MAX_PHOTOS) {
        setError(`最多上传 ${MAX_PHOTOS} 张照片哦～`);
        return prev;
      }
      return prev;
    });

    const newPhotos: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件～支持 JPG、PNG、WebP'); return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`图片太大了，请小于 ${MAX_SIZE_MB}MB～`); return;
      }
      const dataUrl = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(file);
      });
      newPhotos.push(await compressImage(dataUrl));
    }

    setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addPhotos,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] },
    maxFiles: MAX_PHOTOS,
    multiple: true,
  });

  const handleCameraCapture = () => cameraInputRef.current?.click();
  const handleCameraFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) await addPhotos(files);
    e.target.value = '';
  };
  const handleRemove = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));
  const handleStart = () => {
    if (photos.length > 0) {
      setUploadedImage(JSON.stringify(photos));
      navigate('/analyzing');
    }
  };
  const handleReset = () => {
    setPhotos([]); setUploadedImage(null); setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {photos.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            {/* Dropzone */}
            <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-pink-400 bg-pink-50 scale-[1.02]' : 'border-pink-200 hover:border-pink-300 hover:bg-pink-50/50'}`}>
              <input {...getInputProps()} />
              <motion.div animate={isDragActive ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl mb-4">
                {isDragActive ? '📸' : '📷'}
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{isDragActive ? '放开就上传啦～' : '点击或拖拽上传照片'}</h3>
              <p className="text-gray-400 text-sm">支持 JPG / PNG / WebP · 单张不超过 20MB</p>
              <p className="text-pink-400 text-sm font-medium mt-1">📸 上传 2-3 张不同角度，AI 投票识别更精准！</p>
            </div>

            {/* Camera + Gallery buttons */}
            <div className="flex gap-4 mt-5">
              <label
                {...getRootProps()}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border-2 border-pink-200 text-pink-500 font-semibold cursor-pointer hover:bg-pink-50 transition-colors shadow-sm"
              >
                <span className="text-xl">🖼️</span> 选择照片
              </label>
              <button
                onClick={handleCameraCapture}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all"
              >
                <span className="text-xl">📸</span> 拍照上传
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                multiple
                className="hidden"
                onChange={handleCameraFile}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
            <div className={`grid gap-4 ${photos.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-2'} ${photos.length >= 3 ? 'md:grid-cols-3' : ''}`}>
              {photos.map((p, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="relative">
                  <div className="rounded-2xl overflow-hidden shadow-lg shadow-pink-200/50 aspect-square">
                    <img src={p} alt={`照片 ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => handleRemove(i)} className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-lg border text-sm">✕</button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">照片 {i + 1}</div>
                </motion.div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <div className="flex flex-col gap-3">
                  <div {...getRootProps()} className="cursor-pointer flex-1">
                    <input {...getInputProps()} />
                    <div className="border-2 border-dashed border-pink-300 rounded-2xl aspect-square flex flex-col items-center justify-center text-pink-400 hover:bg-pink-50 transition-colors">
                      <span className="text-3xl">🖼️</span>
                      <span className="text-xs mt-1">添加照片</span>
                      <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS}</span>
                    </div>
                  </div>
                  <button onClick={handleCameraCapture} className="border-2 border-dashed border-pink-300 rounded-2xl aspect-square flex flex-col items-center justify-center text-pink-400 hover:bg-pink-50 transition-colors cursor-pointer">
                    <span className="text-3xl">📸</span>
                    <span className="text-xs mt-1">拍照添加</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-600">
              <p className="font-medium mb-1">📸 多角度拍照建议</p>
              <ul className="text-xs space-y-0.5 text-blue-500">
                <li>✅ 照片1：正脸平视镜头</li>
                <li>✅ 照片2：正脸自然光线</li>
                <li>✅ 照片3：正脸不同表情或角度</li>
                <li>💡 AI 对每张照片独立分析，投票选出最准确结果</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={handleReset} className="px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-medium hover:border-pink-200 hover:text-pink-500 transition-colors">重新选择</button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleStart} className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transition-shadow">
                ✨ 开始分析（{photos.length} 张）
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center">{error}</motion.div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ icon: '🎯', text: '正脸朝向镜头，五官清晰可见' },{ icon: '☀️', text: '光线充足均匀，避免强侧光' },{ icon: '🔒', text: '照片仅在本地分析，不会上传' }].map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <span className="text-2xl">{t.icon}</span><span className="text-sm text-gray-500">{t.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
