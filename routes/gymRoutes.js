import express from 'express'
import { registerGym, loginGym } from '../controllers/auth/gymController.js'
import { getAllGyms } from '../controllers/gym/fetchAllGymController.js'

const router = express.Router()

router.post('/register', registerGym) // POST /api/gyms/register
router.post('/login', loginGym) // POST /api/gyms/login
router.get('/fetchAll', getAllGyms) // GET /api/gyms/fetchAll

export default router
