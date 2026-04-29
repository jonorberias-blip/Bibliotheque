import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import BookCard from '../components/shared/BookCard';
import api from '../utils/api';

export default function Books() {
  const [books,      setBooks]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const LIMIT = 12;

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)   params.search   = search;
      if (category) params.category = category;
      const r = await api.get('/books', { params });
      setBooks(r.data.books);
      setTotal(r.data.total);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)); }, []);
  useEffect(() => { fetchBooks(); }, [page, category]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchBooks(); };
  const clearFilters = () => { setSearch(''); setCategory(''); setPage(1); };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-6">Catalogue des livres</h1>
          <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" placeholder="Rechercher par titre, auteur…"
                className="input-field pl-11"
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="input-field w-auto min-w-[160px]"
              value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">Toutes les catégories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Filter size={16}/> Filtrer
            </button>
            {(search || category) && (
              <button type="button" onClick={clearFilters}
                className="btn-secondary flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50">
                <X size={16}/> Effacer
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100"/>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Search size={40} className="mx-auto mb-4 opacity-40"/>
            <p className="text-lg font-medium">Aucun livre trouvé</p>
            <p className="text-sm mt-1">Essayez avec d'autres mots-clés</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5">{total} livre{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}</p>
            <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
              {books.map(book => (
                <motion.div key={book.id} variants={{ hidden: { opacity:0, y:16 }, visible: { opacity:1, y:0 } }}>
                  <BookCard book={book}/>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="btn-secondary px-4 py-2 disabled:opacity-40">←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl font-medium text-sm transition-all
                      ${p === page ? 'bg-primary-600 text-white shadow-sm' : 'btn-secondary'}`}>
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="btn-secondary px-4 py-2 disabled:opacity-40">→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
