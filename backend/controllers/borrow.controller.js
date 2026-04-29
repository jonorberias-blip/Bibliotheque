const db   = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// POST /api/borrows  — utilisateur demande un emprunt
exports.create = async (req, res, next) => {
  try {
    const { book_id, library_id, notes } = req.body;
    // Vérif : pas déjà une demande active pour ce livre
    const [exist] = await db.query(
      'SELECT id FROM borrow_requests WHERE user_id=? AND book_id=? AND status IN ("pending","approved")',
      [req.user.id, book_id]
    );
    if (exist.length)
      return res.status(409).json({ success: false, message: 'Demande déjà en cours pour ce livre' });

    const [result] = await db.query(
      'INSERT INTO borrow_requests (user_id,book_id,library_id,notes) VALUES (?,?,?,?)',
      [req.user.id, book_id, library_id, notes || null]
    );

    // Notifier la bibliothèque
    const [lib] = await db.query('SELECT user_id FROM libraries WHERE id=?', [library_id]);
    if (lib.length) {
      await db.query(
        'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
        [lib[0].user_id, 'Nouvelle demande d\'emprunt', `Un élève a demandé l'emprunt d'un livre.`, 'info']
      );
    }

    res.status(201).json({ success: true, message: 'Demande envoyée', borrowId: result.insertId });
  } catch (err) { next(err); }
};

// GET /api/borrows/my  — emprunts de l'utilisateur
exports.getMy = async (req, res, next) => {
  try {
    const [borrows] = await db.query(
      `SELECT br.*, b.title, b.cover_image, b.author, l.library_name,
              bc.certificate_code, bc.pdf_url
       FROM borrow_requests br
       JOIN books     b  ON br.book_id    = b.id
       JOIN libraries l  ON br.library_id = l.id
       LEFT JOIN borrow_certificates bc ON bc.borrow_request_id = br.id
       WHERE br.user_id = ?
       ORDER BY br.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, borrows });
  } catch (err) { next(err); }
};

// GET /api/borrows/library/:libraryId  — emprunts pour une bibliothèque
exports.getByLibrary = async (req, res, next) => {
  try {
    const { status } = req.query;
    let where = ['br.library_id = ?'];
    const params = [req.params.libraryId];
    if (status) { where.push('br.status = ?'); params.push(status); }
    const [borrows] = await db.query(
      `SELECT br.*, b.title, b.cover_image, b.author,
              u.name AS user_name, u.email AS user_email,
              bc.certificate_code
       FROM borrow_requests br
       JOIN books b ON br.book_id = b.id
       JOIN users u ON br.user_id = u.id
       LEFT JOIN borrow_certificates bc ON bc.borrow_request_id = br.id
       WHERE ${where.join(' AND ')}
       ORDER BY br.created_at DESC`,
      params
    );
    res.json({ success: true, borrows });
  } catch (err) { next(err); }
};

// PUT /api/borrows/:id/status  — bibliothèque approuve/refuse
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, borrow_date, return_date } = req.body;
    if (!['approved', 'rejected', 'returned'].includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });

    await db.query(
      'UPDATE borrow_requests SET status=?, borrow_date=?, return_date=? WHERE id=?',
      [status, borrow_date || null, return_date || null, req.params.id]
    );

    // Générer le certificat si approuvé
    if (status === 'approved') {
      const code = `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;
      await db.query(
        'INSERT INTO borrow_certificates (borrow_request_id, certificate_code) VALUES (?,?)',
        [req.params.id, code]
      );

      // Notifier l'utilisateur
      const [br] = await db.query('SELECT user_id, book_id FROM borrow_requests WHERE id=?', [req.params.id]);
      if (br.length) {
        const [book] = await db.query('SELECT title FROM books WHERE id=?', [br[0].book_id]);
        await db.query(
          'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
          [br[0].user_id, 'Emprunt approuvé !',
           `Votre demande pour "${book[0]?.title}" a été approuvée. Code: ${code}`, 'success']
        );
      }
    }

    if (status === 'rejected') {
      const [br] = await db.query('SELECT user_id FROM borrow_requests WHERE id=?', [req.params.id]);
      if (br.length) {
        await db.query(
          'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
          [br[0].user_id, 'Demande refusée', 'Votre demande d\'emprunt a été refusée.', 'warning']
        );
      }
    }

    res.json({ success: true, message: `Statut mis à jour : ${status}` });
  } catch (err) { next(err); }
};

// GET /api/borrows/all — admin voit tous les emprunts
exports.getAll = async (req, res, next) => {
  try {
    const [borrows] = await db.query(
      `SELECT br.*, b.title, u.name AS user_name, l.library_name,
              bc.certificate_code
       FROM borrow_requests br
       JOIN books b     ON br.book_id    = b.id
       JOIN users u     ON br.user_id    = u.id
       JOIN libraries l ON br.library_id = l.id
       LEFT JOIN borrow_certificates bc ON bc.borrow_request_id = br.id
       ORDER BY br.created_at DESC`
    );
    res.json({ success: true, borrows });
  } catch (err) { next(err); }
};
