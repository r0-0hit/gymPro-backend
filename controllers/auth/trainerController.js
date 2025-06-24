import Trainers from '../../models/Trainers.js'
import jwt from 'jsonwebtoken'

const generateToken = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const registerTrainer = async (req, res) => {
	const { name, email, password, phoneNumber, skills, rest_period } = req.body

	// Check for missing fields
	if (!name || !email || !password || !phoneNumber) {
		return res.status(400).json({
			message: 'Please provide name, email, password, and phone number.',
		})
	}

	// valid password length
	if (password.length < 8) {
		return res.status(400).json({
			message: 'Password must be at least 8 characters long.',
		})
	}

	const existingTrainer = await Trainers.findOne({ email })
	if (existingTrainer)
		return res.status(400).json({ message: 'Trainer already exists' })

	try {
		const trainer = await Trainers.create({
			name,
			email,
			password,
			phoneNumber,
			skills,
			rest_period,
		})

		res.status(201).json({
			message: 'Registration successful',
			token: generateToken(trainer._id, 'trainer'),
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error creating trainer',
			error: error.message,
		})
	}
}

export const loginTrainer = async (req, res) => {
	const { email, password } = req.body

	// Validate input
	if (!email || !password) {
		return res
			.status(400)
			.json({ message: 'Please provide email and password.' })
	}

	// valid password length
	if (password.length < 8) {
		return res.status(400).json({
			message: 'Password must be at least 8 characters long.',
		})
	}

	try {
		const trainer = await Trainers.findOne({ email })
		if (trainer && (await trainer.matchPassword(password))) {
			res.status(200).json({
				message: 'Login successful',
				token: generateToken(trainer._id, 'trainer'),
				trainer: {
					id: trainer._id,
					name: trainer.name,
					email: trainer.email,
					role: 'trainer',
					phoneNumber: trainer.phoneNumber,
					skills: trainer.skills,
					rest_period: trainer.rest_period,
					availability: trainer.availability,
					preferred_gyms: trainer.preferred_gyms,
				},
			})
		} else {
			res.status(401).json({ message: 'Invalid email or password' })
		}
	} catch (error) {
		res.status(500).json({
			message: 'Error logging in trainer',
			error: error.message,
		})
	}
}
