import { Link } from 'react-router-dom';
import { Star, BookOpen, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookCard({ book }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link to={`/books/${book.id}`} className="block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
        {/* Cover */}
        <div className="relative h-52 bg-slate-100 overflow-hidden">
          {book.cover_image ? (
            <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
              <BookOpen size={40} className="text-primary-300" />
            </div>
          )}
          {book.category_name && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {book.category_name}
            </span>
          )}
        </div>
        {/* Info */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-slate-900 line-clamp-1 text-[15px] mb-1">{book.title}</h3>
          <p className="text-sm text-slate-500 mb-2">{book.author}</p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            {book.library_name && (
              <span className="flex items-center gap-1">
                <MapPin size={12}/> {book.library_name}
              </span>
            )}
            {book.avg_rating && (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Star size={12} fill="currentColor"/> {book.avg_rating}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
