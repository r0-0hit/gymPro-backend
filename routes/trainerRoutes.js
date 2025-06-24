import express from 'express'
import {
	registerTrainer,
	loginTrainer,
} from '../controllers/auth/trainerController.js'
import { getAllTrainers } from '../controllers/trainer/fetchAllTrainerController.js'

const router = express.Router()

router.post('/register', registerTrainer)
router.post('/login', loginTrainer)
router.get('/fetchAll', getAllTrainers)

export default router
