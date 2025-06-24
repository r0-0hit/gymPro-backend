import Trainers from '../../models/Trainers.js'

export const getAllTrainers = async (req, res) => {
	try {
		const trainers = await Trainers.find() // optional: populate gym info

		res.status(200).json({
			message: 'List of all trainers',
			count: trainers.length,
			trainers,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching trainers',
			error: error.message,
		})
	}
}
