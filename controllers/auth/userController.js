import Users from '../../models/Users.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const registerUser = async (req, res) => {
	const { name, email, password, role, phoneNumber } = req.body

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

	const existingUser = await Users.findOne({ email })
	if (existingUser)
		return res.status(400).json({ message: 'User already exists' })

	// Create user
	try {
		const user = await Users.create({
			name,
			email,
			password,
			role,
			phoneNumber,
		})

		res.status(201).json({
			message: 'Registration successful',
			token: generateToken(user._id),
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				phoneNumber: user.phoneNumber,
			},
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error creating user',
			error: error.message,
		})
	}
}

export const loginUser = async (req, res) => {
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
		const user = await Users.findOne({ email })
		if (user && (await user.matchPassword(password))) {
			res.status(200).json({
				message: 'Login successful',
				token: generateToken(user._id),
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					phoneNumber: user.phoneNumber || null, // Optional, in case not set
				},
			})
		} else {
			res.status(401).json({ message: 'Invalid email or password' })
		}
	} catch (error) {
		res.status(500).json({
			message: 'Error logging in user',
			error: error.message,
		})
	}
}
