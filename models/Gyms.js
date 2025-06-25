import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const gymSchema = new mongoose.Schema({
	name: { type: String, required: true },
	location: String,
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	phoneNumber: {
		type: String,
		required: true,
	},
	classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
	createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
gymSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

// Password checker
gymSchema.methods.matchPassword = function (enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('Gym', gymSchema)
