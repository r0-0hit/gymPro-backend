// import mongoose from 'mongoose'

// const userSchema = new mongoose.Schema({
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
// userSchema.pre('save', async function (next) {
// 	if (!this.isModified('password')) return next()
// 	this.password = await bcrypt.hash(this.password, 10)
// 	next()
// })

// export default mongoose.model('User', userSchema)

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: {
		type: String,
		enum: ['admin', 'manager', 'trainer'],
		default: 'trainer',
	},
	phoneNumber: {
		type: String,
		required: true,
	},
	trainerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainers' },
	createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

// Password checker
userSchema.methods.matchPassword = function (enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password)
}

const Users = mongoose.model('Users', userSchema)
export default Users
