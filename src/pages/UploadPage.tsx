import { motion } from 'framer-motion';
import PhotoUploader from '@/components/upload/PhotoUploader';

export default function UploadPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          上传你的照片 📸
        </h1>
        <p className="text-gray-400">
          请选择一张正脸、光线充足的照片，分析效果会更好哦～
        </p>
      </motion.div>

      <div className="w-full max-w-2xl">
        <PhotoUploader />
      </div>
    </div>
  );
}
