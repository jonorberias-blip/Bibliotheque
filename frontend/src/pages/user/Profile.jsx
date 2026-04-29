import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Lock, Camera, LayoutDashboard, BookMarked } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const sideLinks = [
  { to: '/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/my-borrows', label: 'Mes emprunts',     icon: BookMarked },
  { to: '/profile',    label: 'Mon profil',        icon: User },
];

export default function UserProfile() {
  const { user } = useAuth();
  const [name,    setName]    = useState(user?.name || '');
  const [avatar,  setAvatar]  = useState(null);
  const [pwd,     setPwd]     = useState({ current:'', newPwd:'', confirm:'' });
  const [saving,  setSaving]  = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (avatar) fd.append('avatar', avatar);
      await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profil mis à jour');
    } catch { toast.error('Erreur'); } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) return toast.error('Les mots de passe ne correspondent pas');
    setSaving(true);
    try {
      await api.put('/users/change-password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success('Mot de passe modifié');
      setPwd({ current:'', newPwd:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Espace élève"/>
        <main className="flex-1 max-w-2xl">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <h1 className="font-display font-bold text-3xl text-slate-900 mb-8">Mon profil</h1>

            {/* Profile form */}
            <div className="card mb-6">
              <h2 className="font-display font-semibold text-xl text-slate-900 mb-6">Informations personnelles</h2>
              <form onSubmit={handleProfile} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden relative">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/>
                      : <User size={32} className="text-primary-400"/>}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity rounded-2xl">
                      <Camera size={20} className="text-white"/>
                      <input type="file" accept="image/*" className="hidden" onChange={e => setAvatar(e.target.files[0])}/>
                    </label>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <p className="text-xs text-primary-600 mt-1 font-medium capitalize">{user?.role}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
                  <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)}/>
                </div>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </form>
            </div>

            {/* Password form */}
            <div className="card">
              <h2 className="font-display font-semibold text-xl text-slate-900 mb-6 flex items-center gap-2">
                <Lock size={20}/> Changer le mot de passe
              </h2>
              <form onSubmit={handlePassword} className="space-y-4">
                {[
                  { label:'Mot de passe actuel',      key:'current'  },
                  { label:'Nouveau mot de passe',      key:'newPwd'   },
                  { label:'Confirmer le nouveau',      key:'confirm'  },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                    <input type="password" className="input-field" value={pwd[key]}
                      onChange={e => setPwd({...pwd, [key]: e.target.value})} required/>
                  </div>
                ))}
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Modification…' : 'Modifier le mot de passe'}
                </button>
              </form>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
