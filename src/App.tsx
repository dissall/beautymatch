import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HomePage from '@/pages/HomePage';
import UploadPage from '@/pages/UploadPage';
import AnalyzingPage from '@/pages/AnalyzingPage';
import ReportPage from '@/pages/ReportPage';
import BloggersPage from '@/pages/BloggersPage';
import BloggerDetailPage from '@/pages/BloggerDetailPage';
import AboutPage from '@/pages/AboutPage';
import { useAppStore } from '@/store/useAppStore';
import { preloadBloggers } from '@/services/bloggerLoader';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="pt-20 pb-8 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/analyzing" element={<AnalyzingPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/bloggers" element={<BloggersPage />} />
                <Route path="/blogger/:id" element={<BloggerDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-8xl mb-6">🔮</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
                    <p className="text-gray-400 mb-6">页面不存在，可能被化妆师藏起来了～</p>
                    <a href="/" className="text-pink-500 font-medium hover:text-pink-600">返回首页</a>
                  </div>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const loadHistory = useAppStore((s) => s.loadHistory);

  useEffect(() => {
    loadHistory();
    preloadBloggers(); // start loading bloggers in background
  }, [loadHistory]);

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
