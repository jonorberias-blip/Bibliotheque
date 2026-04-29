import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, BookOpen, Edit2, Trash2, X, LayoutDashboard, BookMarked, User } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../utils/api';

const sideLinks = [
  { to: '/lib/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/lib/books',     label: 'Mes livres',       icon: BookOpen },
  { to: '/lib/borrows',   label: 'Emprunts',          icon: BookMarked },
  { to: '/lib/profile',   label: 'Mon profil',        icon: User },
];

const EMPTY = { title:'', author:'', description:'', category_id:'', isbn:'', quantity:1, cover:null };

export default function LibBooks() {
  const [books,      setBooks]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [library,    setLibrary]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null); // book being edited
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);

  const loadBooks = async (lid) => {
    const r = await api.get(`/books/library/${lid}`);
    setBooks(r.data.books);
  };

  useEffect(() => {
    Promise.all([api.get('/libraries/mine'), api.get('/categories')]).then(([l, c]) => {
      setLibrary(l.data.library);
      setCategories(c.data.categories);
      if (l.data.library) loadBooks(l.data.library.id);
    }).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (book) => {
    setEditing(book);
    setForm({ title: book.title, author: book.author, description: book.description || '',
              category_id: book.category_id || '', isbn: book.isbn || '', quantity: book.quantity, cover: null });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!library) return toast.error('Bibliothèque introuvable');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('library_id',   library.id);
      fd.append('title',        form.title);
      fd.append('author',       form.author);
      fd.append('description',  form.description);
      fd.append('category_id',  form.category_id);
      fd.append('isbn',         form.isbn);
      fd.append('quantity',     form.quantity);
      if (form.cover) fd.append('cover', form.cover);

      if (editing) {
        await api.put(`/books/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Livre mis à jour');
      } else {
        await api.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Livre soumis pour validation admin');
      }
      setModal(false);
      loadBooks(library.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Livre supprimé');
      loadBooks(library.id);
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={sideLinks} title="Bibliothèque"/>
        <main className="flex-1">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display font-bold text-3xl text-slate-900">Mes livres</h1>
                <p className="text-slate-500 mt-1">{books.length} livre{books.length !== 1 ? 's' : ''} dans votre catalogue</p>
              </div>
              <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                <Plus size={18}/> Ajouter un livre
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100"/>)}
              </div>
            ) : books.length === 0 ? (
              <div className="card text-center py-20 text-slate-400">
                <BookOpen size={40} className="mx-auto mb-4 opacity-40"/>
                <p className="text-lg font-medium">Aucun livre pour l'instant</p>
                <button onClick={openAdd} className="btn-primary mt-5 mx-auto inline-flex items-center gap-2">
                  <Plus size={16}/> Ajouter votre premier livre
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {books.map(book => (
                  <div key={book.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-12 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {book.cover_image
                        ? <img src={book.cover_image} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-slate-300"/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{book.title}</p>
                      <p className="text-sm text-slate-500">{book.author}</p>
                      {book.category_name && <p className="text-xs text-slate-400">{book.category_name}</p>}
                    </div>
                    <span className={`badge-${book.status} shrink-0`}>
                      {book.status === 'pending' ? 'En attente' : book.status === 'approved' ? 'Approuvé' : 'Refusé'}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEdit(book)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit2 size={15}/>
                      </button>
                      <button onClick={() => handleDelete(book.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale:.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:.95, y:20 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="font-display font-semibold text-xl">{editing ? 'Modifier le livre' : 'Ajouter un livre'}</h2>
                <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X size={18}/>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[
                  { label:'Titre',       key:'title',       type:'text',   required:true },
                  { label:'Auteur',      key:'author',      type:'text',   required:true },
                  { label:'ISBN',        key:'isbn',        type:'text',   required:false },
                  { label:'Quantité',    key:'quantity',    type:'number', required:true },
                ].map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <input type={type} required={required} min={type==='number'?1:undefined}
                      className="input-field" value={form[key]}
                      onChange={e => setForm({...form, [key]: e.target.value})}/>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Catégorie</label>
                  <select className="input-field" value={form.category_id}
                    onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea rows={3} className="input-field resize-none" value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Couverture</label>
                  <input type="file" accept="image/*" className="input-field py-2 text-sm"
                    onChange={e => setForm({...form, cover: e.target.files[0]})}/>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Soumettre'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
