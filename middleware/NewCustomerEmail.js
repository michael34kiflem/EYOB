import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Reuse the same transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'ureadwith@gmail.com',
      pass: process.env.SMTP_PASS, // Use environment variable for security
    },
    // Connection timeout settings
    connectionTimeout: 30000, // 30 seconds
    socketTimeout: 30000,     // 30 seconds
    greetingTimeout: 30000,   // 30 seconds
    // Retry configuration
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

// Reuse the same retry mechanism
const sendWithRetry = async (transporter, mailOptions, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to send welcome email to ${mailOptions.to}`);
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${mailOptions.to}`, info.messageId);
      return info;
      
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff before retrying
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to send welcome email after ${maxRetries} attempts: ${lastError.message}`);
};

export const sendWelcomeEmail = async ({ email, name }) => {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: white;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #F74F22; margin: 0; font-size: 28px; font-weight: bold;">AudioBook Stream</h2>
              <p style="color: #666; margin-top: 5px;">Your Gateway to Unlimited Stories</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #F74F22 0%, #ff6b4a 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
              <h3 style="color: white; margin: 0; font-size: 22px;">Welcome to AudioBook Stream! 🎉</h3>
            </div>
            
            <p style="margin-bottom: 20px; color: #333;">Dear ${name},</p>
            
            <p style="margin-bottom: 20px; color: #555;">We're thrilled to welcome you to AudioBook Stream! Your account has been successfully created and you're now ready to dive into our vast library of audiobooks.</p>
            
            <!-- CEO Introduction Section -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="margin-right: 20px;">
                  <img src="https://res.cloudinary.com/dqwttbkqo/image/upload/v1758874409/FB_IMG_1758874201877_qi7a4n.jpg" 
                       alt="EYOB TSEGE TEREFE - CEO" 
                       style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #F74F22;">
                </div>
                <div>
                  <h4 style="color: #F74F22; margin: 0 0 5px 0; font-size: 18px;">EYOB TSEGE TEREFE</h4>
                  <p style="color: #666; margin: 0; font-size: 14px;">Co-Founder & CEO, AudioBook Stream</p>
                </div>
              </div>
              <p style="color: #555; margin: 0; font-style: italic; border-left: 3px solid #F74F22; padding-left: 15px;">
                "Welcome to our community! At AudioBook Stream, we believe every story has the power to transform lives. 
                We've built this platform with passion and care, and we're excited to have you join us on this auditory journey. 
                Happy listening!"
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #F74F22;">
              <h4 style="color: #F74F22; margin-top: 0; margin-bottom: 15px;">Get Started:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #555;">
                <li style="margin-bottom: 8px;">📚 Explore thousands of audiobooks across all genres</li>
                <li style="margin-bottom: 8px;">🎧 Listen on any device - mobile, tablet, or computer</li>
                <li style="margin-bottom: 8px;">⭐ Create personalized playlists and favorites</li>
                <li style="margin-bottom: 8px;">📱 Download for offline listening</li>
                <li style="margin-bottom: 0;">🔔 Get recommendations based on your interests</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'https://yourapp.com'}/dashboard" style="background: linear-gradient(135deg, #F74F22 0%, #ff6b4a 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Start Listening Now
              </a>
            </div>
            
            <p style="margin-bottom: 20px; color: #555;">If you have any questions or need assistance, our support team is here to help you get the most out of your audio experience.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #F74F22;">
              <p style="margin: 0; color: #666; font-size: 14px;"><strong>Pro Tip:</strong> Complete your profile preferences to get personalized book recommendations tailored just for you!</p>
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
        const transporter = createTransporter();
        
        const mailOptions = {
          from: 'AudioBook Stream <ureadwith@gmail.com>',
          to: email,
          subject: 'Welcome to AudioBook Stream! Start Your Listening Journey',
          html: html,
          // Add priority headers for better delivery
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
          }
        };

        const info = await sendWithRetry(transporter, mailOptions);
        console.log(`Welcome email delivered to ${email}`, info.messageId);
        return true;
        
    } catch (error) {
        console.error(`Error sending welcome email to ${email}:`, error);
        throw new Error(`Failed to send welcome email: ${error.message}`);
    }
};