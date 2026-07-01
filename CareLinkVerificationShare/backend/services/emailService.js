const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"CareLink+" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your CareLink+ Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0052CC; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CareLink+</h1>
        </div>
        <div style="padding: 40px; background: #f8fafc;">
          <h2 style="color: #091E42;">Hello, ${name}!</h2>
          <p style="color: #42526E; font-size: 16px;">
            Thank you for registering with CareLink+. Please verify your email address to activate your account.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verifyUrl}"
               style="background: #0052CC; color: white; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            This link will expire in 24 hours. If you did not create an account, please ignore this email.
          </p>
          <p style="color: #6B7280; font-size: 12px;">
            If the button doesn't work, copy and paste this link:<br/>
            <a href="${verifyUrl}" style="color: #0052CC;">${verifyUrl}</a>
          </p>
        </div>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"CareLink+" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your CareLink+ Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0052CC; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CareLink+</h1>
        </div>
        <div style="padding: 40px; background: #f8fafc;">
          <h2 style="color: #091E42;">Password Reset Request</h2>
          <p style="color: #42526E; font-size: 16px;">
            Hi ${name}, we received a request to reset your password.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}"
               style="background: #0052CC; color: white; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

const sendApplicationStatusEmail = async (email, name, status, note) => {
  const transporter = createTransporter();
  const statusColor = status === "approved" ? "#10B981" : "#EF4444";
  const statusText = status === "approved" ? "Approved" : "Rejected";

  await transporter.sendMail({
    from: `"CareLink+" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your CareLink+ Application has been ${statusText}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0052CC; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CareLink+</h1>
        </div>
        <div style="padding: 40px; background: #f8fafc;">
          <h2 style="color: #091E42;">Application Update</h2>
          <p style="color: #42526E; font-size: 16px;">Hi ${name},</p>
          <div style="background: ${statusColor}20; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: ${statusColor}; font-weight: bold; margin: 0; font-size: 18px;">
              Your application has been ${statusText}
            </p>
          </div>
          ${note ? `<p style="color: #42526E;">Admin note: ${note}</p>` : ""}
          <p style="color: #42526E; font-size: 16px;">
            ${status === "approved" ? "Congratulations! You can now start receiving care requests on CareLink+." : "Unfortunately your application was not approved at this time. You may reapply after updating your profile."}
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/caretaker"
               style="background: #0052CC; color: white; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-size: 16px;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApplicationStatusEmail,
};
