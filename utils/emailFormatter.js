import Class from '../models/Classes.js'
import Gym from '../models/Gyms.js'
import Trainer from '../models/Trainers.js'
import moment from 'moment'

/**
 * Builds HTML table of schedules
 */
export function formatSchedulesForEmail(schedules) {
	let rows = ''
	for (const s of schedules) {
		const date = moment(s.createdAt).format('dddd, MMM Do YYYY, HH:mm')
		rows += `<tr><td>${date}</td><td>${s.class.name}</td><td>${s.trainer.name}</td><td>${s.gym.name}</td><td>${s.status}</td></tr>`
	}
	return `
    <h1>Weekly Schedule</h1>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead><tr><th>Date</th><th>Class</th><th>Trainer</th><th>Gym</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

export function formatUnassignedClassesForEmail(classes) {
	if (!classes.length) return '<p>No unassigned classes.</p>'

	let rows = ''
	for (const cls of classes) {
		const date = moment(cls.date).format('dddd, MMM Do YYYY')
		rows += `<tr>
      <td>${cls.name}</td>
      <td>${date}</td>
      <td>${cls.time_slot.startTime} - ${cls.time_slot.endTime}</td>
      <td>${cls.skill_required.join(', ')}</td>
    </tr>`
	}

	return `
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr><th>Class</th><th>Date</th><th>Time</th><th>Skill(s) Required</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

export function formatRescheduleEmail(
	schedule,
	gym,
	cls,
	newTrainer,
	oldTrainerId,
	isCancellation = false
) {
	const date = moment(cls.date).format('dddd, MMM Do YYYY, HH:mm')
	const oldTrainerText = isCancellation
		? 'Your class has been cancelled by the gym.'
		: ''
	return `
    <h1>Reschedule Notification</h1>
    <p>Class: ${cls.name}</p>
    <p>Date: ${date}</p>
    <p>Gym: ${gym.name}</p>
    <p>New Trainer: ${newTrainer.name}</p>
    <p>${oldTrainerText}</p>
  `
}
