import nodemailer from 'nodemailer';

function parsePort(value) {
  const port = Number.parseInt(value || '465', 10);
  return Number.isFinite(port) ? port : 465;
}

function parseSecure(value) {
  if (typeof value !== 'string') {
    return true;
  }

  return !['false', '0', 'no'].includes(value.trim().toLowerCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

function createTransporter() {
  if (!isEmailConfigured()) {
    const error = new Error('Email service is not configured. Add SMTP settings in server/.env.');
    error.status = 503;
    throw error;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parsePort(process.env.SMTP_PORT),
    secure: parseSecure(process.env.SMTP_SECURE),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildPasswordResetEmail({ name, resetUrl, expiresInMinutes }) {
  const safeName = escapeHtml(name || 'there');
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    subject: 'Reset your SkillVigo password',
    text: [
      `Hi ${name || 'there'},`,
      '',
      'We received a request to reset your SkillVigo password.',
      `Use this link to set a new password: ${resetUrl}`,
      '',
      `This link expires in ${expiresInMinutes} minutes.`,
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="margin:0;padding:24px;background:#f8fafc;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
          <div style="padding:32px 32px 20px;background:linear-gradient(135deg,#ecfdf5 0%,#f8fafc 100%);border-bottom:1px solid #e2e8f0;">
            <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#dcfce7;color:#047857;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
              SkillVigo Security
            </div>
            <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.2;">Reset your password</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
              Hi ${safeName}, we received a request to reset your SkillVigo password.
            </p>
          </div>
          <div style="padding:28px 32px 32px;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
              Use the button below to choose a new password. For your security, this link expires in ${expiresInMinutes} minutes.
            </p>
            <a href="${safeResetUrl}" style="display:inline-block;padding:14px 22px;border-radius:16px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;">
              Reset password
            </a>
            <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#64748b;">
              If the button does not open, copy and paste this link into your browser:
            </p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.7;word-break:break-all;color:#0f172a;">
              ${safeResetUrl}
            </p>
            <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#64748b;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

function buildVerificationOtpEmail({ name, otpCode, expiresInMinutes }) {
  const safeName = escapeHtml(name || 'there');
  const safeOtpCode = escapeHtml(otpCode);

  return {
    subject: 'Verify your SkillVigo account',
    text: [
      `Hi ${name || 'there'},`,
      '',
      `Your SkillVigo verification code is: ${otpCode}`,
      '',
      `This OTP expires in ${expiresInMinutes} minutes.`,
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="margin:0;padding:24px;background:#f8fafc;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
          <div style="padding:32px 32px 20px;background:linear-gradient(135deg,#ecfdf5 0%,#f8fafc 100%);border-bottom:1px solid #e2e8f0;">
            <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#dcfce7;color:#047857;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
              SkillVigo Verification
            </div>
            <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.2;">Verify your email</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
              Hi ${safeName}, use this OTP to verify your SkillVigo account.
            </p>
          </div>
          <div style="padding:28px 32px 32px;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
              Enter this code in the app to confirm that this email address belongs to you.
            </p>
            <div style="display:inline-block;padding:16px 22px;border-radius:18px;background:#0f172a;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.32em;">
              ${safeOtpCode}
            </div>
            <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#64748b;">
              This OTP expires in ${expiresInMinutes} minutes. Never share this code with anyone.
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

export async function sendPasswordResetEmail({ to, name, resetUrl, expiresInMinutes }) {
  const transporter = createTransporter();
  const message = buildPasswordResetEmail({
    name,
    resetUrl,
    expiresInMinutes,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

export async function sendVerificationOtpEmail({ to, name, otpCode, expiresInMinutes }) {
  const transporter = createTransporter();
  const message = buildVerificationOtpEmail({
    name,
    otpCode,
    expiresInMinutes,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
