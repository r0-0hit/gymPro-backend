import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/dbconfig.js'
import commonLoginRoutes from './routes/commonLoginRoutes.js'
import trainerRoutes from './routes/trainerRoutes.js'
import gymRoutes from './routes/gymRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const PORT = process.env.PORT || 5000

dotenv.config()
const app = express()

// Connect to DB
connectDB()

app.use(cors()) // Enable CORS for all routes
app.use(express.json())

// Middleware
app.use(express.json())

// Routes
app.use('/api/users', commonLoginRoutes)
app.use('/api/trainers', trainerRoutes)
app.use('/api/gyms', gymRoutes)
app.use('/api/admins', adminRoutes)

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
