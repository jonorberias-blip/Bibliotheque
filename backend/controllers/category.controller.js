// ============================================================
// category.controller.js
// ============================================================
const db = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const [cats] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, categories: cats });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO categories (name,description) VALUES (?,?)', [name, description]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM categories WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
