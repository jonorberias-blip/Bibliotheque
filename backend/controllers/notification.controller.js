const db = require('../config/db');

exports.getMy = async (req, res, next) => {
  try {
    const [notifs] = await db.query(
      'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ success: true, notifications: notifs });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const [[row]] = await db.query(
      'SELECT COUNT(*) AS c FROM notifications WHERE user_id=? AND is_read=0',
      [req.user.id]
    );
    res.json({ success: true, count: row.c });
  } catch (err) { next(err); }
};
