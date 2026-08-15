import nodemailer from 'nodemailer';

export const sendCertificateEmail = async ({
  recipientEmail,
  recipientName,
  eventName,
  certCode,
  pdfFilePath,
  verifyUrl,
}) => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;

  if (!host || !user) {
    console.log(
      `[MOCK EMAIL DISPATCH] To: ${recipientEmail} | CertCode: ${certCode} | Event: ${eventName} | PDF: ${pdfFilePath}`
    );
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || '"CertGuard Verification" <no-reply@certguard.com>',
      to: recipientEmail,
      subject: `Your Certificate for ${eventName} - CertGuard`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #1e293b; margin-top: 0;">Congratulations, ${recipientName}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            Your official digital certificate for <strong>${eventName}</strong> has been generated and attached to this email.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #334155; font-weight: bold;">Certificate Code: ${certCode}</p>
          </div>
          <p style="color: #475569;">
            You or anyone else can verify the authenticity of your certificate at any time via the official link below:
          </p>
          <p style="text-align: center; margin: 25px 0;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verify Certificate Authenticity
            </a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Sent by CertGuard Digital Verification Platform
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Certificate_${certCode}.pdf`,
          path: pdfFilePath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL DISPATCHED] MessageId: ${info.messageId} to ${recipientEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL DISPATCH FAILED] Error sending to ${recipientEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};
