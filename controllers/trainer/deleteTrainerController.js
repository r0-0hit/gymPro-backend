import Trainers from '../../models/Trainers.js'
import Schedules from '../../models/Schedules.js'
import dayjs from 'dayjs'

export const deleteTrainer = async (req, res) => {
	const { id } = req.params

	try {
		const trainer = await Trainers.findById(id)
		if (!trainer) {
			return res.status(404).json({ message: 'Trainer not found' })
		}

		// Calculate current week's start and end (Monday–Sunday)
		const today = dayjs()
		const startOfWeek = today.startOf('week').add(1, 'day').toDate() // Monday
		const endOfWeek = today.endOf('week').add(1, 'day').toDate() // Sunday

		const activeSchedules = await Schedules.find({
			trainer: id,
			date: {
				$gte: startOfWeek,
				$lte: endOfWeek,
			},
			status: 'Scheduled',
		})

		if (activeSchedules.length > 0) {
			return res.status(400).json({
				message:
					'Trainer is scheduled for classes this week and cannot be deleted.',
				scheduledCount: activeSchedules.length,
			})
		}

		await trainer.deleteOne()

		res.status(200).json({ message: 'Trainer deleted successfully' })
	} catch (error) {
		res.status(500).json({
			message: 'Error deleting trainer',
			error: error.message,
		})
	}
}
