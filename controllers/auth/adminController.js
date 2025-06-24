import Admins from '../../models/Admins.js'
import jwt from 'jsonwebtoken'

const generateToken = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const registerAdmin = async (req, res) => {
	const { name, email, password, phoneNumber } = req.body

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

	const existingAdmin = await Admins.findOne({ email })
	if (existingAdmin)
		return res.status(400).json({ message: 'Admin already exists' })

	try {
		const admin = await Admins.create({
			name,
			email,
			password,
			phoneNumber,
		})

		res.status(201).json({
			message: 'Registration successful',
			token: generateToken(admin._id, 'admin'),
		})
	} catch (error) {
		res.status(500).json({
			message: 'Error creating admin',
			error: error.message,
		})
	}
}

export const loginAdmin = async (req, res) => {
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
		const admin = await Admins.findOne({ email })
		if (admin && (await admin.matchPassword(password))) {
			res.status(200).json({
				message: 'Login successful',
				token: generateToken(admin._id, 'admin'),
				admin: {
					id: admin._id,
					name: admin.name,
					email: admin.email,
					role: 'admin',
					phoneNumber: admin.phoneNumber,
				},
			})
		} else {
			res.status(401).json({ message: 'Invalid email or password' })
		}
	} catch (error) {
		res.status(500).json({
			message: 'Error logging in admin',
			error: error.message,
		})
	}
}
