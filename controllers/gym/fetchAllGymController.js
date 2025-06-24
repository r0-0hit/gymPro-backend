import Gyms from '../../models/Gyms.js'

export const getAllGyms = async (req, res) => {
	try {
		// const gyms = await Gyms.find().populate('classes')
		const gyms = await Gyms.find()

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
