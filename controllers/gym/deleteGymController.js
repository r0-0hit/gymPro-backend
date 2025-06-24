import Gyms from '../../models/Gyms.js'
import Schedules from '../../models/Schedules.js'
import dayjs from 'dayjs' // make sure you have: npm install dayjs

export const deleteGym = async (req, res) => {
	const { id } = req.params

	try {
		const gym = await Gyms.findById(id)
		if (!gym) {
			return res.status(404).json({ message: 'Gym not found' })
		}

		// Define this week's range (Monday to Sunday)
		const today = dayjs()
		const startOfWeek = today.startOf('week').add(1, 'day').toDate() // Monday
		const endOfWeek = today.endOf('week').add(1, 'day').toDate() // Sunday

		const activeSchedules = await Schedules.find({
			gym: id,
			date: {
				$gte: startOfWeek,
				$lte: endOfWeek,
			},
			status: 'Scheduled',
		})

		if (activeSchedules.length > 0) {
			return res.status(400).json({
				message:
					'Gym has scheduled classes this week and cannot be deleted.',
				scheduledCount: activeSchedules.length,
			})
		}

		await gym.deleteOne()

		res.status(200).json({ message: 'Gym deleted successfully' })
	} catch (error) {
		res.status(500).json({
			message: 'Error deleting gym',
			error: error.message,
		})
	}
}
