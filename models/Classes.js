import mongoose from 'mongoose'

const classSchema = new mongoose.Schema({
	gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
	name: { type: String, required: true }, // e.g., "Morning Yoga"
	skill_required: { type: String }, // e.g., "Yoga"
	time_slot: {
		startTime: String, // e.g., "09:00"
		endTime: String, // e.g., "10:00"
	},
	assigned_trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
	createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Class', classSchema)
