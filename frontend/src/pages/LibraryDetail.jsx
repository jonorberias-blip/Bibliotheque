import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Building2, BookOpen, Mail } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import BookCard from '../components/shared/BookCard';
import api from '../utils/api';

export default function LibraryDetail() {
  const { id } = useParams();
  const [library, setLibrary] = useState(null);
  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/libraries/${id}`),
      api.get(`/books/library/${id}`),
    ]).then(([l, b]) => {
      setLibrary(l.data.library);
      setBooks(b.data.books.filter(bk => bk.status === 'approved'));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-2xl mb-8"/>
        <div className="grid grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-56 bg-slate-200 rounded-2xl"/>)}
        </div>
      </div>
    </div>
  );

  if (!library) return (
    <div className="min-h-screen bg-slate-50"><Navbar/>
      <p className="text-center py-20 text-slate-500">Bibliothèque introuvable</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        <Link to="/libraries" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft size={16}/> Retour aux bibliothèques
        </Link>

        {/* Library Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-10">
          <div className="h-52 bg-gradient-to-br from-primary-700 to-primary-900 relative">
            {library.image && (
              <img src={library.image} alt="" className="w-full h-full object-cover opacity-40"/>
            )}
            <div className="absolute inset-0 flex items-end p-8">
              <div className="text-white">
                <h1 className="font-display font-bold text-4xl mb-2">{library.library_name}</h1>
                {library.city && (
                  <p className="flex items-center gap-2 text-white/80">
                    <MapPin size={16}/> {library.address ? `${library.address}, ` : ''}{library.city}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 flex flex-wrap gap-6 items-start">
            {library.description && (
              <p className="text-slate-600 leading-relaxed flex-1">{library.description}</p>
            )}
            <div className="flex flex-col gap-2 text-sm text-slate-500 min-w-[200px]">
              {library.owner_email && (
                <a href={`mailto:${library.owner_email}`}
                  className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                  <Mail size={14}/> {library.owner_email}
                </a>
              )}
              <span className="flex items-center gap-2">
                <BookOpen size={14}/> {books.length} livre{books.length !== 1 ? 's' : ''} disponible{books.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Books */}
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-6">
          Catalogue de cette bibliothèque
        </h2>
        {books.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building2 size={36} className="mx-auto mb-3 opacity-40"/>
            <p>Aucun livre disponible pour l'instant</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
            {books.map(book => (
              <motion.div key={book.id}
                variants={{ hidden: { opacity:0, y:16 }, visible: { opacity:1, y:0 } }}>
                <BookCard book={book}/>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
