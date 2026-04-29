const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');

router.get('/profile',          authenticate, ctrl.getProfile);
router.put('/profile',          authenticate, uploadProfile.single('avatar'), ctrl.updateProfile);
router.put('/change-password',  authenticate, ctrl.changePassword);
module.exports = router;
