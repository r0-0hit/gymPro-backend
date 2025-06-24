import express from 'express'
import { registerGym, loginGym } from '../controllers/auth/gymController.js'

const router = express.Router()

router.post('/register', registerGym)
router.post('/login', loginGym)

export default router
