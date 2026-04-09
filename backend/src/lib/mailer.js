import nodemailer from 'nodemailer'

export const sendOTPEmail = async (to, otp) => {
  try {
    // For local prototype testing - print the OTP to the console
    console.log(`\n==========================================`)
    console.log(`🔐 DEV MODE OTP for ${to}: ${otp}`)
    console.log(`==========================================\n`)

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`⚠️ Email credentials not found in .env, skipping actual email send.`)
      return true
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Class2Event" <noreply@class2event.com>',
      to,
      subject: 'Your Verification OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fafafa;">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to Class2Event!</h2>
          <p style="color: #555; text-align: center; font-size: 16px; margin-bottom: 30px;">
            To complete your registration, please enter the following 6-digit verification code. This code will expire in 10 minutes.
          </p>
          <div style="text-align: center; padding: 20px; background-color: #fff; border-radius: 8px; border: 1px dashed #ccc; margin-bottom: 30px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #007BFF;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✉️ OTP Email sent to ${to}`)
    return true
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return false
  }
}
