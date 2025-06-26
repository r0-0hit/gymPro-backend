import Schedule from '../models/Schedules.js'
import Trainer from '../models/Trainers.js'
import { isWithinAvailability, hasRestPeriod } from '../utils/scheduleUtils.js'
import { notifyReschedule } from './notificationService.js'

// export async function rescheduleClass(oldTrainerId, scheduleId) {
// 	// Fetch existing schedule
// 	const schedule = await Schedule.findById(scheduleId).populate(
// 		'class gym trainer'
// 	)
// 	if (!schedule) throw new Error('Schedule not found')
// 	if (schedule.trainer._id.toString() !== oldTrainerId)
// 		throw new Error('Trainer mismatch')

// 	// Mark old trainer cancellation
// 	schedule.status = 'Cancelled'
// 	await schedule.save()

// 	// Find new eligible trainers
// 	const trainers = await Trainer.find({ _id: { $ne: oldTrainerId } })
// 	const cls = schedule.class
// 	const assignmentCounts = await Schedule.aggregate([
// 		{ $match: { status: 'Scheduled' } },
// 		{ $group: { _id: '$trainer', count: { $sum: 1 } } },
// 	])
// 	const countMap = Object.fromEntries(
// 		assignmentCounts.map((a) => [a._id.toString(), a.count])
// 	)

// 	const eligible = trainers
// 		.filter((t) => {
// 			const hasSkill = cls.skill_required.some((skill) =>
// 				t.skills.includes(skill)
// 			)
// 			const available = isWithinAvailability(t.availability, cls.date)
// 			const rested = hasRestPeriod(t, cls.date)
// 			return hasSkill && available && rested
// 		})
// 		.sort(
// 			(a, b) =>
// 				(countMap[a._id.toString()] || 0) -
// 				(countMap[b._id.toString()] || 0)
// 		)

// 	if (!eligible.length)
// 		throw new Error('No eligible trainers for rescheduling')

// 	// Assign to new trainer
// 	schedule.trainer = eligible[0]._id
// 	schedule.status = 'Scheduled'
// 	await schedule.save()

// 	// Notify parties
// 	await notifyReschedule(schedule, oldTrainerId, eligible[0])
// 	return schedule
// }

export async function rescheduleClass(oldTrainerId, scheduleId) {
	const schedule = await Schedule.findById(scheduleId).populate(
		'class gym trainer'
	)
	if (!schedule) throw new Error('Schedule not found')
	if (schedule.trainer._id.toString() !== oldTrainerId)
		throw new Error('Trainer mismatch')

	// Cancel current schedule
	schedule.status = 'Cancelled'
	await schedule.save()

	const trainers = await Trainer.find({ _id: { $ne: oldTrainerId } })
	const cls = schedule.class

	const assignmentCounts = await Schedule.aggregate([
		{ $match: { status: 'Scheduled' } },
		{ $group: { _id: '$trainer', count: { $sum: 1 } } },
	])
	const countMap = Object.fromEntries(
		assignmentCounts.map((a) => [a._id.toString(), a.count])
	)

	const eligible = trainers
		.filter((t) => {
			const hasSkill = cls.skill_required.some((skill) =>
				t.skills.includes(skill)
			)
			const available = isWithinAvailability(t.availability, cls.date)
			const rested = hasRestPeriod(t, cls.date)
			return hasSkill && available && rested
		})
		.sort(
			(a, b) =>
				(countMap[a._id.toString()] || 0) -
				(countMap[b._id.toString()] || 0)
		)

	if (!eligible.length)
		throw new Error('No eligible trainers for rescheduling')

	// Create new schedule with replacement trainer
	const newSchedule = new Schedule({
		gym: schedule.gym._id,
		class: schedule.class._id,
		trainer: eligible[0]._id,
		status: 'Scheduled',
	})
	await newSchedule.save()

	// Notify involved parties
	const populatedNewSchedule = await Schedule.findById(newSchedule._id)
		.populate('class')
		.populate('trainer')
		.populate('gym')

	// const { notifyReschedule } = await import('./notificationService.js')
	await notifyReschedule(populatedNewSchedule, oldTrainerId, eligible[0])

	return populatedNewSchedule
}
