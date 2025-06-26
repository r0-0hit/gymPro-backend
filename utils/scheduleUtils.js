import moment from 'moment'

export function getWeekRange(referenceDate) {
	const start = moment(referenceDate).startOf('isoWeek').toDate() // Monday
	const end = moment(referenceDate).endOf('isoWeek').toDate() // Sunday
	return { start, end }
}

export function isWithinAvailability(availability, classDate) {
	const day = moment(classDate).format('dddd') // e.g., "Tuesday"
	const classTime = moment(classDate).format('HH:mm')

	return availability.some((slot) => {
		return (
			slot.day === day &&
			classTime >= slot.startTime &&
			classTime <= slot.endTime
		)
	})
}

const lastAssigned = {} // key: trainerId, value: [Date]

export function hasRestPeriod(trainer, classDate) {
	const lastDates = lastAssigned[trainer._id] || []

	const classMoment = moment(classDate)

	for (const prev of lastDates) {
		const diff = classMoment.diff(prev, 'hours')
		if (Math.abs(diff) < trainer.rest_period) {
			return false
		}
	}

	lastAssigned[trainer._id] = [...lastDates, classMoment]
	return true
}
