import Schedules from '../../models/Schedules.js'
import mongoose from 'mongoose'

export const getTrainerClassStats = async (req, res) => {
	const { trainerId } = req.params

	try {
		// Step 1: Get all schedules
		const allSchedules = await Schedules.find()

		// Step 2: Filter schedules for this trainer
		const filtered = allSchedules.filter(
			(schedule) => schedule.trainer?.toString() === trainerId
		)

		// Step 3: Count statuses
		const result = {
			Scheduled: 0,
			Completed: 0,
			Cancelled: 0,
		}

		filtered.forEach((schedule) => {
			const status = schedule.status
			if (status in result) {
				result[status] += 1
			}
		})

		res.status(200).json({
			trainerId,
			stats: result,
		})
	} catch (error) {
		console.error('Error fetching class stats:', error)
		res.status(500).json({
			message: 'Error fetching class stats',
			error: error.message,
		})
	}
}
