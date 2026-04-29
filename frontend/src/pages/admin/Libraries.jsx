import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Building2, Check, X, MapPin, Users, BookOpen, LayoutDashboard, Library } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../utils/api';

const sideLinks = [
  { to: '/admin',           label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/libraries', label: 'Bibliothèques',   icon: Library },
  { to: '/admin/books',     label: 'Livres',           icon: BookOpen },
  { to: '/admin/users',     label: 'Utilisateurs',     icon: Users },
];

export default function AdminLibraries() {
  const [pending,  setPending]  = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('pending');

  const load = async () => {
    const [p, a] = await Promise.all([
      api.get('/admin/libraries/pending'),
      api.get('/libraries'),
    ]);
    setPending(p.data.libraries);
    setApproved(a.data.libraries);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/libraries/${id}/status`, { status });
      toast.success(status === 'approved' ? 'Bibliothèque approuvée !' : 'Demande refusée');
      load();
    } catch { toast.error('Erreur'); }
  };

  const list = tab === 'pending' ? pending : approved;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Administration"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <h1 className="font-display font-bold text-3xl text-slate-900 mb-6">Gestion des bibliothèques</h1>

            <div className="flex gap-2 mb-6">
              <button onClick={() => setTab('pending')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${tab==='pending' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                En attente ({pending.length})
              </button>
              <button onClick={() => setTab('approved')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${tab==='approved' ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                Approuvées ({approved.length})
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100"/>)}
              </div>
            ) : list.length === 0 ? (
              <div className="card text-center py-16 text-slate-400">
                <Building2 size={36} className="mx-auto mb-3 opacity-40"/>
                <p>Aucune bibliothèque dans cette catégorie</p>
              </div>
            ) : (
              <div className="space-y-4">
                {list.map(lib => (
                  <motion.div key={lib.id} layout
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-5 items-start">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {lib.image
                        ? <img src={lib.image} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center"><Building2 size={24} className="text-slate-300"/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-slate-900 text-lg">{lib.library_name}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                        {lib.city && <span className="flex items-center gap-1"><MapPin size={13}/>{lib.city}</span>}
                        {lib.owner_name && <span>Responsable : <span className="text-slate-700 font-medium">{lib.owner_name}</span></span>}
                        {lib.owner_email && <span>{lib.owner_email}</span>}
                      </div>
                      {lib.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{lib.description}</p>
                      )}
                    </div>
                    {tab === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setStatus(lib.id, 'approved')}
                          className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm px-3 py-2 rounded-xl transition-colors border border-green-200">
                          <Check size={15}/> Approuver
                        </button>
                        <button onClick={() => setStatus(lib.id, 'rejected')}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-3 py-2 rounded-xl transition-colors border border-red-200">
                          <X size={15}/> Refuser
                        </button>
                      </div>
                    )}
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
