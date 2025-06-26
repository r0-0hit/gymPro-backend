import express from 'express'
import { generateWeeklySchedule } from '../services/scheduleService.js'

export const router = express.Router()

router.post('/generate', async (req, res) => {
	try {
		const schedules = await generateWeeklySchedule()
		res.status(200).json({
			message: 'Weekly schedule generated & emails sent',
			count: schedules.length,
		})
	} catch (err) {
		res.status(500).json({ message: 'Error', error: err.message })
	}
})
