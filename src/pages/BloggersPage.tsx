import { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { motion } from 'framer-motion';
import BloggerList from '@/components/bloggers/BloggerList';
import { loadBloggers } from '@/services/bloggerLoader';
import type { Blogger } from '@/types';

const PAGE_SIZE = 30;

export default function BloggersPage() {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Load data once
  useEffect(() => {
    let cancelled = false;
    loadBloggers().then((data) => {
      if (!cancelled) {
        setBloggers(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Deferred search for smoother typing
  const deferredSearch = useDeferredValue(searchQuery);

  // Filter with memoization
  const filtered = useMemo(() => {
    let result = bloggers;

    if (platformFilter !== 'all') {
      result = result.filter((b) => b.platform === platformFilter || b.platform === 'both');
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.bio.toLowerCase().includes(q)
      );
    }

    return result;
  }, [bloggers, platformFilter, deferredSearch]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageBloggers = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePlatformChange = useCallback((key: string) => {
    setPlatformFilter(key);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="text-5xl mb-4 inline-block"
          >
            💄
          </motion.div>
          <p className="text-gray-400">正在加载博主数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          👩‍🎤 美妆博主库
        </h1>
        <p className="text-gray-400">
          共 {bloggers.length} 位博主 · 每人都有 AI 训练的面部数据 · 点击可跳转平台主页
        </p>
      </motion.div>

      {/* Search & Filter */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="搜索博主名称、标签..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-5 py-3 rounded-2xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-gray-700 placeholder-gray-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: '全部' },
              { key: 'douyin', label: '🎵 抖音' },
              { key: 'xiaohongshu', label: '📕 小红书' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => handlePlatformChange(opt.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  platformFilter === opt.key
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-500 border border-pink-100 hover:bg-pink-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-400 mt-3">
          {deferredSearch || platformFilter !== 'all'
            ? `筛选结果：${filtered.length} 位博主`
            : `共 ${bloggers.length} 位博主`}
          {deferredSearch && <span className="text-pink-400"> · 搜索 "{deferredSearch}"</span>}
        </p>
      </div>

      {/* Bloggers grid */}
      <div className="max-w-5xl mx-auto">
        <BloggerList bloggers={pageBloggers} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-pink-200 text-gray-600 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← 上一页
          </button>

          <div className="flex gap-1">
            {generatePageNumbers(safePage, totalPages).map((page, i) =>
              page === '...' ? (
                <span key={`dots-${i}`} className="px-2 py-2 text-gray-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    page === safePage
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white border border-pink-100 text-gray-600 hover:bg-pink-50'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-pink-200 text-gray-600 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            下一页 →
          </button>

          <span className="ml-3 text-xs text-gray-400">
            {safePage} / {totalPages} 页
          </span>
        </div>
      )}
    </div>
  );
}

/** Generate pagination with ellipsis: [1, ..., 4, 5, 6, ..., 37] */
function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  pages.push(1);

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}
