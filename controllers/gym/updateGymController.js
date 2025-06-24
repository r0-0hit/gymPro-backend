import Gyms from '../../models/Gyms.js'

export const updateGym = async (req, res) => {
	const { id } = req.params
	const updates = req.body

	try {
		const gym = await Gyms.findById(id)
		if (!gym) {
			return res.status(404).json({ message: 'Gym not found' })
		}

		// Prevent ID overwrite
		delete updates._id

		// If password is not being updated, keep the existing one
		if (!updates.password) {
			updates.password = gym.password
		}

		// Overwrite the gym's fields completely
		Object.assign(gym, updates)

		await gym.save()

		res.status(200).json({
			message: 'Gym updated successfully',
			gym,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error updating gym',
			error: error.message,
		})
	}
}
