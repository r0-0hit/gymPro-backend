import express from 'express'
import {
	registerTrainer,
	loginTrainer,
} from '../controllers/auth/trainerController.js'
import { getAllTrainers } from '../controllers/trainer/fetchAllTrainerController.js'
import { updateTrainer } from '../controllers/trainer/updateTrainerController.js'
import { deleteTrainer } from '../controllers/trainer/deleteTrainerController.js'
import { getTrainerClassStats } from '../controllers/trainer/trainerStatController.js'

const router = express.Router()

router.post('/register', registerTrainer) // POST /api/trainers/register
router.post('/login', loginTrainer) // POST /api/trainers/login
router.get('/fetchAll', getAllTrainers) // GET /api/trainers/fetchAll
router.put('/:id', updateTrainer) // PUT /api/trainers/:id
router.delete('/:id', deleteTrainer) // DELETE /api/trainers/:id
router.get('/:trainerId/stats', getTrainerClassStats) // GET /api/trainers/:trainerId/stats

export default router
