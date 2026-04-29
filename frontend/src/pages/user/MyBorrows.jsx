import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Calendar, LayoutDashboard, BookMarked, User } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../utils/api';

const sideLinks = [
  { to: '/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/my-borrows', label: 'Mes emprunts',     icon: BookMarked },
  { to: '/profile',    label: 'Mon profil',        icon: User },
];

const STATUS_TABS = ['all','pending','approved','rejected','returned'];
const STATUS_LABEL = { all:'Tous', pending:'En attente', approved:'Approuvés', rejected:'Refusés', returned:'Retournés' };

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('all');

  useEffect(() => {
    api.get('/borrows/my').then(r => setBorrows(r.data.borrows)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? borrows : borrows.filter(b => b.status === tab);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Espace élève"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <h1 className="font-display font-bold text-3xl text-slate-900 mb-6">Mes emprunts</h1>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {STATUS_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${tab === t ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {STATUS_LABEL[t]}
                  {t !== 'all' && (
                    <span className="ml-2 opacity-70">
                      ({borrows.filter(b => b.status === t).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100"/>)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card text-center py-16 text-slate-400">
                <BookOpen size={36} className="mx-auto mb-3 opacity-40"/>
                <p>Aucun emprunt dans cette catégorie</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(b => (
                  <motion.div key={b.id} layout
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-5">
                    {/* Cover */}
                    <div className="w-14 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {b.cover_image
                        ? <img src={b.cover_image} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={18} className="text-slate-300"/>
                          </div>}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-slate-900">{b.title}</h3>
                          <p className="text-sm text-slate-500">{b.author} — {b.library_name}</p>
                        </div>
                        <span className={`badge-${b.status} shrink-0`}>
                          {b.status === 'pending'  ? 'En attente'
                          : b.status === 'approved' ? 'Approuvé'
                          : b.status === 'rejected' ? 'Refusé'
                          : 'Retourné'}
                        </span>
                      </div>

                      {/* Dates */}
                      {(b.borrow_date || b.return_date) && (
                        <div className="flex gap-4 mt-3 text-xs text-slate-500">
                          {b.borrow_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12}/> Emprunt : {new Date(b.borrow_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {b.return_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12}/> Retour : {new Date(b.return_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Certificate */}
                      {b.certificate_code && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                          <Award size={13}/>
                          Certificat : {b.certificate_code}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
