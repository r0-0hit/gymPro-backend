import express from 'express'
import {
	registerTrainer,
	loginTrainer,
} from '../controllers/auth/trainerController.js'

const router = express.Router()

router.post('/register', registerTrainer)
router.post('/login', loginTrainer)

export default router
