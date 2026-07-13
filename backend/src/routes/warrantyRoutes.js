const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/check', warrantyController.checkWarranty);
router.post('/:id/claim', warrantyController.claimWarranty);

module.exports = router;
