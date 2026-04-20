const express = require('express');
const router = express.Router();
const stadiumController = require('../controllers/stadiumController');

router.get('/status', stadiumController.getStatus);
router.get('/heatmap', stadiumController.getHeatmap);
router.get('/path', stadiumController.getPath);
router.get('/wait-time', stadiumController.getWaitTime);

module.exports = router;
