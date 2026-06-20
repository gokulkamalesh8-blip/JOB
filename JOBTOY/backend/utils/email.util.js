const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Notify employer when a candidate applies.
 */
const sendApplicationEmail = async ({ employerEmail, candidateName, jobTitle, resumeUrl }) => {
  await transporter.sendMail({
    from:    `"Job Portal" <${process.env.EMAIL_FROM}>`,
    to:      employerEmail,
    subject: `New application: ${jobTitle}`,
    html: `
      <h2 style="font-family:sans-serif">New Application Received</h2>
      <p style="font-family:sans-serif">
        <strong>${candidateName}</strong> has applied for <strong>${jobTitle}</strong>.
      </p>
      <p style="font-family:sans-serif">
        <a href="${resumeUrl}" style="color:#1D9E75">View Resume (PDF)</a>
      </p>
    `,
  });
};

/**
 * Notify candidate when their application status changes.
 */
const sendStatusUpdateEmail = async ({ candidateEmail, jobTitle, status }) => {
  await transporter.sendMail({
    from:    `"Job Portal" <${process.env.EMAIL_FROM}>`,
    to:      candidateEmail,
    subject: `Application update: ${jobTitle}`,
    html: `
      <h2 style="font-family:sans-serif">Application Status Update</h2>
      <p style="font-family:sans-serif">
        Your application for <strong>${jobTitle}</strong> is now:
        <strong>${status}</strong>.
      </p>
    `,
  });
};

module.exports = { sendApplicationEmail, sendStatusUpdateEmail };
