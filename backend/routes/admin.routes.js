const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const A = [authenticate, authorize('admin')];

router.get('/stats',                  ...A, ctrl.getStats);
router.get('/libraries/pending',      ...A, ctrl.getPendingLibraries);
router.put('/libraries/:id/status',   ...A, ctrl.setLibraryStatus);
router.get('/books/pending',          ...A, ctrl.getPendingBooks);
router.put('/books/:id/status',       ...A, ctrl.setBookStatus);
router.get('/users',                  ...A, ctrl.getUsers);
router.delete('/users/:id',           ...A, ctrl.deleteUser);
module.exports = router;
