const db = require('../config/db');

// GET /api/books  — livres approuvés (public)
exports.getAll = async (req, res, next) => {
  try {
    const { search, category, city, library_id, page = 1, limit = 12 } = req.query;
    let where = ['b.status = "approved"'];
    const params = [];

    if (search) {
      where.push('MATCH(b.title, b.author) AGAINST(? IN BOOLEAN MODE)');
      params.push(`${search}*`);
    }
    if (category)   { where.push('b.category_id = ?');  params.push(category); }
    if (library_id) { where.push('b.library_id = ?');   params.push(library_id); }
    if (city)       { where.push('l.city = ?');          params.push(city); }

    const offset = (page - 1) * limit;
    const sql = `
      SELECT b.*, c.name AS category_name, l.library_name, l.city
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN libraries  l ON b.library_id  = l.id
      WHERE ${where.join(' AND ')}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [books] = await db.query(sql, params);
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM books b LEFT JOIN libraries l ON b.library_id = l.id WHERE ${where.join(' AND ')}`,
      params.slice(0, -2)
    );
    res.json({ success: true, books, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
};

// GET /api/books/:id
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, c.name AS category_name, l.library_name, l.city, l.address,
              ROUND(AVG(r.rating),1) AS avg_rating, COUNT(r.id) AS review_count
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN libraries  l ON b.library_id  = l.id
       LEFT JOIN reviews    r ON r.book_id = b.id
       WHERE b.id = ?
       GROUP BY b.id`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Livre introuvable' });
    res.json({ success: true, book: rows[0] });
  } catch (err) { next(err); }
};

// POST /api/books  — bibliothèque crée un livre
exports.create = async (req, res, next) => {
  try {
    const { library_id, category_id, title, author, description, isbn, quantity } = req.body;
    const cover_image = req.file?.path || null;
    const [result] = await db.query(
      'INSERT INTO books (library_id,category_id,title,author,description,cover_image,isbn,quantity) VALUES (?,?,?,?,?,?,?,?)',
      [library_id, category_id, title, author, description, cover_image, isbn, quantity || 1]
    );
    res.status(201).json({ success: true, message: 'Livre soumis pour validation', bookId: result.insertId });
  } catch (err) { next(err); }
};

// PUT /api/books/:id
exports.update = async (req, res, next) => {
  try {
    const { title, author, description, category_id, isbn, quantity } = req.body;
    const cover_image = req.file?.path;
    const fields = { title, author, description, category_id, isbn, quantity };
    if (cover_image) fields.cover_image = cover_image;
    const sets   = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), req.params.id];
    await db.query(`UPDATE books SET ${sets} WHERE id = ?`, values);
    res.json({ success: true, message: 'Livre mis à jour' });
  } catch (err) { next(err); }
};

// DELETE /api/books/:id
exports.remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Livre supprimé' });
  } catch (err) { next(err); }
};

// GET /api/books/library/:libraryId  — tous les livres d'une bibliothèque
exports.getByLibrary = async (req, res, next) => {
  try {
    const [books] = await db.query(
      `SELECT b.*, c.name AS category_name
       FROM books b LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.library_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.libraryId]
    );
    res.json({ success: true, books });
  } catch (err) { next(err); }
};
