function formatPhoneNumberForTwilio(phone) {
  return phone.startsWith('+') ? phone : `+${phone}`;
}

export function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
}

export async function sendVerificationOtpSms({ to, otpCode, expiresInMinutes }) {
  if (!isSmsConfigured()) {
    const error = new Error(
      'SMS verification is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in server/.env.',
    );
    error.status = 503;
    throw error;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: formatPhoneNumberForTwilio(to),
      From: fromPhoneNumber,
      Body: `SkillVigo OTP: ${otpCode}. It expires in ${expiresInMinutes} minutes. Do not share this code.`,
    }),
  });

  if (!response.ok) {
    const providerMessage = await response.text();
    const error = new Error('Could not send the phone verification OTP right now.');
    error.status = 502;
    error.details = providerMessage;
    throw error;
  }
}
