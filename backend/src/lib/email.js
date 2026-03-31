import nodemailer from 'nodemailer'

export const sendVerificationEmail = async (to, token) => {
  try {
    const isEthereal = !process.env.SMTP_HOST

    let transporter

    if (isEthereal) {
      // Generate a test account dynamically for local development
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      })
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    }

    // Determine the base backend URL for the link (Frontend will actually need to know if verified or hit API, but hitting API directly confirms it immediately)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const verifyLink = `${backendUrl}/api/auth/verify-email?token=${token}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Class2Event" <noreply@class2event.com>',
      to,
      subject: 'Verify Your Class2Event Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Welcome to Class2Event!</h2>
          <p style="color: #555; font-size: 16px;">
            Thank you for signing up. To activate your account and access protected features, please verify your email address.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #555; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${verifyLink}" style="color: #007BFF; word-break: break-all;">${verifyLink}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 40px; text-align: center;">
            This link will expire in 15 minutes. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`✉️ Email sent to ${to}`)
    if (isEthereal) {
      console.log(`Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
