// category.routes.js
const express = require('express');
const r1 = express.Router();
const c1 = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth');
r1.get('/',    c1.getAll);
r1.post('/',   authenticate, authorize('admin'), c1.create);
r1.delete('/:id', authenticate, authorize('admin'), c1.remove);
module.exports = r1;
