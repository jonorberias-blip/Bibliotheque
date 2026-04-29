import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Users, Trash2, BookOpen, LayoutDashboard, Library, User,
         GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../utils/api';

const sideLinks = [
  { to: '/admin',           label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/libraries', label: 'Bibliothèques',   icon: Library },
  { to: '/admin/books',     label: 'Livres',           icon: BookOpen },
  { to: '/admin/users',     label: 'Utilisateurs',     icon: Users },
];

const roleIcon = { admin: ShieldCheck, library: Building2, user: GraduationCap };
const roleColor = { admin:'text-purple-600 bg-purple-50', library:'text-teal-600 bg-teal-50', user:'text-primary-600 bg-primary-50' };

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur définitivement ?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Utilisateur supprimé');
      setUsers(u => u.filter(x => x.id !== id));
    } catch { toast.error('Erreur'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Administration"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display font-bold text-3xl text-slate-900">Utilisateurs</h1>
              <span className="text-sm text-slate-500 font-medium">{users.length} compte{users.length!==1?'s':''}</span>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-sm">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" placeholder="Rechercher…" className="input-field pl-10"
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-100"/>)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Utilisateur</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Rôle</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Statut</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Inscrit le</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, i) => {
                      const Icon = roleIcon[u.role] || User;
                      return (
                        <tr key={u.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i===filtered.length-1?'border-0':''}`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${roleColor[u.role]}`}>
                                <Icon size={16}/>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-sm">{u.name}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 hidden md:table-cell">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColor[u.role]}`}>
                              {u.role === 'admin' ? 'Admin' : u.role === 'library' ? 'Bibliothèque' : 'Élève'}
                            </span>
                          </td>
                          <td className="px-5 py-3 hidden lg:table-cell">
                            <span className={u.status === 'active' ? 'badge-approved' : u.status === 'pending' ? 'badge-pending' : 'badge-rejected'}>
                              {u.status === 'active' ? 'Actif' : u.status === 'pending' ? 'En attente' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-400 hidden lg:table-cell">
                            {new Date(u.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-5 py-3">
                            {u.role !== 'admin' && (
                              <button onClick={() => deleteUser(u.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={15}/>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Users size={32} className="mx-auto mb-3 opacity-40"/>
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
