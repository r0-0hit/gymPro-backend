import express from 'express'
import { commonLogin } from '../controllers/auth/commonLoginController.js'
const router = express.Router()

router.post('/commonlogin', commonLogin)

export default router
