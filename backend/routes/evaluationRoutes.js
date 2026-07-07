const express = require('express');
const { getTopic, submitEvaluation, getHistory } = require('../controllers/evaluationController');
const { protect } = require('../middleware/auth');
const { evaluationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/topic', protect, getTopic);
router.post('/', protect, evaluationLimiter, submitEvaluation);
router.get('/history', protect, getHistory);

module.exports = router;
