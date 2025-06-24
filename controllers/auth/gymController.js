import Gyms from '../../models/Gyms.js'
import jwt from 'jsonwebtoken'

const generateToken = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const registerGym = async (req, res) => {
	const { name, email, password, location, phoneNumber } = req.body

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

	const existingGym = await Gyms.findOne({ email })
	if (existingGym)
		return res.status(400).json({ message: 'Gym already exists' })

	try {
		const gym = await Gyms.create({
			name,
			email,
			password,
			location,
			phoneNumber,
		})

		res.status(201).json({
			message: 'Registration successful',
			token: generateToken(gym._id, 'gym'),
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error creating gym',
			error: error.message,
		})
	}
}

export const loginGym = async (req, res) => {
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
		const gym = await Gyms.findOne({ email })
		if (gym && (await gym.matchPassword(password))) {
			res.status(200).json({
				message: 'Login successful',
				token: generateToken(gym._id, 'gym'),
				gym: {
					id: gym._id,
					name: gym.name,
					email: gym.email,
					role: 'gym',
					phoneNumber: gym.phoneNumber,
					location: gym.location,
				},
			})
		} else {
			res.status(401).json({ message: 'Invalid email or password' })
		}
	} catch (error) {
		res.status(500).json({
			message: 'Error logging in gym',
			error: error.message,
		})
	}
}
