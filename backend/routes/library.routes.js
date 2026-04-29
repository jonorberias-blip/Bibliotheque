// ── library.routes.js ────────────────────────────────────────
const express  = require('express');
const r1       = express.Router();
const lCtrl    = require('../controllers/library.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');

r1.get('/',         lCtrl.getAll);
r1.get('/mine',     authenticate, authorize('library'), lCtrl.getMine);
r1.get('/:id',      lCtrl.getOne);
r1.post('/',        authenticate, authorize('library'), uploadProfile.single('image'), lCtrl.create);
r1.put('/:id',      authenticate, authorize('library','admin'), uploadProfile.single('image'), lCtrl.update);
r1.delete('/:id',   authenticate, authorize('admin'), lCtrl.remove);
module.exports = r1;
