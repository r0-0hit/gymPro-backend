import express from 'express'
import { registerGym, loginGym } from '../controllers/auth/gymController.js'
import { getAllGyms } from '../controllers/gym/fetchAllGymController.js'

const router = express.Router()

router.post('/register', registerGym)
router.post('/login', loginGym)
router.get('/fetchAll', getAllGyms)

export default router
