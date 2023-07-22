const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.use('/login',  authController.login);
router.use('/register', authController.register);

module.exports = router;