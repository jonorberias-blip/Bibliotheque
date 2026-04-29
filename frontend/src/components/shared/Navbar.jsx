import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open,   setOpen]   = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread').then(r => setUnread(r.data.count));
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashLink = user?.role === 'admin'    ? '/admin'
                 : user?.role === 'library'  ? '/lib/dashboard'
                 : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">BiblioTech</span>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/books"     className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Livres</Link>
            <Link to="/libraries" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Bibliothèques</Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={dashLink} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-1">
                  <User size={16}/> {user.name.split(' ')[0]}
                </Link>
                <Link to="/notifications" className="relative p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Bell size={18}/>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={18}/>
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Connexion</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Inscription</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-slate-500" onClick={() => setOpen(!open)}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3">
            <Link to="/books"     onClick={() => setOpen(false)} className="text-slate-600 py-2">Livres</Link>
            <Link to="/libraries" onClick={() => setOpen(false)} className="text-slate-600 py-2">Bibliothèques</Link>
            {user ? (
              <>
                <Link to={dashLink} onClick={() => setOpen(false)} className="text-slate-600 py-2">Tableau de bord</Link>
                <button onClick={handleLogout} className="text-red-500 py-2 text-left">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setOpen(false)} className="btn-secondary text-center">Connexion</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-center">Inscription</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
