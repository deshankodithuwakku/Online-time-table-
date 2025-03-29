import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
        from: 'onboarding@resend.dev',
      to: email,  
      subject: 'Password Reset OTP',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
      subject: 'Password Reset OTP',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
    });

    return response;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};
