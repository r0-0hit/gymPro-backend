import cron from 'node-cron'
import { generateWeeklySchedule } from '../services/scheduleService.js'

// Run every Sunday at 00:00
cron.schedule('0 0 * * 0', async () => {
	try {
		await generateWeeklySchedule()
		console.log('Weekly schedule & notifications sent')
	} catch (err) {
		console.error('Error in scheduled job:', err)
	}
})
export default () => {
	console.log('Cron job initialized')
}
