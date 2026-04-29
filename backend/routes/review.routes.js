const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/book/:bookId',  ctrl.getByBook);
router.post('/',             authenticate, authorize('user'), ctrl.create);
router.delete('/:id',        authenticate, ctrl.remove);
module.exports = router;
