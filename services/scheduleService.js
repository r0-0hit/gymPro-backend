// File: services/scheduleService.js
import Schedule from '../models/Schedules.js'
import Class from '../models/Classes.js'
import Trainer from '../models/Trainers.js'
import Gym from '../models/Gyms.js'
import nodemailer from 'nodemailer'
import mongoose from 'mongoose'

function getDateForDay(dayName) {
	const today = new Date()
	const dayIndex = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	].indexOf(dayName)
	const diff = (dayIndex + 7 - today.getDay()) % 7
	const date = new Date(today)
	date.setDate(today.getDate() + diff)
	return date
}

function timeOverlap(slot1, slot2, restHours = 1) {
	const buffer = restHours * 60
	const toMinutes = (t) => {
		const [h, m] = t.split(':').map(Number)
		return h * 60 + m
	}
	const s1 = toMinutes(slot1.startTime)
	const e1 = toMinutes(slot1.endTime)
	const s2 = toMinutes(slot2.startTime)
	const e2 = toMinutes(slot2.endTime)
	return !(e1 + buffer <= s2 || e2 + buffer <= s1)
}

function getDayNameFromDate(date) {
	return new Date(date).toLocaleString('en-US', { weekday: 'long' })
}

async function sendEmail(to, subject, html) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})

	await transporter.sendMail({
		from: process.env.EMAIL_USER,
		to,
		subject,
		html,
	})
}

async function notifyAdminAndGym(gymEmail, adminEmail, message) {
	const html = `<p>${message}</p>`
	if (gymEmail) await sendEmail(gymEmail, 'Unassigned Class Alert', html)
	if (adminEmail) await sendEmail(adminEmail, 'Unassigned Class Alert', html)
}

export const generateWeeklySchedule = async () => {
	const classes = await Class.find({}).populate('gym')
	const trainers = await Trainer.find({})
	const days = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
	]
	const schedule = []
	const unassigned = []

	for (const classObj of classes) {
		const { skill_required, time_slot, gym } = classObj
		let assigned = false

		for (const day of days) {
			const matchingTrainers = trainers.filter(
				(tr) =>
					tr.skills.includes(skill_required) &&
					tr.availability.some(
						(av) =>
							av.day === day &&
							av.startTime <= time_slot.startTime &&
							av.endTime >= time_slot.endTime
					)
			)

			for (const trainer of matchingTrainers) {
				const date = getDateForDay(day)
				const existingSchedules = await Schedule.find({
					trainer: trainer._id,
					date,
				})

				const conflict = await Promise.all(
					existingSchedules.map(async (sch) => {
						const scheduledClass = await Class.findById(sch.class)
						return timeOverlap(
							scheduledClass.time_slot,
							time_slot,
							trainer.rest_period
						)
					})
				)

				if (!conflict.includes(true)) {
					const scheduled = await Schedule.create({
						gym: gym._id,
						trainer: trainer._id,
						class: classObj._id,
						date,
					})
					schedule.push(scheduled)
					assigned = true
					break
				}
			}
			if (assigned) break
		}

		if (!assigned) {
			unassigned.push(classObj)
			const adminEmail = process.env.ADMIN_EMAIL || ''
			await notifyAdminAndGym(
				gym.email,
				adminEmail,
				`Class '${classObj.name}' at gym '${gym.name}' was not assigned to any trainer.`
			)
		}
	}
	return schedule
}

export const handleCancellation = async (scheduleId) => {
	const schedule = await Schedule.findById(scheduleId).populate(
		'class trainer gym'
	)
	if (!schedule) throw new Error('Schedule not found')

	schedule.status = 'Cancelled'
	await schedule.save()

	const { class: classObj, date, gym } = schedule
	const skill = classObj.skill_required
	const time_slot = classObj.time_slot
	const day = getDayNameFromDate(date)
	const adminEmail = process.env.ADMIN_EMAIL || ''

	const availableTrainers = await Trainer.find({
		skills: skill,
		preferred_gyms: gym._id,
		availability: {
			$elemMatch: {
				day,
				startTime: { $lte: time_slot.startTime },
				endTime: { $gte: time_slot.endTime },
			},
		},
	})

	for (const trainer of availableTrainers) {
		const existing = await Schedule.find({ trainer: trainer._id, date })
		const conflict = await Promise.all(
			existing.map(async (sch) => {
				const cls = await Class.findById(sch.class)
				return timeOverlap(
					cls.time_slot,
					time_slot,
					trainer.rest_period
				)
			})
		)

		if (!conflict.includes(true)) {
			const newSchedule = await Schedule.create({
				gym: gym._id,
				trainer: trainer._id,
				class: classObj._id,
				date,
				status: 'Scheduled',
			})

			await sendEmail(
				trainer.email,
				'Class Replacement Assigned',
				`<p>You have been assigned to replace a class for skill: ${skill} on ${day}, ${date.toDateString()} at ${
					time_slot.startTime
				}.</p>`
			)
			await sendEmail(
				gym.email,
				'Trainer Replacement Assigned',
				`<p>${trainer.name} has been assigned to a replacement class '${classObj.name}' on ${day}.</p>`
			)
			await sendEmail(
				adminEmail,
				'Trainer Replacement Assigned',
				`<p>Replacement trainer ${trainer.name} was assigned for class '${classObj.name}' on ${day} at gym '${gym.name}'.</p>`
			)

			return newSchedule
		}
	}

	await sendEmail(
		gym.email,
		'Trainer Replacement Failed',
		`<p>No replacement trainer could be found for class '${classObj.name}' on ${day}.</p>`
	)
	await sendEmail(
		adminEmail,
		'Trainer Replacement Failed',
		`<p>No replacement trainer could be found for class '${classObj.name}' on ${day} at gym '${gym.name}'.</p>`
	)
	return null
}

// --- CONTROLLER FUNCTIONS ---

export const generateWeeklyScheduleController = async (req, res) => {
	try {
		const result = await generateWeeklySchedule()
		res.status(200).json({
			message: 'Weekly schedule generated successfully',
			schedule: result,
		})
	} catch (err) {
		res.status(500).json({
			message: 'Failed to generate schedule',
			error: err.message,
		})
	}
}

export const cancelAndFindReplacementController = async (req, res) => {
	try {
		const { id } = req.params
		const replacement = await handleCancellation(id)

		if (replacement) {
			res.status(200).json({
				message: 'Trainer replaced successfully',
				replacement,
			})
		} else {
			res.status(200).json({
				message: 'Trainer cancelled, but no replacement found',
			})
		}
	} catch (err) {
		res.status(500).json({
			message: 'Failed to cancel and find replacement',
			error: err.message,
		})
	}
}

// --- ROUTES SETUP (Example) ---
// router.post('/schedule/generate-weekly', generateWeeklyScheduleController)
// router.post('/schedule/cancel/:id', cancelAndFindReplacementController)
