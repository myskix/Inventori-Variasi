const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.use(isAdmin);

router.get('/stock', logController.getStockLogs);

module.exports = router;
