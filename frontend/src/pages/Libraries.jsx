import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, BookOpen, Building2 } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import api from '../utils/api';

export default function Libraries() {
  const [libs,    setLibs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [city,    setCity]    = useState('');

  const fetchLibs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city)   params.city   = city;
      const r = await api.get('/libraries', { params });
      setLibs(r.data.libraries);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchLibs(); }, []);
  const handleSearch = (e) => { e.preventDefault(); fetchLibs(); };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>

      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-6">Bibliothèques</h1>
          <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" placeholder="Nom de la bibliothèque…"
                className="input-field pl-11"
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <div className="relative w-48">
              <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" placeholder="Ville…"
                className="input-field pl-11"
                value={city} onChange={e => setCity(e.target.value)}/>
            </div>
            <button type="submit" className="btn-primary">Rechercher</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-slate-100"/>
            ))}
          </div>
        ) : libs.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Building2 size={40} className="mx-auto mb-4 opacity-40"/>
            <p className="text-lg font-medium">Aucune bibliothèque trouvée</p>
          </div>
        ) : (
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
            {libs.map(lib => (
              <motion.div key={lib.id}
                variants={{ hidden: { opacity:0, y:16 }, visible: { opacity:1, y:0 } }}
                whileHover={{ y: -4 }} transition={{ type:'spring', stiffness:300 }}>
                <Link to={`/libraries/${lib.id}`}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
                    {lib.image
                      ? <img src={lib.image} alt={lib.library_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      : <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={48} className="text-primary-200"/>
                        </div>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-slate-900 text-lg mb-1">{lib.library_name}</h3>
                    {lib.city && (
                      <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                        <MapPin size={13}/> {lib.city}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
                      <BookOpen size={14}/>
                      {lib.book_count} livre{lib.book_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
