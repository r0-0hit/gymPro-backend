import Gym from '../models/Gyms.js'
import Trainer from '../models/Trainers.js'
import {
	formatSchedulesForEmail,
	formatUnassignedClassesForEmail,
	formatRescheduleEmail,
} from '../utils/emailFormatter.js'
import { sendEmail } from '../utils/emailService.js'

export async function notifySchedules(schedules, unassigned = []) {
	// 1) Admin gets everything
	await sendEmail({
		to: process.env.ADMIN_EMAIL,
		subject: 'Weekly Full Schedule & Unassigned Classes',
		html:
			formatSchedulesForEmail(schedules) +
			'<hr/>' +
			formatUnassignedClassesForEmail(unassigned),
	})

	// 2) Group schedules & unassigned by gym ID string
	const schedulesByGym = {}
	schedules.forEach((s) => {
		const key = s.gym._id.toString()
		schedulesByGym[key] = schedulesByGym[key] || []
		schedulesByGym[key].push(s)
	})
	const unassignedByGym = {}
	unassigned.forEach((c) => {
		const key = c.gym.toString() // here c.gym is the ObjectId
		unassignedByGym[key] = unassignedByGym[key] || []
		unassignedByGym[key].push(c)
	})

	// 3) Email each gym its own schedule + unassigned
	for (const gymId of new Set([
		...Object.keys(schedulesByGym),
		...Object.keys(unassignedByGym),
	])) {
		// If we have populated schedules, use that gym object
		const gymSchedules = schedulesByGym[gymId] || []
		let gymInfo
		if (gymSchedules.length) {
			gymInfo = gymSchedules[0].gym
		} else {
			gymInfo = await Gym.findById(gymId)
		}

		const html =
			formatSchedulesForEmail(gymSchedules) +
			(unassignedByGym[gymId]?.length
				? '<hr/>' +
				  formatUnassignedClassesForEmail(unassignedByGym[gymId])
				: '')

		await sendEmail({
			to: gymInfo.email,
			subject: 'Your Weekly Gym Schedule',
			html,
		})
	}

	// 4) Group by trainer ID string and email each
	const schedulesByTrainer = {}
	schedules.forEach((s) => {
		const key = s.trainer._id.toString()
		schedulesByTrainer[key] = schedulesByTrainer[key] || []
		schedulesByTrainer[key].push(s)
	})

	for (const trainerId of Object.keys(schedulesByTrainer)) {
		const trainerSchedules = schedulesByTrainer[trainerId]
		const trainerInfo = trainerSchedules[0].trainer
		await sendEmail({
			to: trainerInfo.email,
			subject: 'Your Weekly Trainer Schedule',
			html: formatSchedulesForEmail(trainerSchedules),
		})
	}
}

export async function notifyReschedule(schedule, oldTrainerId, newTrainer) {
	const { class: cls, gym, trainer } = schedule
	// Admin
	await Mailer.send({
		to: process.env.ADMIN_EMAIL,
		subject: 'Class Rescheduled',
		html: formatRescheduleEmail(schedule, gym, cls, trainer, oldTrainerId),
	})
	// Gym
	const gymData = gym.email ? gym : await Gym.findById(gym)
	await Mailer.send({
		to: gymData.email,
		subject: 'A Class Has Been Rescheduled',
		html: formatRescheduleEmail(
			schedule,
			gymData,
			cls,
			trainer,
			oldTrainerId
		),
	})
	// New trainer
	await Mailer.send({
		to: newTrainer.email,
		subject: 'New Class Assignment',
		html: formatRescheduleEmail(
			schedule,
			gymData,
			cls,
			trainer,
			oldTrainerId
		),
	})
	// Old trainer
	const oldTrainer = await Trainer.findById(oldTrainerId)
	await Mailer.send({
		to: oldTrainer.email,
		subject: 'Class Cancellation Notice',
		html: formatRescheduleEmail(
			schedule,
			gymData,
			cls,
			trainer,
			oldTrainerId,
			true
		),
	})
}
