import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function Sidebar({ links, title }) {
  const { pathname } = useLocation();
  return (
    <aside className="w-60 shrink-0 hidden lg:block">
      <div className="sticky top-20">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen size={14} className="text-white"/>
          </div>
          <span className="font-display font-bold text-slate-800">{title}</span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                {active && <motion.div layoutId="sidebar-indicator" className="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full" />}
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
