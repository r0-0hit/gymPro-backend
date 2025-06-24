import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const trainerSchema = new mongoose.Schema({
	name: { type: String, required: true },
	phoneNumber: {
		type: String,
		required: true,
	},
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	skills: [{ type: String }], // e.g., ['Zumba', 'Yoga']
	availability: [
		{
			day: String, // e.g., 'Monday'
			startTime: String, // '08:00'
			endTime: String, // '12:00'
		},
	],
	rest_period: { type: Number, default: 1 }, // in hours
	preferred_gyms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }],
	createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
trainerSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

// Password checker
trainerSchema.methods.matchPassword = function (enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('Trainer', trainerSchema)
