const nodemailer = require("nodemailer");

/* ============================================================
   EMAIL TRANSPORTER
============================================================ */

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* ============================================================
   HTML SAFETY HELPER
============================================================ */

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* ============================================================
   VERIFICATION EMAIL
============================================================ */

const sendVerificationEmail = async (
  email,
  name,
  token
) => {
  const transporter = createTransporter();

  const verifyUrl =
    `${process.env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: `"CareLink+" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your CareLink+ Account",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

        <div style="background: #0052CC; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            CareLink+
          </h1>
        </div>

        <div style="padding: 40px; background: #f8fafc;">

          <h2 style="color: #091E42;">
            Hello, ${escapeHtml(name)}!
          </h2>

          <p style="color: #42526E; font-size: 16px;">
            Thank you for registering with CareLink+.
            Please verify your email address to activate your account.
          </p>

          <div style="text-align: center; margin: 40px 0;">

            <a
              href="${verifyUrl}"
              style="
                background: #0052CC;
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: bold;
              "
            >
              Verify Email Address
            </a>

          </div>

          <p style="color: #6B7280; font-size: 14px;">
            This link will expire in 24 hours.
            If you did not create an account, please ignore this email.
          </p>

          <p style="color: #6B7280; font-size: 12px;">
            If the button doesn't work, copy and paste this link:
            <br />

            <a
              href="${verifyUrl}"
              style="color: #0052CC;"
            >
              ${verifyUrl}
            </a>
          </p>

        </div>

      </div>
    `,
  });
};

/* ============================================================
   PASSWORD RESET EMAIL
============================================================ */

const sendPasswordResetEmail = async (
  email,
  name,
  token
) => {
  const transporter = createTransporter();

  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: `"CareLink+" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset Your CareLink+ Password",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

        <div style="background: #0052CC; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            CareLink+
          </h1>
        </div>

        <div style="padding: 40px; background: #f8fafc;">

          <h2 style="color: #091E42;">
            Password Reset Request
          </h2>

          <p style="color: #42526E; font-size: 16px;">
            Hi ${escapeHtml(name)}, we received a request to reset your password.
          </p>

          <div style="text-align: center; margin: 40px 0;">

            <a
              href="${resetUrl}"
              style="
                background: #0052CC;
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>

          </div>

          <p style="color: #6B7280; font-size: 14px;">
            This link will expire in 1 hour.
            If you did not request a password reset, please ignore this email.
          </p>

        </div>

      </div>
    `,
  });
};

/* ============================================================
   CARETAKER APPLICATION STATUS EMAIL
============================================================ */

const sendApplicationStatusEmail = async (
  email,
  name,
  status,
  note
) => {
  const transporter = createTransporter();

  const statusColor =
    status === "approved"
      ? "#10B981"
      : "#EF4444";

  const statusText =
    status === "approved"
      ? "Approved"
      : "Rejected";

  await transporter.sendMail({
    from: `"CareLink+" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject:
      `Your CareLink+ Application has been ${statusText}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

        <div style="background: #0052CC; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            CareLink+
          </h1>
        </div>

        <div style="padding: 40px; background: #f8fafc;">

          <h2 style="color: #091E42;">
            Application Update
          </h2>

          <p style="color: #42526E; font-size: 16px;">
            Hi ${escapeHtml(name)},
          </p>

          <div
            style="
              background: ${statusColor}20;
              border-left: 4px solid ${statusColor};
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            "
          >

            <p
              style="
                color: ${statusColor};
                font-weight: bold;
                margin: 0;
                font-size: 18px;
              "
            >
              Your application has been ${statusText}
            </p>

          </div>

          ${
            note
              ? `
                <p style="color: #42526E;">
                  Admin note: ${escapeHtml(note)}
                </p>
              `
              : ""
          }

          <p style="color: #42526E; font-size: 16px;">
            ${
              status === "approved"
                ? "Congratulations! You can now start receiving care requests on CareLink+."
                : "Unfortunately your application was not approved at this time. You may reapply after updating your profile."
            }
          </p>

          <div style="text-align: center; margin: 30px 0;">

            <a
              href="${process.env.CLIENT_URL}/caretaker"
              style="
                background: #0052CC;
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 12px;
                font-size: 16px;
              "
            >
              View Dashboard
            </a>

          </div>

        </div>

      </div>
    `,
  });
};

/* ============================================================
   CONTACT MESSAGE REPLY EMAIL
============================================================ */

/*
 * Sends an administrator response to a user's
 * Contact Us message.
 *
 * This function does NOT modify the database.
 * The controller will store the reply in
 * ContactMessage.replies[] after successful delivery.
 */

const sendContactReplyEmail = async ({
  email,
  name,
  originalSubject,
  replyMessage,
  adminName = "CareLink+ Support",
}) => {
  const transporter = createTransporter();

  const safeName =
    escapeHtml(name || "CareLink+ User");

  const safeSubject =
    escapeHtml(
      originalSubject ||
        "Your CareLink+ enquiry"
    );

  const safeReply =
    escapeHtml(
      replyMessage || ""
    ).replace(
      /\r?\n/g,
      "<br />"
    );

  const safeAdminName =
    escapeHtml(adminName);

  const rawSubject =
    String(
      originalSubject ||
        "Your CareLink+ enquiry"
    ).trim();

  const emailSubject =
    /^re:/i.test(rawSubject)
      ? rawSubject
      : `Re: ${rawSubject}`;

  await transporter.sendMail({
    from: `"CareLink+ Support" <${process.env.EMAIL_FROM}>`,

    to: email,

    /*
     * Allows the customer to reply directly
     * to the CareLink+ support email address.
     */
    replyTo: process.env.EMAIL_FROM,

    subject: emailSubject,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          background: #f1f5f9;
          padding: 30px 15px;
        "
      >

        <div
          style="
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);
          "
        >

          <!-- Header -->

          <div
            style="
              background: #003898;
              padding: 30px;
              text-align: center;
            "
          >

            <h1
              style="
                color: #ffffff;
                margin: 0;
                font-size: 28px;
              "
            >
              CareLink+
            </h1>

            <p
              style="
                color: rgba(255,255,255,0.8);
                margin: 8px 0 0;
                font-size: 14px;
              "
            >
              Smart Parent Care Management System
            </p>

          </div>

          <!-- Content -->

          <div style="padding: 40px;">

            <h2
              style="
                color: #091E42;
                margin-top: 0;
              "
            >
              Hello ${safeName},
            </h2>

            <p
              style="
                color: #42526E;
                font-size: 16px;
                line-height: 1.7;
              "
            >
              Thank you for contacting CareLink+.
              Our support team has reviewed your message
              and provided the response below.
            </p>

            <!-- Original Subject -->

            <div
              style="
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 18px;
                margin: 25px 0;
              "
            >

              <p
                style="
                  margin: 0 0 6px;
                  color: #64748B;
                  font-size: 12px;
                  text-transform: uppercase;
                  font-weight: bold;
                "
              >
                Regarding
              </p>

              <p
                style="
                  margin: 0;
                  color: #091E42;
                  font-size: 16px;
                  font-weight: 600;
                "
              >
                ${safeSubject}
              </p>

            </div>

            <!-- Admin Reply -->

            <div
              style="
                border-left: 4px solid #0052CC;
                padding: 5px 0 5px 20px;
                margin: 30px 0;
              "
            >

              <p
                style="
                  margin: 0 0 10px;
                  color: #64748B;
                  font-size: 12px;
                  text-transform: uppercase;
                  font-weight: bold;
                "
              >
                CareLink+ Support Response
              </p>

              <p
                style="
                  margin: 0;
                  color: #334155;
                  font-size: 16px;
                  line-height: 1.8;
                "
              >
                ${safeReply}
              </p>

            </div>

            <p
              style="
                color: #42526E;
                font-size: 15px;
                line-height: 1.7;
              "
            >
              We appreciate you taking the time to contact
              CareLink+. Please reply to this email if you
              need further assistance.
            </p>

            <!-- Support Signature -->

            <div
              style="
                margin-top: 35px;
                padding-top: 25px;
                border-top: 1px solid #e2e8f0;
              "
            >

              <p
                style="
                  margin: 0;
                  color: #091E42;
                  font-weight: bold;
                  font-size: 15px;
                "
              >
                ${safeAdminName}
              </p>

              <p
                style="
                  margin: 5px 0 0;
                  color: #64748B;
                  font-size: 13px;
                "
              >
                CareLink+ Support Team
              </p>

              <p
                style="
                  margin: 5px 0 0;
                  color: #64748B;
                  font-size: 13px;
                "
              >
                ${escapeHtml(
                  process.env.EMAIL_FROM || ""
                )}
              </p>

            </div>

          </div>

          <!-- Footer -->

          <div
            style="
              background: #f8fafc;
              padding: 20px 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            "
          >

            <p
              style="
                margin: 0;
                color: #94a3b8;
                font-size: 12px;
              "
            >
              © 2026 CareLink+. All rights reserved.
            </p>

            <p
              style="
                margin: 6px 0 0;
                color: #94a3b8;
                font-size: 12px;
              "
            >
              Connecting families with trusted care services
              across Sri Lanka.
            </p>

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
  sendContactReplyEmail,
};