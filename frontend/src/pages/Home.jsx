import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, Library, Award } from 'lucide-react';
import Navbar from '../components/shared/Navbar';

const features = [
  { icon: Search,  title: 'Recherche intelligente', desc: 'Trouvez n\'importe quel livre par titre, auteur ou catégorie en quelques secondes.' },
  { icon: Library, title: 'Réseau de bibliothèques', desc: 'Accédez à des centaines de bibliothèques locales et leur catalogue complet.' },
  { icon: Award,   title: 'Certificats d\'emprunt', desc: 'Recevez un certificat officiel pour chaque livre emprunté et approuvé.' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-600/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10">
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}
            className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <BookOpen size={14}/> Plateforme de gestion bibliothécaire
            </span>
            <h1 className="font-display font-bold text-5xl leading-tight mb-6">
              La bibliothèque à portée de main
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Découvrez, empruntez et gérez des livres depuis n'importe quelle bibliothèque.
              Une plateforme moderne pour les élèves, les bibliothèques et les administrateurs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/books"    className="btn-primary text-base px-7 py-3">Parcourir les livres</Link>
              <Link to="/register" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3 rounded-xl transition-all duration-200">S'inscrire</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Une solution complète pour moderniser la gestion des bibliothèques scolaires et publiques.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ delay: i * 0.15 }}
              className="card hover:shadow-md transition-shadow text-center p-8">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Icon size={26} className="text-primary-600"/>
              </div>
              <h3 className="font-display font-semibold text-xl text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-16 text-center">
        <h2 className="font-display font-bold text-3xl mb-4">Prêt à commencer ?</h2>
        <p className="text-white/80 mb-8">Rejoignez notre réseau de bibliothèques dès aujourd'hui.</p>
        <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors">
          Créer un compte
        </Link>
      </section>

      <footer className="bg-slate-900 text-slate-400 text-center py-8 text-sm">
        © 2025 BiblioTech — Plateforme de gestion de bibliothèque
      </footer>
    </div>
  );
}
