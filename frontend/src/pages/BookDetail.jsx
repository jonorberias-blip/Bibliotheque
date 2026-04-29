import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BookOpen, MapPin, Star, User, ArrowLeft, Send, Clock } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}>
          <Star size={20}
            className={`transition-colors ${(hover || value) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}/>
        </button>
      ))}
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book,    setBook]    = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    Promise.all([
      api.get(`/books/${id}`),
      api.get(`/reviews/book/${id}`),
    ]).then(([b, r]) => {
      setBook(b.data.book);
      setReviews(r.data.reviews);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleBorrow = async () => {
    if (!user) return toast.error('Connectez-vous pour emprunter');
    if (user.role !== 'user') return toast.error('Seuls les élèves peuvent emprunter');
    setBorrowing(true);
    try {
      await api.post('/borrows', { book_id: book.id, library_id: book.library_id });
      toast.success('Demande envoyée à la bibliothèque !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setBorrowing(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Connectez-vous pour laisser un avis');
    if (!review.rating) return toast.error('Choisissez une note');
    try {
      await api.post('/reviews', { book_id: id, ...review });
      toast.success('Avis enregistré');
      const r = await api.get(`/reviews/book/${id}`);
      setReviews(r.data.reviews);
      setReview({ rating: 0, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-10 w-32 bg-slate-200 rounded-lg mb-8"/>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-200 rounded-2xl h-80"/>
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4"/>
            <div className="h-5 bg-slate-200 rounded-lg w-1/2"/>
            <div className="h-32 bg-slate-200 rounded-lg"/>
          </div>
        </div>
      </div>
    </div>
  );

  if (!book) return <div className="min-h-screen bg-slate-50"><Navbar/><p className="text-center py-20 text-slate-500">Livre introuvable</p></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Back */}
        <Link to="/books" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft size={16}/> Retour au catalogue
        </Link>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="grid md:grid-cols-3 gap-8 mb-12">

          {/* Cover */}
          <div className="md:col-span-1">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white aspect-[3/4] flex items-center justify-center">
              {book.cover_image
                ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover"/>
                : <BookOpen size={60} className="text-slate-300"/>}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            {book.category_name && (
              <span className="badge-approved mb-3 inline-block">{book.category_name}</span>
            )}
            <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">{book.title}</h1>
            <p className="text-lg text-slate-500 mb-4">par <span className="text-slate-700 font-medium">{book.author}</span></p>

            {book.avg_rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16}
                      className={`${s <= Math.round(book.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}/>
                  ))}
                </div>
                <span className="text-sm text-slate-500">{book.avg_rating} ({book.review_count} avis)</span>
              </div>
            )}

            {book.library_name && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <MapPin size={15}/>
                <Link to={`/libraries/${book.library_id}`} className="hover:text-primary-600 transition-colors font-medium">
                  {book.library_name}
                </Link>
                {book.city && <span>— {book.city}</span>}
              </div>
            )}

            {book.description && (
              <p className="text-slate-600 leading-relaxed mb-6 bg-white rounded-xl p-4 border border-slate-100">
                {book.description}
              </p>
            )}

            {book.isbn && <p className="text-xs text-slate-400 mb-6">ISBN : {book.isbn}</p>}

            {/* Borrow button */}
            {user?.role === 'user' && (
              <button onClick={handleBorrow} disabled={borrowing}
                className="btn-primary flex items-center gap-2 text-base px-7 py-3">
                {borrowing ? <><Clock size={18} className="animate-spin"/> Envoi...</> : <><Send size={18}/> Demander l'emprunt</>}
              </button>
            )}
            {!user && (
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-base px-7 py-3">
                <User size={18}/> Connectez-vous pour emprunter
              </Link>
            )}
          </div>
        </motion.div>

        {/* Reviews */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Leave a review */}
          {user?.role === 'user' && (
            <div className="card">
              <h2 className="font-display font-semibold text-xl text-slate-900 mb-5">Laisser un avis</h2>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
                  <StarRating value={review.rating} onChange={v => setReview({...review, rating: v})}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Commentaire (optionnel)</label>
                  <textarea rows={3} placeholder="Votre avis sur ce livre…" className="input-field resize-none"
                    value={review.comment} onChange={e => setReview({...review, comment: e.target.value})}/>
                </div>
                <button type="submit" className="btn-primary w-full">Publier</button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          <div>
            <h2 className="font-display font-semibold text-xl text-slate-900 mb-5">
              Avis ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucun avis pour l'instant.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        {r.avatar
                          ? <img src={r.avatar} alt="" className="w-full h-full object-cover rounded-full"/>
                          : <User size={14} className="text-primary-600"/>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.user_name}</p>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12}
                              className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}/>
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
