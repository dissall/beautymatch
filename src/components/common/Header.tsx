import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/upload', label: '开始分析' },
  { to: '/bloggers', label: '博主库' },
  { to: '/about', label: '关于' },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">💄</span>
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            BeautyMatch
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-pink-600'
                    : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-pink-50 rounded-full -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                location.pathname === link.to
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
