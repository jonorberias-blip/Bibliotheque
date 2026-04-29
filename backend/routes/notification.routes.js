const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

router.get('/',         authenticate, ctrl.getMy);
router.get('/unread',   authenticate, ctrl.getUnreadCount);
router.put('/read',     authenticate, ctrl.markRead);
module.exports = router;
