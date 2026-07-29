
const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware')


router.get('/users', verifyToken, requireAdmin, adminController.listUsers)

router.post('/users', verifyToken, requireAdmin, adminController.createUser)

router.patch('/users/:id', verifyToken, requireAdmin, adminController.updateUser)

router.delete('/users/:id', verifyToken, requireAdmin, adminController.deleteUser)

router.patch('/users/:id/role', verifyToken, requireAdmin, adminController.updateUserRole)

module.exports = router