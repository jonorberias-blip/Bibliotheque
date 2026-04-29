import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Building2, Clock, CheckCircle, BookMarked,
         LayoutDashboard, Library, UserCheck } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../utils/api';

const sideLinks = [
  { to: '/admin',            label: 'Tableau de bord',  icon: LayoutDashboard },
  { to: '/admin/libraries',  label: 'Bibliothèques',    icon: Library },
  { to: '/admin/books',      label: 'Livres',            icon: BookOpen },
  { to: '/admin/users',      label: 'Utilisateurs',      icon: Users },
];

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label:'Utilisateurs inscrits',   value: stats.users,             icon: Users,       color:'bg-primary-50 text-primary-600 border-primary-100' },
    { label:'Bibliothèques actives',   value: stats.libraries,          icon: Library,     color:'bg-teal-50 text-teal-600 border-teal-100' },
    { label:'En attente d\'approbation', value: stats.pending_libraries, icon: Clock,      color:'bg-amber-50 text-amber-600 border-amber-100' },
    { label:'Livres approuvés',        value: stats.books,              icon: BookOpen,    color:'bg-green-50 text-green-600 border-green-100' },
    { label:'Livres en attente',       value: stats.pending_books,      icon: BookMarked,  color:'bg-orange-50 text-orange-600 border-orange-100' },
    { label:'Total emprunts',          value: stats.borrows,            icon: CheckCircle, color:'bg-purple-50 text-purple-600 border-purple-100' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Administration"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900">Tableau de bord Admin</h1>
              <p className="text-slate-500 mt-1">Vue globale du système</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100"/>)}
              </div>
            ) : (
              <motion.div className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                initial="hidden" animate="visible">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                  <motion.div key={label}
                    variants={{ hidden: { opacity:0, y:16 }, visible: { opacity:1, y:0 } }}
                    className={`card border ${color} flex items-center gap-4 p-5`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={24}/>
                    </div>
                    <div>
                      <p className="text-3xl font-display font-bold">{value}</p>
                      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Quick actions */}
            <div className="mt-10 grid md:grid-cols-2 gap-6">
              {[
                { href:'/admin/libraries', icon: Building2, label:'Valider les bibliothèques', sub:'Approuver ou refuser les demandes', color:'bg-amber-500' },
                { href:'/admin/books',     icon: BookOpen,  label:'Valider les livres',        sub:'Modérer les publications',         color:'bg-primary-600' },
              ].map(({ href, icon: Icon, label, sub, color }) => (
                <a key={href} href={href}
                  className="card hover:shadow-md transition-shadow flex items-center gap-5 group">
                  <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
                    <Icon size={26} className="text-white"/>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">{label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
