const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.use(isAdmin);

router.get('/', dashboardController.getDashboardMetrics);

module.exports = router;
