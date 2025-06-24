import express from 'express'
import { commonLogin } from '../controllers/auth/commonLoginController.js'
const router = express.Router()

router.post('/commonlogin', commonLogin) // POST /api/users/commonlogin

export default router
