import express from 'express'
import { registerGym, loginGym } from '../controllers/auth/gymController.js'
import { getAllGyms } from '../controllers/gym/fetchAllGymController.js'
import { updateGym } from '../controllers/gym/updateGymController.js'
import { deleteGym } from '../controllers/gym/deleteGymController.js'

const router = express.Router()

router.post('/register', registerGym) // POST /api/gyms/register
router.post('/login', loginGym) // POST /api/gyms/login
router.get('/fetchAll', getAllGyms) // GET /api/gyms/fetchAll
router.put('/:id', updateGym) // PUT /api/gyms/:id
router.delete('/:id', deleteGym) // DELETE /api/gyms/:id

export default router
