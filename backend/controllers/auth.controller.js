const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['user', 'library'].includes(role))
      return res.status(400).json({ success: false, message: 'Rôle invalide' });

    const [exist] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length)
      return res.status(409).json({ success: false, message: 'Email déjà utilisé' });

    const hash   = await bcrypt.hash(password, 10);
    const status = role === 'library' ? 'pending' : 'active';
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, status) VALUES (?,?,?,?,?)',
      [name, email, hash, role, status]
    );

    const token = generateToken({ id: result.insertId, email, role });
    res.status(201).json({
      success: true,
      message: role === 'library'
        ? 'Inscription envoyée — en attente de validation admin'
        : 'Inscription réussie',
      token,
      user: { id: result.insertId, name, email, role, status },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const user = rows[0];
    if (user.status === 'pending')
      return res.status(403).json({ success: false, message: 'Compte en attente de validation' });
    if (user.status === 'inactive')
      return res.status(403).json({ success: false, message: 'Compte désactivé' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id,name,email,role,status,avatar,created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
};
