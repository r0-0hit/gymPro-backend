// import Class from '../models/Classes.js'
// import Trainer from '../models/Trainers.js'
// import Schedule from '../models/Schedules.js'
// import {
// 	getWeekRange,
// 	isWithinAvailability,
// 	hasRestPeriod,
// } from '../utils/scheduleUtils.js'
// import { notifySchedules } from '../services/notificationService.js'

// /**
//  * Generates and saves the weekly schedule based on:
//  * - Class dates in the upcoming week
//  * - Trainer skills match
//  * - Trainer availability slots
//  * - Rest period between assignments
//  * - Even distribution of classes
//  * After scheduling, sends email notifications
//  */
// export async function generateWeeklySchedule() {
// 	const { start, end } = getWeekRange(new Date())

// 	// Fetch all classes scheduled for next week
// 	const classes = await Class.find({ date: { $gte: start, $lte: end } })
// 	console.log(start, end, classes.length, 'classes found')

// 	// Fetch all active trainers
// 	const trainers = await Trainer.find()

// 	// Track assignment counts
// 	const assignmentCount = trainers.reduce((acc, t) => {
// 		acc[t._id] = 0
// 		return acc
// 	}, {})

// 	const scheduledEntries = []

// 	const unassignedClasses = []

// 	for (const cls of classes) {
// 		const eligible = trainers.filter((t) => {
// 			const hasSkill = cls.skill_required.every((skill) =>
// 				t.skills.includes(skill)
// 			)
// 			const available = isWithinAvailability(t.availability, cls.date)
// 			const rested = hasRestPeriod(t, cls.date)
// 			return hasSkill && available && rested
// 		})

// 		eligible.sort((a, b) => assignmentCount[a._id] - assignmentCount[b._id])

// 		if (eligible.length) {
// 			const selected = eligible[0]
// 			assignmentCount[selected._id]++

// 			const entry = new Schedule({
// 				gym: cls.gym,
// 				trainer: selected._id,
// 				class: cls._id,
// 				status: 'Scheduled',
// 			})
// 			scheduledEntries.push(entry.save())
// 		} else {
// 			unassignedClasses.push(cls)
// 		}
// 	}

// 	const savedSchedules = await Promise.all(scheduledEntries)

// 	const populatedSchedules = await Schedule.find({
// 		_id: { $in: savedSchedules.map((s) => s._id) },
// 	})
// 		.populate('class')
// 		.populate('trainer')
// 		.populate('gym')

// 	// Notify everyone
// 	await notifySchedules(populatedSchedules, unassignedClasses)

// 	return populatedSchedules
// }

// services/scheduleService.js
import Class from '../models/Classes.js'
import Trainer from '../models/Trainers.js'
import Schedule from '../models/Schedules.js'
import {
	getWeekRange,
	isWithinAvailability,
	hasRestPeriod,
} from '../utils/scheduleUtils.js'
import { notifySchedules } from '../services/notificationService.js'

/**
 * Generates and saves the weekly schedule based on:
 * - Class dates in the upcoming week
 * - Trainer skills match (at least one required skill)
 * - Trainer availability slots
 * - Rest period between assignments
 * - Even distribution of classes
 * After scheduling, sends email notifications
 */
export async function generateWeeklySchedule() {
	const { start, end } = getWeekRange(new Date())
	console.log(start, end, 'week range')

	// Fetch classes within this week
	const classes = await Class.find({ date: { $gte: start, $lte: end } })
	console.log(classes.length, 'classes found')

	// Fetch all trainers
	const trainers = await Trainer.find()

	// Track assignment counts for load balancing
	const assignmentCount = trainers.reduce((acc, t) => {
		acc[t._id] = 0
		return acc
	}, {})

	const schedulePromises = []
	const unassignedClasses = []

	for (const cls of classes) {
		console.log(`Scheduling class ${cls.name} on ${cls.date.toISOString()}`)

		// Find eligible trainers
		const eligible = trainers.filter((t) => {
			// Match at least one required skill
			const hasSkill = cls.skill_required.some((skill) =>
				t.skills.includes(skill)
			)
			const available = isWithinAvailability(t.availability, cls.date)
			const rested = hasRestPeriod(t, cls.date)
			console.log(
				`Trainer ${t.name}: hasSkill=${hasSkill}, available=${available}, rested=${rested}`
			)
			return hasSkill && available && rested
		})

		// Balance load by sorting on assignment count
		eligible.sort((a, b) => assignmentCount[a._id] - assignmentCount[b._id])

		if (eligible.length) {
			const selected = eligible[0]
			assignmentCount[selected._id]++
			console.log(`Assigned to ${selected.name}`)

			// Create and save schedule
			const entry = new Schedule({
				gym: cls.gym,
				trainer: selected._id,
				class: cls._id,
				status: 'Scheduled',
			})
			schedulePromises.push(entry.save())
		} else {
			console.log(`No eligible trainer for class ${cls.name}`)
			unassignedClasses.push(cls)
		}
	}

	// Wait for all saves
	const savedSchedules = await Promise.all(schedulePromises)

	// Populate references for notifications
	const populatedSchedules = await Schedule.find({
		_id: { $in: savedSchedules.map((s) => s._id) },
	})
		.populate('class')
		.populate('trainer')
		.populate('gym')

	// Send notifications
	await notifySchedules(populatedSchedules, unassignedClasses)

	return populatedSchedules
}
