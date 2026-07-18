import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import ReportHeader from '@/components/report/ReportHeader';
import FaceFeatureGrid from '@/components/report/FaceFeatureGrid';
import ProportionsRadar from '@/components/report/ProportionsRadar';
import SkinToneBar from '@/components/report/SkinToneBar';
import MakeupRecommendations from '@/components/report/MakeupRecommendations';
import GranularRecommendations from '@/components/report/GranularRecommendations';
import BloggerMatches from '@/components/report/BloggerMatches';
import ComplimentText from '@/components/report/ComplimentText';
import LandmarkOverlay from '@/components/report/LandmarkOverlay';
import MeasurementsTable from '@/components/report/MeasurementsTable';
import Button from '@/components/common/Button';
import { exportReportToPDF, encodeResultToHash } from '@/services/pdfExport';

export default function ReportPage() {
  const navigate = useNavigate();
  const { analysisResult } = useAppStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisResult) {
      navigate('/upload');
    }
  }, [analysisResult, navigate]);

  if (!analysisResult) {
    return null;
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      await exportReportToPDF(reportRef.current, analysisResult);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
    setIsExporting(false);
  };

  const handleShareLink = async () => {
    const hash = encodeResultToHash(analysisResult);
    const url = `${window.location.origin}/report#${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage('链接已复制到剪贴板！📋');
    } catch {
      setShareMessage(`分享链接：${url}`);
    }
    setTimeout(() => setShareMessage(null), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-3"
      >
        <Button size="sm" icon="📥" loading={isExporting} onClick={handleExportPDF}>
          导出PDF报告
        </Button>
        <Button size="sm" variant="secondary" icon="🔗" onClick={handleShareLink}>
          分享报告
        </Button>
        <Link to="/upload">
          <Button size="sm" variant="outline" icon="🔄">
            重新分析
          </Button>
        </Link>
      </motion.div>

      {shareMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto mb-4 p-3 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm text-center"
        >
          {shareMessage}
        </motion.div>
      )}

      {/* Report content */}
      <div ref={reportRef} className="max-w-4xl mx-auto">
        <ReportHeader result={analysisResult} />

        <div className="mt-8 space-y-10">
          {/* AI Compliment badge */}
          {analysisResult.aiCompliment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full px-4 py-1.5 text-xs text-purple-600 font-medium">
                🤖 AI 为你专属生成 · 每人都不一样
              </span>
            </motion.div>
          )}

          {/* ===== AI Landmark Overlay ===== */}
          {analysisResult.landmarks.length > 0 && (
            <LandmarkOverlay
              imageDataUrl={analysisResult.imageDataUrl}
              landmarks={analysisResult.landmarks}
              detectionBox={analysisResult.detectionBox}
              imageWidth={analysisResult.imageWidth || 800}
              imageHeight={analysisResult.imageHeight || 800}
            />
          )}

          <FaceFeatureGrid result={analysisResult} />

          {/* ===== Precise mm measurements ===== */}
          {analysisResult.proportions.measurements && (
            <MeasurementsTable measurements={analysisResult.proportions.measurements} />
          )}

          {/* ===== Granular Part-by-Part Recommendations ===== */}
          {analysisResult.granularRecommendations && analysisResult.granularRecommendations.length > 0 && (
            <GranularRecommendations recommendations={analysisResult.granularRecommendations} />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <ProportionsRadar proportions={analysisResult.proportions} />
            <SkinToneBar skinTone={analysisResult.skinTone} />
          </div>

          <MakeupRecommendations recommendations={analysisResult.recommendations} />

          <BloggerMatches matches={analysisResult.matchedBloggers} />

          <ComplimentText compliment={analysisResult.compliment} />
        </div>
      </div>
    </div>
  );
}
