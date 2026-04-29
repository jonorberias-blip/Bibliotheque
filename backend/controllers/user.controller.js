const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getProfile = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, status, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Upload avatar si présent
    let avatar = null;
    if (req.file) {
      avatar = await uploadToCloudinary(req.file.buffer, 'bibliotheque/profiles');
    }

    if (name)   await db.query('UPDATE users SET name = ? WHERE id = ?',   [name,   req.user.id]);
    if (avatar) await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.user.id]);

    res.json({ success: true, message: 'Profil mis à jour' });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query(
      'SELECT password FROM users WHERE id = ?', [req.user.id]
    );
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true, message: 'Mot de passe modifié' });
  } catch (err) { next(err); }
};
