import express from 'express'
import {
	registerAdmin,
	loginAdmin,
} from '../controllers/auth/adminController.js'

const router = express.Router()

router.post('/register', registerAdmin) // POST /api/admins/register
router.post('/login', loginAdmin) // POST /api/admins/login

export default router
