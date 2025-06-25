import Class from '../../models/Classes.js'
import Gym from '../../models/Gyms.js'

export const createClass = async (req, res) => {
	try {
		const newClass = await Class.create(req.body)

		// Update gym's class array
		await Gym.findByIdAndUpdate(
			req.body.gym,
			{ $push: { classes: newClass._id } },
			{ new: true }
		)

		res.status(201).json({
			message: 'Class created successfully',
			class: newClass,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error creating class',
			error: error.message,
		})
	}
}

export const getAllClasses = async (req, res) => {
	try {
		const classes = await Class.find({ gym: req.params.gymId })
			.populate('gym', 'name location')
			.populate('assigned_trainer', 'name email')
		res.status(200).json(classes)
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching classes',
			error: error.message,
		})
	}
}

export const getClassById = async (req, res) => {
	try {
		const foundClass = await Class.findById(req.params.id)
			.populate('gym', 'name location')
			.populate('assigned_trainer', 'name email')

		if (!foundClass)
			return res.status(404).json({ message: 'Class not found' })

		res.status(200).json(foundClass)
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching class',
			error: error.message,
		})
	}
}

export const updateClass = async (req, res) => {
	try {
		const updated = await Class.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})

		if (!updated)
			return res.status(404).json({ message: 'Class not found' })

		res.status(200).json({
			message: 'Class updated successfully',
			class: updated,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error updating class',
			error: error.message,
		})
	}
}

export const deleteClass = async (req, res) => {
	try {
		const deletedClass = await Class.findByIdAndDelete(req.params.id)
		if (!deletedClass)
			return res.status(404).json({ message: 'Class not found' })

		// Remove from gym's classes array
		await Gym.findByIdAndUpdate(deletedClass.gym, {
			$pull: { classes: deletedClass._id },
		})

		res.status(200).json({ message: 'Class deleted successfully' })
	} catch (error) {
		res.status(500).json({
			message: 'Error deleting class',
			error: error.message,
		})
	}
}
