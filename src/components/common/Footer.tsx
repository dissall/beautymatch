export default function Footer() {
  return (
    <footer className="bg-white border-t border-pink-100 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">
          💄 BeautyMatch — AI 妆造推荐工具
        </p>
        <p className="text-gray-300 text-xs mt-1">
          本工具使用浏览器端 AI 分析，你的照片不会上传到任何服务器
        </p>
        <p className="text-gray-300 text-xs mt-1">
          © {new Date().getFullYear()} BeautyMatch · 仅供个人学习使用
        </p>
      </div>
    </footer>
  );
}
