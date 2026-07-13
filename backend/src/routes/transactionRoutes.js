const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', transactionController.getAll);
router.post('/', transactionController.create);
router.post('/:id/cancel', isAdmin, transactionController.cancelTransaction);

module.exports = router;
