import Gyms from '../../models/Gyms.js'
import Classes from '../../models/Classes.js'

export const getAllGyms = async (req, res) => {
	try {
		const gyms = await Gyms.find().populate('classes').lean()

		res.status(200).json({
			message: 'List of all gyms',
			count: gyms.length,
			gyms,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching gyms',
			error: error.message,
		})
	}
}
