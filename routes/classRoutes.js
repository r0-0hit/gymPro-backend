import express from 'express'
import {
	createClass,
	getAllClasses,
	getClassById,
	updateClass,
	deleteClass,
} from '../controllers/class/gymController.js'

const router = express.Router()

router.post('/create', createClass) // POST /api/classes/create
router.get('/fetchAll/:gymId', getAllClasses) // GET /api/classes/fetchAll/:gymId
router.get('/:id', getClassById) // GET /api/classes/:id
router.put('/:id', updateClass) // PUT /api/classes/:id
router.delete('/:id', deleteClass) // DELETE /api/classes/:id

export default router
