import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, LayoutDashboard, BookMarked, User, Library } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const sideLinks = [
  { to: '/lib/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/lib/books',     label: 'Mes livres',       icon: BookOpen },
  { to: '/lib/borrows',   label: 'Emprunts',          icon: BookMarked },
  { to: '/lib/profile',   label: 'Mon profil',        icon: User },
];

export default function LibDashboard() {
  const { user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [borrows, setBorrows] = useState([]);
  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/libraries/mine').then(r => {
      setLibrary(r.data.library);
      if (r.data.library) {
        const lid = r.data.library.id;
        Promise.all([
          api.get(`/borrows/library/${lid}`),
          api.get(`/books/library/${lid}`),
        ]).then(([br, bk]) => {
          setBorrows(br.data.borrows);
          setBooks(bk.data.books);
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const pending  = borrows.filter(b => b.status === 'pending').length;
  const approved = borrows.filter(b => b.status === 'approved').length;
  const totalBooks = books.length;
  const approvedBooks = books.filter(b => b.status === 'approved').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Bibliothèque"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900">
                {library?.library_name || 'Ma bibliothèque'} 📚
              </h1>
              <p className="text-slate-500 mt-1">Vue d'ensemble de votre activité</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label:'Livres approuvés',  value: approvedBooks, icon: BookOpen,    color: 'bg-primary-50 text-primary-600 border-primary-100' },
                { label:'Total livres',      value: totalBooks,    icon: Library,     color: 'bg-slate-50 text-slate-600 border-slate-200' },
                { label:'Demandes reçues',   value: pending,       icon: Clock,       color: 'bg-amber-50 text-amber-600 border-amber-100' },
                { label:'Emprunts actifs',   value: approved,      icon: CheckCircle, color: 'bg-green-50 text-green-600 border-green-100' },
              ].map(({ label, value, icon: Icon, color }) => (
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

            {/* Pending borrows */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-xl text-slate-900">Demandes en attente</h2>
                <Link to="/lib/borrows" className="text-sm text-primary-600 font-medium hover:underline">Voir tout</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}
                </div>
              ) : borrows.filter(b => b.status === 'pending').length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle size={32} className="mx-auto mb-3 opacity-40"/>
                  <p>Aucune demande en attente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {borrows.filter(b => b.status === 'pending').slice(0,5).map(b => (
                    <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="w-10 h-14 rounded-lg bg-white overflow-hidden shrink-0 shadow-sm">
                        {b.cover_image
                          ? <img src={b.cover_image} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-slate-300"/></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{b.title}</p>
                        <p className="text-xs text-slate-500">par {b.user_name}</p>
                      </div>
                      <Link to="/lib/borrows" className="btn-primary text-xs px-3 py-1.5 shrink-0">Gérer</Link>
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
