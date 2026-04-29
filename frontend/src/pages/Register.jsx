import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BookOpen, User, Mail, Lock, GraduationCap, Library } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success(data.message || 'Compte créé !');
      if (data.user?.role === 'library') navigate('/login');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white"/>
            </div>
            <span className="font-display font-bold text-2xl text-slate-900">BiblioTech</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-slate-900">Inscription</h1>
          <p className="text-slate-500 mt-2">Créez votre compte gratuitement</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { val:'user',    label:'Élève',         icon: GraduationCap },
              { val:'library', label:'Bibliothèque',  icon: Library },
            ].map(({ val, label, icon: Icon }) => (
              <button key={val} type="button"
                onClick={() => setForm({...form, role: val})}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                  ${form.role === val
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                <Icon size={22}/>
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </div>

          {form.role === 'library' && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              ⚠️ Les comptes bibliothèque nécessitent une validation par l'administrateur.
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="text" required placeholder="Jean Dupont" className="input-field pl-11"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="email" required placeholder="votre@email.com" className="input-field pl-11"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="password" required minLength={6} placeholder="Min. 6 caractères" className="input-field pl-11"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
