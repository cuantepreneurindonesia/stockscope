import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Twilio Setup (Sandbox or Env vars)
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_mock_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'mock_auth_token';
const twilioClient = accountSid.startsWith('AC_mock') ? null : twilio(accountSid, authToken);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

/**
 * Send SMS using Twilio
 */
export async function sendSMSAlert(phone: string, message: string) {
  try {
    if (!twilioClient) {
      console.log(`[MOCK SMS] To: ${phone} | Message: ${message}`);
      return true;
    }
    
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: phone,
    });
    console.log(`[SMS] Sent to ${phone}`);
    return true;
  } catch (error) {
    console.error('[SMS ERROR]', error);
    return false;
  }
}

/**
 * Send Email using Nodemailer
 */
export async function sendEmailAlert(email: string, subject: string, htmlMessage: string) {
  try {
    if (process.env.SMTP_USER === 'mock_user') {
      console.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: `"Stockscope Alerts" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: htmlMessage,
    });
    
    console.log(`[EMAIL] Sent to ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return false;
  }
}
