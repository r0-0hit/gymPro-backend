// import Schedule from '../models/Schedules.js'
// import Gym from '../models/Gyms.js'
// import Trainer from '../models/Trainers.js'
// import {
// 	formatSchedulesForEmail,
// 	formatUnassignedClassesForEmail,
// } from '../utils/emailFormatter.js'
// import { sendEmail } from '../utils/emailService.js'

// /**
//  * Notify admin, gyms, and trainers with their schedules
//  */
// // export async function notifySchedules(schedules) {
// // 	// Admin: all schedules
// // 	const adminHtml = formatSchedulesForEmail(schedules)
// // 	await sendEmail({
// // 		to: process.env.ADMIN_EMAIL,
// // 		subject: 'Weekly Full Schedule',
// // 		html: adminHtml,
// // 	})

// // 	// Group by gym
// // 	const byGym = schedules.reduce((acc, s) => {
// // 		acc[s.gym] = acc[s.gym] || []
// // 		acc[s.gym].push(s)
// // 		return acc
// // 	}, {})

// // 	// Send to each gym
// // 	for (const gymId of Object.keys(byGym)) {
// // 		const gym = await Gym.findById(gymId)
// // 		const html = formatSchedulesForEmail(byGym[gymId])
// // 		await sendEmail({
// // 			to: gym.email,
// // 			subject: 'Your Weekly Gym Schedule',
// // 			html,
// // 		})
// // 	}

// // 	// Group by trainer
// // 	const byTrainer = schedules.reduce((acc, s) => {
// // 		acc[s.trainer] = acc[s.trainer] || []
// // 		acc[s.trainer].push(s)
// // 		return acc
// // 	}, {})

// // 	// Send to each trainer
// // 	for (const trainerId of Object.keys(byTrainer)) {
// // 		const trainer = await Trainer.findById(trainerId)
// // 		const html = formatSchedulesForEmail(byTrainer[trainerId])
// // 		await sendEmail({
// // 			to: trainer.email,
// // 			subject: 'Your Weekly Schedule',
// // 			html,
// // 		})
// // 	}
// // }

// export async function notifySchedules(schedules, unassigned = []) {
// 	// Full schedule to admin
// 	const adminHtml = formatSchedulesForEmail(schedules)
// 	const unassignedHtml = formatUnassignedClassesForEmail(unassigned)
// 	await sendEmail({
// 		to: process.env.ADMIN_EMAIL,
// 		subject: 'Weekly Full Schedule + Unassigned Classes',
// 		html: `${adminHtml}<hr/><h2>Unassigned Classes</h2>${unassignedHtml}`,
// 	})

// 	// Group unassigned by gym
// 	const unassignedByGym = unassigned.reduce((acc, cls) => {
// 		acc[cls.gym] = acc[cls.gym] || []
// 		acc[cls.gym].push(cls)
// 		return acc
// 	}, {})

// 	// Notify each gym with their schedules and missed ones
// 	const byGym = schedules.reduce((acc, s) => {
// 		acc[s.gym] = acc[s.gym] || []
// 		acc[s.gym].push(s)
// 		return acc
// 	}, {})

// 	for (const gymId of new Set([
// 		...Object.keys(byGym),
// 		...Object.keys(unassignedByGym),
// 	])) {
// 		const gym = await Gym.findById(gymId)
// 		const gymSchedules = byGym[gymId] || []
// 		const gymUnassigned = unassignedByGym[gymId] || []

// 		const htmlScheduled = formatSchedulesForEmail(gymSchedules)
// 		const htmlUnassigned = formatUnassignedClassesForEmail(gymUnassigned)

// 		await sendEmail({
// 			to: gym.email,
// 			subject: 'Your Weekly Gym Schedule',
// 			html: `${htmlScheduled}${
// 				gymUnassigned.length
// 					? '<hr/><h2>Unassigned Classes</h2>' + htmlUnassigned
// 					: ''
// 			}`,
// 		})
// 	}

// 	// Trainers — no change
// 	const byTrainer = schedules.reduce((acc, s) => {
// 		acc[s.trainer] = acc[s.trainer] || []
// 		acc[s.trainer].push(s)
// 		return acc
// 	}, {})

// 	for (const trainerId of Object.keys(byTrainer)) {
// 		const trainer = await Trainer.findById(trainerId)
// 		const html = formatSchedulesForEmail(byTrainer[trainerId])
// 		await sendEmail({
// 			to: trainer.email,
// 			subject: 'Your Weekly Schedule',
// 			html,
// 		})
// 	}
// }

// services/notificationService.js
import Gym from '../models/Gyms.js'
import Trainer from '../models/Trainers.js'
import {
	formatSchedulesForEmail,
	formatUnassignedClassesForEmail,
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
