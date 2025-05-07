import nodemailer from 'nodemailer';
import configs from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using nodemailer
 * @param options Email options including recipient, subject, and content
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Create a transporter
      const transporter = nodemailer.createTransport({
      host: configs.emailConfig.SMTP_HOST,
      port: configs.emailConfig.SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: configs.emailConfig.SMTP_USER,
        pass: configs.emailConfig.SMTP_PASSWORD,
      },
    });

    // Set email options
    const mailOptions = {
      from: `"${configs.emailConfig.FROM_NAME}" <${configs.emailConfig.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;