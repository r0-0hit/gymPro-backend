import express from 'express'
import {
	getSchedulesByTrainer,
	getSchedulesByGym,
	getThisWeeksSchedulesByTrainer,
	getThisWeeksSchedulesByGym,
	getAllSchedules,
} from '../controllers/schedule/fetchScheduleController.js  '
const router = express.Router()

router.get('/trainer/:trainerId', getSchedulesByTrainer) // GET /api/schedules/trainer/:trainerId
router.get('/gym/:gymId', getSchedulesByGym) // GET /api/schedules/gym/:gymId
router.get('/trainer/:trainerId/week', getThisWeeksSchedulesByTrainer) // GET /api/schedules/trainer/:trainerId/week
router.get('/gym/:gymId/week', getThisWeeksSchedulesByGym) // GET /api/schedules/gym/:gymId/week
router.get('/fetchAll', getAllSchedules) // GET /api/schedules/fetchAll

export default router
