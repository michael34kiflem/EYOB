import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendPasswordReset = async ({ email, name, OTP }) => {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: white;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #F74F22; margin: 0; font-size: 28px; font-weight: bold;">AudioBook Stream</h2>
              <p style="color: #666; margin-top: 5px;">Your Gateway to Unlimited Stories</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #F74F22 0%, #ff6b4a 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
              <h3 style="color: white; margin: 0; font-size: 22px;">Password Reset Request</h3>
            </div>
            
            <p style="margin-bottom: 20px; color: #333;">Dear ${name},</p>
            
            <p style="margin-bottom: 20px; color: #555;">We received a request to reset your password for your AudioBook Stream account. Use the following OTP to verify your identity and secure your account:</p>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; border: 2px dashed #F74F22;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #F74F22; font-family: 'Courier New', monospace;">
                ${OTP}
              </div>
            </div>
            
            <p style="margin-bottom: 20px; color: #555;">This verification code will expire in 10 minutes. If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #F74F22;">
              <p style="margin: 0; color: #666; font-size: 14px;"><strong>Security Tip:</strong> Never share this code with anyone. Our team will never ask for your verification code.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
              <p style="margin: 5px 0;">Need help? Contact our support team at support@audiobookstream.com</p>
              <p style="margin: 5px 0;">Happy listening! 🎧</p>
              <p style="margin: 5px 0; font-size: 11px; color: #999;">Credit to Eyob Book Hawassa</p>
              <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} AudioBook Stream. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ureadwith@gmail.com',
              pass: 'tznt ceqj aehf lhmb',
            }
        });

        const mailOptions = {
          from: 'AudioBook Stream <ureadwith@gmail.com>',
          to: email,
          subject: 'Password Reset Request - AudioBook Stream',
          html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`, info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};