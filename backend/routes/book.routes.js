const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/book.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadBook } = require('../config/cloudinary');

router.get('/',                         ctrl.getAll);
router.get('/:id',                      ctrl.getOne);
router.get('/library/:libraryId',       ctrl.getByLibrary);
router.post('/',   authenticate, authorize('library'), uploadBook.single('cover'), ctrl.create);
router.put('/:id', authenticate, authorize('library','admin'), uploadBook.single('cover'), ctrl.update);
router.delete('/:id', authenticate, authorize('library','admin'), ctrl.remove);

module.exports = router;
