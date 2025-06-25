import Admins from '../../models/Admins.js'
import Gyms from '../../models/Gyms.js'
import Trainers from '../../models/Trainers.js'
import jwt from 'jsonwebtoken'

const generateToken = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const commonLogin = async (req, res) => {
	const { email, password } = req.body

	// Check for missing fields
	if (!email || !password) {
		return res.status(400).json({
			message: 'Please provide email and password.',
		})
	}

	try {
		let user = null

		// Try Trainer
		user = await Trainers.findOne({ email })
		if (user && (await user.matchPassword(password))) {
			res.status(200).json({
				message: 'Login successful',
				token: generateToken(user._id, 'trainer'),
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: 'trainer',
					phoneNumber: user.phoneNumber,
					skills: user.skills,
					rest_period: user.rest_period,
					availability: user.availability,
					preferred_gyms: user.preferred_gyms,
				},
			})
		}

		// Try Gym
		if (!user) {
			user = await Gyms.findOne({ email })
			if (user && (await user.matchPassword(password))) {
				res.status(200).json({
					message: 'Login successful',
					token: generateToken(user._id, 'gym'),
					user: {
						id: user._id,
						name: user.name,
						email: user.email,
						role: 'gym',
						phoneNumber: user.phoneNumber,
						location: user.location,
					},
				})
			}
		}

		// Try Admin
		if (!user) {
			user = await Admins.findOne({ email })
			if (user && (await user.matchPassword(password))) {
				// const admin = await Admins.findOne({ email })
				res.status(200).json({
					message: 'Login successful',
					token: generateToken(user._id, 'admin'),
					user: {
						id: user._id,
						name: user.name,
						email: user.email,
						role: 'admin',
						phoneNumber: user.phoneNumber,
					},
				})
			}
		}

		// If no user found in any model
		if (!user) {
			return res
				.status(401)
				.json({ message: 'Invalid email or password' })
		}

		// if (
		// 	(await Trainers.findOne({ email })) &&
		// 	(await trainer.matchPassword(password))
		// ) {
		// 	const trainer = await Trainers.findOne({ email })
		// 	res.status(200).json({
		// 		message: 'Login successful',
		// 		token: generateToken(trainer._id, 'trainer'),
		// 		trainer: {
		// 			id: trainer._id,
		// 			name: trainer.name,
		// 			email: trainer.email,
		// 			role: 'trainer',
		// 			phoneNumber: trainer.phoneNumber,
		// 			skills: trainer.skills,
		// 			rest_period: trainer.rest_period,
		// 			availability: trainer.availability,
		// 			preferred_gyms: trainer.preferred_gyms,
		// 		},
		// 	})
		// } else if (
		// 	(await Gyms.findOne({ email })) &&
		// 	(await gym.matchPassword(password))
		// ) {
		// 	const gym = await Gyms.findOne({ email })

		// 	res.status(200).json({
		// 		message: 'Login successful',
		// 		token: generateToken(gym._id, 'gym'),
		// 		gym: {
		// 			id: gym._id,
		// 			name: gym.name,
		// 			email: gym.email,
		// 			role: 'gym',
		// 			phoneNumber: gym.phoneNumber,
		// 			location: gym.location,
		// 		},
		// 	})
		// } else if (
		// 	(await Admins.findOne({ email })) &&
		// 	(await admin.matchPassword(password))
		// ) {
		// 	const admin = await Admins.findOne({ email })
		// 	res.status(200).json({
		// 		message: 'Login successful',
		// 		token: generateToken(admin._id, 'admin'),
		// 		admin: {
		// 			id: admin._id,
		// 			name: admin.name,
		// 			email: admin.email,
		// 			role: 'admin',
		// 			phoneNumber: admin.phoneNumber,
		// 		},
		// 	})
		// } else {
		// 	res.status(401).json({ message: 'Invalid email or password' })
		// }
	} catch (error) {
		res.status(500).json({
			message: 'Error logging in gym',
			error: error.message,
		})
	}
}
