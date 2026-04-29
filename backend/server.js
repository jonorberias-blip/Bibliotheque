require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

// ── Middlewares globaux ────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/libraries',     require('./routes/library.routes'));
app.use('/api/books',         require('./routes/book.routes'));
app.use('/api/categories',    require('./routes/category.routes'));
app.use('/api/borrows',       require('./routes/borrow.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/reviews',       require('./routes/review.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Gestion centralisée des erreurs ───────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
});

// ── Démarrage ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
