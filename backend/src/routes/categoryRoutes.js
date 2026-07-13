const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', categoryController.getAll);
router.post('/', isAdmin, categoryController.create);
router.put('/:id', isAdmin, categoryController.update);
router.delete('/:id', isAdmin, categoryController.remove);

module.exports = router;
