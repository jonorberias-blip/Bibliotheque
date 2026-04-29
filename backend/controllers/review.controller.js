const db = require('../config/db');

exports.getByBook = async (req, res, next) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS user_name, u.avatar
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.book_id=? ORDER BY r.created_at DESC`,
      [req.params.bookId]
    );
    res.json({ success: true, reviews });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { book_id, rating, comment } = req.body;
    await db.query(
      'INSERT INTO reviews (user_id,book_id,rating,comment) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE rating=?,comment=?',
      [req.user.id, book_id, rating, comment, rating, comment]
    );
    res.status(201).json({ success: true, message: 'Avis enregistré' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM reviews WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
