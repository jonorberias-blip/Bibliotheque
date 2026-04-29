import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, Building2, LayoutDashboard, BookOpen, BookMarked, User } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../utils/api';

const sideLinks = [
  { to: '/lib/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/lib/books',     label: 'Mes livres',       icon: BookOpen },
  { to: '/lib/borrows',   label: 'Emprunts',          icon: BookMarked },
  { to: '/lib/profile',   label: 'Mon profil',        icon: User },
];

export default function LibProfile() {
  const [library, setLibrary] = useState(null);
  const [form,    setForm]    = useState({ library_name:'', address:'', city:'', description:'', image:null });
  const [saving,  setSaving]  = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/libraries/mine').then(r => {
      if (r.data.library) {
        const l = r.data.library;
        setLibrary(l);
        setForm({ library_name: l.library_name, address: l.address||'', city: l.city||'', description: l.description||'', image:null });
      } else {
        setCreating(true);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (v !== null) fd.append(k, v); });
      if (library) {
        await api.put(`/libraries/${library.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Profil mis à jour');
      } else {
        await api.post('/libraries', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Bibliothèque soumise pour validation admin');
        setCreating(false);
        const r = await api.get('/libraries/mine');
        setLibrary(r.data.library);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Bibliothèque"/>
        <main className="flex-1 max-w-2xl">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <h1 className="font-display font-bold text-3xl text-slate-900 mb-8">
              {creating ? 'Créer ma bibliothèque' : 'Profil de la bibliothèque'}
            </h1>

            {library && (
              <div className={`mb-6 p-4 rounded-xl border text-sm font-medium
                ${library.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700'
                : library.status === 'pending'  ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-red-50 border-red-200 text-red-600'}`}>
                Statut : {library.status === 'approved' ? '✅ Approuvée'
                         : library.status === 'pending'  ? '⏳ En attente de validation'
                         : '❌ Refusée'}
              </div>
            )}

            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 size={15}/> Image de la bibliothèque
                  </label>
                  {library?.image && (
                    <img src={library.image} alt="" className="w-full h-40 object-cover rounded-xl mb-3"/>
                  )}
                  <input type="file" accept="image/*" className="input-field py-2 text-sm"
                    onChange={e => setForm({...form, image: e.target.files[0]})}/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom de la bibliothèque *</label>
                  <input type="text" required className="input-field" value={form.library_name}
                    onChange={e => setForm({...form, library_name: e.target.value})}/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                      <MapPin size={14}/> Ville
                    </label>
                    <input type="text" className="input-field" value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                    <input type="text" className="input-field" value={form.address}
                      onChange={e => setForm({...form, address: e.target.value})}/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea rows={4} className="input-field resize-none" value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Décrivez votre bibliothèque…"/>
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full py-3">
                  {saving ? 'Enregistrement…' : library ? 'Mettre à jour' : 'Créer la bibliothèque'}
                </button>
              </form>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
