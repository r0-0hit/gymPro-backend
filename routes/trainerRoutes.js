import express from 'express'
import {
	registerTrainer,
	loginTrainer,
} from '../controllers/auth/trainerController.js'
import { getAllTrainers } from '../controllers/trainer/fetchAllTrainerController.js'
import { updateTrainer } from '../controllers/trainer/updateTrainerController.js'

const router = express.Router()

router.post('/register', registerTrainer) // POST /api/trainers/register
router.post('/login', loginTrainer) // POST /api/trainers/login
router.get('/fetchAll', getAllTrainers) // GET /api/trainers/fetchAll
router.put('/:id', updateTrainer) // PUT /api/trainers/:id

export default router
