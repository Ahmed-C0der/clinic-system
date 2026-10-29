import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendResetPasswordEmail(
  toEmail: string,
  resetToken: string,
  userName: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

  await transporter.sendMail({
    from: `"OmniFlow" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset Password - OmniFlow',
    html: `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #141313; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; color: #e5e2e1; direction: ltr;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141313; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #201f1f; border-radius: 12px; overflow: hidden; border: 1px solid #444748; box-shadow: none;">
                
                <!-- Header Container -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #444748; background-color: #201f1f;">
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #c4c7c8; margin-bottom: 6px;">
                      OMNIFLOW SYSTEM
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; font-family: 'Inter', sans-serif; letter-spacing: -0.5px;">
                      Reset Password
                    </h1>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #e5e2e1; font-family: 'Inter', sans-serif;">
                      Hello ${userName},
                    </h2>

                    <p style="margin: 0 0 24px 0; font-size: 16px; font-weight: 400; line-height: 1.6; color: #c4c7c8; font-family: 'Inter', sans-serif;">
                      We received a request to reset the password for your OmniFlow account. Click the action button below to create a new password:
                    </p>

                    <!-- Primary Action Button -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                      <tr>
                        <td align="left">
                          <a href="${resetUrl}" target="_blank" style="background-color: #ffffff; color: #2f3131; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif; display: inline-block;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Information Notice Callout -->
                    <div style="background-color: #2a2a2a; border: 1px solid #444748; border-radius: 8px; padding: 16px; margin: 24px 0;">
                      <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #c4c7c8; margin-bottom: 4px;">
                        TOKEN EXPIRATION
                      </div>
                      <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 400; color: #ffffff;">
                        This authentication link is valid for 1 hour.
                      </div>
                    </div>

                    <p style="margin: 24px 0 0 0; font-size: 14px; font-weight: 400; line-height: 1.6; color: #c4c7c8; font-family: 'Inter', sans-serif;">
                      If you did not request this password reset, please ignore this email and your account will remain secure.
                    </p>
                  </td>
                </tr>

                <!-- Footer Container -->
                <tr>
                  <td style="background-color: #141313; padding: 24px 32px; border-top: 1px solid #444748; text-align: left;">
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 400; text-transform: uppercase; letter-spacing: 1px; color: #c4c7c8;">
                      OMNIFLOW © KINETIC MINIMALIST DISCIPLINE
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })
}