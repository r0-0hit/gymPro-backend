import mongoose from 'mongoose'

const scheduleSchema = new mongoose.Schema({
	gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
	trainer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Trainer',
		required: true,
	},
	class: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Class',
		required: true,
	},
	status: {
		type: String,
		enum: ['Scheduled', 'Completed', 'Cancelled'],
		default: 'Scheduled',
	},
	createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Schedule', scheduleSchema)
