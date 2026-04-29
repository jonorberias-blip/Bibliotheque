const db = require('../config/db');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [[users]]     = await db.query('SELECT COUNT(*) AS c FROM users WHERE role="user"');
    const [[libs]]      = await db.query('SELECT COUNT(*) AS c FROM libraries WHERE status="approved"');
    const [[pending_l]] = await db.query('SELECT COUNT(*) AS c FROM libraries WHERE status="pending"');
    const [[books]]     = await db.query('SELECT COUNT(*) AS c FROM books WHERE status="approved"');
    const [[pending_b]] = await db.query('SELECT COUNT(*) AS c FROM books WHERE status="pending"');
    const [[borrows]]   = await db.query('SELECT COUNT(*) AS c FROM borrow_requests');
    res.json({ success: true, stats: {
      users: users.c, libraries: libs.c, pending_libraries: pending_l.c,
      books: books.c, pending_books: pending_b.c, borrows: borrows.c,
    }});
  } catch (err) { next(err); }
};

// GET /api/admin/libraries/pending
exports.getPendingLibraries = async (req, res, next) => {
  try {
    const [libs] = await db.query(
      `SELECT l.*, u.name AS owner_name, u.email AS owner_email
       FROM libraries l JOIN users u ON l.user_id = u.id
       WHERE l.status = 'pending'
       ORDER BY l.created_at DESC`
    );
    res.json({ success: true, libraries: libs });
  } catch (err) { next(err); }
};

// PUT /api/admin/libraries/:id/status
exports.setLibraryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });

    await db.query('UPDATE libraries SET status=? WHERE id=?', [status, req.params.id]);

    // Activer / désactiver le compte utilisateur lié
    const [lib] = await db.query('SELECT user_id FROM libraries WHERE id=?', [req.params.id]);
    if (lib.length) {
      const userStatus = status === 'approved' ? 'active' : 'inactive';
      await db.query('UPDATE users SET status=? WHERE id=?', [userStatus, lib[0].user_id]);
      await db.query(
        'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
        [lib[0].user_id,
         status === 'approved' ? 'Bibliothèque approuvée !' : 'Demande refusée',
         status === 'approved'
           ? 'Votre bibliothèque a été validée. Vous pouvez maintenant publier des livres.'
           : 'Votre demande de bibliothèque a été refusée par l\'administration.',
         status === 'approved' ? 'success' : 'error']
      );
    }
    res.json({ success: true, message: `Bibliothèque ${status}` });
  } catch (err) { next(err); }
};

// GET /api/admin/books/pending
exports.getPendingBooks = async (req, res, next) => {
  try {
    const [books] = await db.query(
      `SELECT b.*, c.name AS category_name, l.library_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN libraries  l ON b.library_id  = l.id
       WHERE b.status = 'pending'
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, books });
  } catch (err) { next(err); }
};

// PUT /api/admin/books/:id/status
exports.setBookStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    await db.query('UPDATE books SET status=? WHERE id=?', [status, req.params.id]);

    // Notifier la bibliothèque
    const [book] = await db.query(
      'SELECT b.title, l.user_id FROM books b JOIN libraries l ON b.library_id=l.id WHERE b.id=?',
      [req.params.id]
    );
    if (book.length) {
      await db.query(
        'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
        [book[0].user_id,
         status === 'approved' ? 'Livre approuvé' : 'Livre refusé',
         `Le livre "${book[0].title}" a été ${status === 'approved' ? 'approuvé' : 'refusé'}.`,
         status === 'approved' ? 'success' : 'error']
      );
    }
    res.json({ success: true, message: `Livre ${status}` });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id,name,email,role,status,created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await db.query('DELETE FROM users WHERE id=? AND role != "admin"', [req.params.id]);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) { next(err); }
};
