import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, XCircle, LayoutDashboard, BookMarked, User } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const sideLinks = [
  { to: '/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/my-borrows', label: 'Mes emprunts',     icon: BookMarked },
  { to: '/profile',    label: 'Mon profil',        icon: User },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/borrows/my').then(r => setBorrows(r.data.borrows)).finally(() => setLoading(false));
  }, []);

  const counts = {
    pending:  borrows.filter(b => b.status === 'pending').length,
    approved: borrows.filter(b => b.status === 'approved').length,
    rejected: borrows.filter(b => b.status === 'rejected').length,
    returned: borrows.filter(b => b.status === 'returned').length,
  };

  const stats = [
    { label: 'En attente',  value: counts.pending,  icon: Clock,       color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Approuvés',   value: counts.approved, icon: CheckCircle, color: 'bg-green-50 text-green-600 border-green-100' },
    { label: 'Refusés',     value: counts.rejected, icon: XCircle,     color: 'bg-red-50 text-red-500 border-red-100' },
    { label: 'Retournés',   value: counts.returned, icon: BookOpen,    color: 'bg-slate-50 text-slate-500 border-slate-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Espace élève"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900">
                Bonjour, {user?.name.split(' ')[0]} 👋
              </h1>
              <p className="text-slate-500 mt-1">Voici un aperçu de vos emprunts</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`card border ${color} flex items-center gap-4 p-5`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={22}/>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{value}</p>
                    <p className="text-xs font-medium opacity-70">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent borrows */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-xl text-slate-900">Emprunts récents</h2>
                <Link to="/my-borrows" className="text-sm text-primary-600 font-medium hover:underline">Voir tout</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}
                </div>
              ) : borrows.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen size={36} className="mx-auto mb-3 opacity-40"/>
                  <p>Vous n'avez pas encore fait de demande d'emprunt</p>
                  <Link to="/books" className="btn-primary inline-block mt-4 text-sm">Parcourir les livres</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {borrows.slice(0,5).map(b => (
                    <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {b.cover_image
                          ? <img src={b.cover_image} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-slate-300"/></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate text-sm">{b.title}</p>
                        <p className="text-xs text-slate-500">{b.library_name}</p>
                      </div>
                      <span className={`badge-${b.status} shrink-0`}>
                        {b.status === 'pending'  ? 'En attente'
                        : b.status === 'approved' ? 'Approuvé'
                        : b.status === 'rejected' ? 'Refusé'
                        : 'Retourné'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
