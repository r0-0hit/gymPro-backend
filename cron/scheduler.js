import cron from 'node-cron'
import { generateWeeklySchedule } from '../services/scheduleService.js'

const setupCronJobs = () => {
	// Every Sunday at 12:01 AM
	cron.schedule('1 0 * * 0', async () => {
		console.log('[CRON] Generating weekly schedule...')
		try {
			await generateWeeklySchedule()
			console.log('[CRON] Weekly schedule generated successfully.')
		} catch (error) {
			console.error('[CRON] Failed to generate schedule:', error.message)
		}
	})
}

export default setupCronJobs
