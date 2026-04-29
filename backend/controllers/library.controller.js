const db = require('../config/db');

// GET /api/libraries  — bibliothèques approuvées
exports.getAll = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let where  = ['l.status = "approved"'];
    const params = [];
    if (city)   { where.push('l.city LIKE ?');         params.push(`%${city}%`); }
    if (search) { where.push('l.library_name LIKE ?'); params.push(`%${search}%`); }
    const [libs] = await db.query(
      `SELECT l.*, COUNT(b.id) AS book_count
       FROM libraries l LEFT JOIN books b ON b.library_id = l.id AND b.status = 'approved'
       WHERE ${where.join(' AND ')}
       GROUP BY l.id
       ORDER BY l.library_name`,
      params
    );
    res.json({ success: true, libraries: libs });
  } catch (err) { next(err); }
};

// GET /api/libraries/:id
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, u.name AS owner_name, u.email AS owner_email
       FROM libraries l JOIN users u ON l.user_id = u.id
       WHERE l.id = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Bibliothèque introuvable' });
    res.json({ success: true, library: rows[0] });
  } catch (err) { next(err); }
};

// POST /api/libraries
exports.create = async (req, res, next) => {
  try {
    const { library_name, address, city, description } = req.body;
    const image = req.file?.path || null;
    const [result] = await db.query(
      'INSERT INTO libraries (user_id,library_name,address,city,description,image) VALUES (?,?,?,?,?,?)',
      [req.user.id, library_name, address, city, description, image]
    );
    res.status(201).json({ success: true, libraryId: result.insertId, message: 'Bibliothèque soumise pour validation' });
  } catch (err) { next(err); }
};

// PUT /api/libraries/:id
exports.update = async (req, res, next) => {
  try {
    const { library_name, address, city, description } = req.body;
    const image = req.file?.path;
    const fields = { library_name, address, city, description };
    if (image) fields.image = image;
    const sets   = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), req.params.id];
    await db.query(`UPDATE libraries SET ${sets} WHERE id = ?`, values);
    res.json({ success: true, message: 'Bibliothèque mise à jour' });
  } catch (err) { next(err); }
};

// DELETE /api/libraries/:id
exports.remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM libraries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Bibliothèque supprimée' });
  } catch (err) { next(err); }
};

// GET /api/libraries/mine — profil de la bibliothèque connectée
exports.getMine = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM libraries WHERE user_id = ?', [req.user.id]
    );
    res.json({ success: true, library: rows[0] || null });
  } catch (err) { next(err); }
};
