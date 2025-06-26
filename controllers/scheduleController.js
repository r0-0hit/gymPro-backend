import express from 'express'
import { generateWeeklySchedule } from '../services/scheduleService.js'
import { rescheduleClass } from '../services/rescheduleService.js'

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

router.post('/reschedule', async (req, res) => {
	const { trainerId, scheduleId } = req.body
	try {
		const updated = await rescheduleClass(trainerId, scheduleId)

		if (updated === 'No eligible trainers for rescheduling') {
			res.status(200).json({
				message: 'Class rescheduling failed',
				error: updated,
			})
		} else {
			res.status(200).json({
				message: 'Class rescheduled successfully',
				schedule: updated,
			})
		}
	} catch (err) {
		res.status(400).json({
			message: 'Reschedule failed',
			error: err.message,
		})
	}
})
