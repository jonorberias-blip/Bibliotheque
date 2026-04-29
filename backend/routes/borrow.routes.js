const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/borrow.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/',                        authenticate, authorize('user'),             ctrl.create);
router.get('/my',                       authenticate, authorize('user'),             ctrl.getMy);
router.get('/all',                      authenticate, authorize('admin'),            ctrl.getAll);
router.get('/library/:libraryId',       authenticate, authorize('library','admin'),  ctrl.getByLibrary);
router.put('/:id/status',               authenticate, authorize('library','admin'),  ctrl.updateStatus);
module.exports = router;
