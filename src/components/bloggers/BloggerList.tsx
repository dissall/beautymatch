import { motion } from 'framer-motion';
import BloggerCard from './BloggerCard';
import type { Blogger } from '@/types';

interface BloggerListProps {
  bloggers: Blogger[];
}

export default function BloggerList({ bloggers }: BloggerListProps) {
  if (bloggers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-500">没有找到匹配的博主</h3>
        <p className="text-gray-400 mt-2">试试用其他关键词搜索吧～</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bloggers.map((blogger, i) => (
        <BloggerCard key={blogger.id} blogger={blogger} index={i} />
      ))}
    </div>
  );
}
