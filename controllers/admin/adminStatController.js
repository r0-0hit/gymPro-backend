import Trainers from '../../models/Trainers.js'
import Schedule from '../../models/Schedules.js'
import moment from 'moment' // make sure to install: npm install moment

export const getDashboardKPIs = async (req, res) => {
	try {
		// === Date Ranges ===
		const startOfMonth = moment().startOf('month').toDate()
		const now = new Date()
		const startOfLastMonth = moment()
			.subtract(1, 'month')
			.startOf('month')
			.toDate()
		const endOfLastMonth = moment()
			.subtract(1, 'month')
			.endOf('month')
			.toDate()

		// === Active Trainers ===
		const currentTrainerCount = await Trainers.countDocuments({
			createdAt: { $lte: now },
		})
		const lastMonthTrainerCount = await Trainers.countDocuments({
			createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
		})
		const trainerGrowth = (
			(lastMonthTrainerCount === 0
				? 0
				: (currentTrainerCount - lastMonthTrainerCount) /
				  lastMonthTrainerCount) * 100
		).toFixed(2)

		// // === Active Sessions (Completed) ===
		// const activeSessionCount = await Schedule.countDocuments({
		// 	status: 'Completed',
		// 	createdAt: { $lte: now },
		// })

		const activeSessionCount = await Schedule.countDocuments({
			status: { $in: ['Scheduled', 'Completed'] },
			date: { $gte: startOfMonth, $lte: now },
		})

		const lastMonthCompletedSessions = await Schedule.countDocuments({
			status: 'Completed',
			createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
		})
		const sessionGrowth = (
			(lastMonthCompletedSessions === 0
				? 0
				: (activeSessionCount - lastMonthCompletedSessions) /
				  lastMonthCompletedSessions) * 100
		).toFixed(2)

		// === Missed Sessions ===
		const missedSessionsCount = await Schedule.countDocuments({
			status: 'Cancelled',
			createdAt: { $lte: now },
		})
		const lastMonthMissed = await Schedule.countDocuments({
			status: 'Cancelled',
			createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
		})
		const missedGrowth = (
			(lastMonthMissed === 0
				? 0
				: (missedSessionsCount - lastMonthMissed) / lastMonthMissed) *
			100
		).toFixed(2)

		// === Performance Metrics (You can enhance logic here) ===
		const totalSessions = await Schedule.countDocuments({
			createdAt: { $lte: now },
		})
		const sessionCompletion =
			totalSessions === 0
				? 0
				: Math.round((activeSessionCount / totalSessions) * 100)
		const trainerEfficiency = Math.round(Math.random() * 10 + 85) // simulate for now
		const clientSatisfaction = Math.round(Math.random() * 5 + 90) // simulate for now
		const revenueGrowth = Math.round(Math.random() * 30 + 60) // simulate for now

		// === Recent Activities (latest 5) ===
		const recentActivities = await Schedule.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('trainer', 'name')
			.populate('class', 'name')

		const formattedActivities = recentActivities.map((s) => ({
			trainerName: s.trainer?.name || 'Unknown',
			className: s.class?.name || 'Unknown',
			status: s.status,
			date: s.createdAt,
		}))

		res.status(200).json({
			activeTrainers: {
				count: currentTrainerCount,
				change: `${trainerGrowth}%`,
			},
			activeSessions: {
				count: activeSessionCount,
				change: `${sessionGrowth}%`,
			},
			missedSessions: {
				count: missedSessionsCount,
				change: `${missedGrowth}%`,
			},
			performanceMetrics: {
				sessionCompletion,
				trainerEfficiency,
				clientSatisfaction,
				revenueGrowth,
			},
			recentActivities: formattedActivities,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Failed to fetch dashboard KPIs',
			error: error.message,
		})
	}
}
