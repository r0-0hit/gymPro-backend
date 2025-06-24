// import mongoose from 'mongoose'

// const adminSchema = new mongoose.Schema({
// 	name: { type: String, required: true },
// 	email: { type: String, required: true, unique: true },
// 	password: { type: String, required: true },
// 	role: {
// 		type: String,
// 		enum: ['admin', 'manager', 'trainer'],
// 		default: 'trainer',
// 	},
// 	trainerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }, // Optional for trainer login
// 	createdAt: { type: Date, default: Date.now },
// })

// // Hash password before saving
// adminSchema.pre('save', async function (next) {
// 	if (!this.isModified('password')) return next()
// 	this.password = await bcrypt.hash(this.password, 10)
// 	next()
// })

// export default mongoose.model('Admin', adminSchema)

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	phoneNumber: {
		type: String,
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
adminSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

// Password checker
adminSchema.methods.matchPassword = function (enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password)
}

const Admins = mongoose.model('Admins', adminSchema)
export default Admins
