import Trainers from '../../models/Trainers.js'

export const updateTrainer = async (req, res) => {
	const { id } = req.params
	const updates = req.body

	try {
		const trainer = await Trainers.findById(id)
		if (!trainer) {
			return res.status(404).json({ message: 'Trainer not found' })
		}

		// Prevent ID overwrite
		delete updates._id

		// If password is not being updated, keep the existing one
		if (!updates.password) {
			updates.password = trainer.password
		}

		// Overwrite the trainer's fields completely
		Object.assign(trainer, updates)

		await trainer.save()

		res.status(200).json({
			message: 'Trainer updated successfully',
			trainer,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error updating trainer',
			error: error.message,
		})
	}
}
