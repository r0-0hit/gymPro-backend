import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	service: 'gmail',
	port: 456,
	secure: true,
	auth: {
		user: 'rohit.mailprovider@gmail.com',
		pass: 'nyypreyibdptkqap',
	},
})

export async function sendEmail({ to, subject, html }) {
	await transporter.sendMail({
		from: process.env.EMAIL_FROM,
		to,
		subject,
		html,
	})
}
