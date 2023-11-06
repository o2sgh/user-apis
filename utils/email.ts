import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv'
dotenv.config()
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
const sendEmail = async (options: any) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  await sgMail.send(mailOptions);
};

export default sendEmail;
