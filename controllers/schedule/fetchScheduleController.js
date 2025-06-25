import Schedule from '../../models/Schedules.js'
import Gym from '../../models/Gyms.js'
import Trainer from '../../models/Trainers.js'
import Classes from '../../models/Classes.js'
import mongoose from 'mongoose'

const getThisWeekRange = () => {
	const now = new Date()

	// Set to Monday (start of week)
	const start = new Date(now)
	start.setDate(now.getDate() - now.getDay() + 1)
	start.setHours(0, 0, 0, 0)

	// Set to Sunday (end of week)
	const end = new Date(start)
	end.setDate(start.getDate() + 6)
	end.setHours(23, 59, 59, 999)

	return { start, end }
}

export const getSchedulesByTrainer = async (req, res) => {
	const { trainerId } = req.params

	try {
		const schedules = await Schedule.find({ trainer: trainerId })
			.populate('gym')
			.populate('class')
			.sort({ date: 1 })

		res.status(200).json({
			message: 'Schedules for trainer',
			count: schedules.length,
			schedules,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching trainer schedules',
			error: error.message,
		})
	}
}

export const getSchedulesByGym = async (req, res) => {
	const { gymId } = req.params

	try {
		const schedules = await Schedule.find({ gym: gymId })
			.populate('trainer')
			.populate('class')
			.sort({ date: 1 })

		res.status(200).json({
			message: 'Schedules for gym',
			count: schedules.length,
			schedules,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching gym schedules',
			error: error.message,
		})
	}
}

export const getThisWeeksSchedulesByTrainer = async (req, res) => {
	const { trainerId } = req.params
	const { start, end } = getThisWeekRange()

	try {
		const schedules = await Schedule.find({ trainer: trainerId })
			.populate('gym')
			.populate('class')
			.sort({ createdAt: 1 }) // fallback sort

		const filtered = schedules.filter(
			(s) => s.class?.date && s.class.date >= start && s.class.date <= end
		)

		res.status(200).json({
			message: "This week's schedules for trainer",
			count: filtered.length,
			schedules: filtered,
		})
	} catch (error) {
		res.status(500).json({
			message: "Error fetching this week's trainer schedules",
			error: error.message,
		})
	}
}

export const getThisWeeksSchedulesByGym = async (req, res) => {
	const { gymId } = req.params
	const { start, end } = getThisWeekRange()

	try {
		const schedules = await Schedule.find({ trainer: trainerId })
			.populate('gym')
			.populate('class')
			.sort({ createdAt: 1 }) // fallback sort

		const filtered = schedules.filter(
			(s) => s.class?.date && s.class.date >= start && s.class.date <= end
		)

		res.status(200).json({
			message: "This week's schedules for gym",
			count: schedules.length,
			schedules,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error fetching this week’s gym schedules',
			error: error.message,
		})
	}
}
