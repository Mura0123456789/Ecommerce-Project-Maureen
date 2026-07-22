const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail(user) {
  try {
    await transporter.sendMail({
      from: '"The Store" <no-reply@store.com>',
      to: user.email,
      subject: 'Welcome to The Store!',
      text: `Hi ${user.name}, thanks for creating an account with us.`,
      html: `<p>Hi <strong>${user.name}</strong>,</p><p>Thanks for creating an account with us. Happy shopping!</p>`,
    });
  } catch (err) {
    // Email failures should never break registration - just log it.
    console.error('Failed to send welcome email:', err.message);
  }
}

module.exports = { sendWelcomeEmail };
