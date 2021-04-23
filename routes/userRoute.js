const express= require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.get('/me', userController.protect, userController.me);
router.put('/', userController.protect, userController.updateProfile)
router.put('/change-password', userController.protect, userController.changePassword)
module.exports = router;