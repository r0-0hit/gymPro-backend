import express from 'express'
import {
	registerAdmin,
	loginAdmin,
} from '../controllers/auth/adminController.js'
import { getDashboardKPIs } from '../controllers/admin/adminStatController.js'

const router = express.Router()

router.post('/register', registerAdmin) // POST /api/admins/register
router.post('/login', loginAdmin) // POST /api/admins/login
router.get('/kpis', getDashboardKPIs) // GET /api/admins/kpis

export default router
