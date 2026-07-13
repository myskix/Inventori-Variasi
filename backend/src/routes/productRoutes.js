const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', productController.getAll);
router.post('/', isAdmin, productController.create);
router.put('/:id', isAdmin, productController.update);
router.delete('/:id', isAdmin, productController.remove);
router.post('/:id/restore', isAdmin, productController.restore);
router.post('/:id/stock', isAdmin, productController.updateStock);

module.exports = router;
