const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')

router.post('/', userController.adminProtect, adminController.addUser);
router.put('/:id', userController.adminProtect, adminController.updateUser)
router.get('/user-lists', userController.adminProtect, adminController.userList);
router.get('/user-lists/:id', userController.adminProtect, adminController.userById);
router.put('/user-lists/:id', userController.adminProtect, adminController.deleteUser)
module.exports = router;