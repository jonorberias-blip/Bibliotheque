import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BookOpen, Check, X, RotateCcw, LayoutDashboard, BookMarked, User } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../utils/api';

const sideLinks = [
  { to: '/lib/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/lib/books',     label: 'Mes livres',       icon: BookOpen },
  { to: '/lib/borrows',   label: 'Emprunts',          icon: BookMarked },
  { to: '/lib/profile',   label: 'Mon profil',        icon: User },
];

export default function LibBorrows() {
  const [borrows,  setBorrows]  = useState([]);
  const [library,  setLibrary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('pending');
  const [dateModal, setDateModal] = useState(null); // { borrowId }
  const [dates,    setDates]    = useState({ borrow_date:'', return_date:'' });

  useEffect(() => {
    api.get('/libraries/mine').then(r => {
      setLibrary(r.data.library);
      if (r.data.library) {
        api.get(`/borrows/library/${r.data.library.id}`).then(br => setBorrows(br.data.borrows));
      }
    }).finally(() => setLoading(false));
  }, []);

  const reload = () => {
    if (library) api.get(`/borrows/library/${library.id}`).then(br => setBorrows(br.data.borrows));
  };

  const updateStatus = async (id, status, extra = {}) => {
    try {
      await api.put(`/borrows/${id}/status`, { status, ...extra });
      toast.success(
        status === 'approved' ? 'Emprunt approuvé — certificat généré !' :
        status === 'rejected' ? 'Demande refusée' : 'Retour enregistré'
      );
      reload();
      setDateModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleApprove = (borrow) => {
    setDates({ borrow_date: new Date().toISOString().split('T')[0], return_date: '' });
    setDateModal(borrow);
  };

  const TABS = ['pending','approved','rejected','returned'];
  const LABEL = { pending:'En attente', approved:'Approuvés', rejected:'Refusés', returned:'Retournés' };
  const filtered = borrows.filter(b => b.status === tab);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Bibliothèque"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <h1 className="font-display font-bold text-3xl text-slate-900 mb-6">Gestion des emprunts</h1>

            <div className="flex gap-2 flex-wrap mb-6">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${tab===t ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {LABEL[t]} ({borrows.filter(b=>b.status===t).length})
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
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4 items-start">
                    <div className="w-12 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {b.cover_image
                        ? <img src={b.cover_image} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-slate-300"/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{b.title}</p>
                      <p className="text-sm text-slate-500">
                        Demandé par <span className="font-medium text-slate-700">{b.user_name}</span>
                        {' '}— {b.user_email}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(b.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
                      </p>
                      {b.certificate_code && (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                          🏅 {b.certificate_code}
                        </span>
                      )}
                    </div>
                    {/* Actions */}
                    {b.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleApprove(b)}
                          className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm px-3 py-2 rounded-xl transition-colors border border-green-200">
                          <Check size={15}/> Approuver
                        </button>
                        <button onClick={() => updateStatus(b.id, 'rejected')}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-3 py-2 rounded-xl transition-colors border border-red-200">
                          <X size={15}/> Refuser
                        </button>
                      </div>
                    )}
                    {b.status === 'approved' && (
                      <button onClick={() => updateStatus(b.id, 'returned')}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm px-3 py-2 rounded-xl transition-colors shrink-0">
                        <RotateCcw size={15}/> Retour
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Approve date modal */}
      {dateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <motion.div initial={{ scale:.95 }} animate={{ scale:1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-display font-semibold text-lg mb-4">Dates d'emprunt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date d'emprunt</label>
                <input type="date" className="input-field" value={dates.borrow_date}
                  onChange={e => setDates({...dates, borrow_date: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date de retour prévue</label>
                <input type="date" className="input-field" value={dates.return_date}
                  onChange={e => setDates({...dates, return_date: e.target.value})}/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDateModal(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={() => updateStatus(dateModal.id, 'approved', dates)} className="btn-primary flex-1">
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
