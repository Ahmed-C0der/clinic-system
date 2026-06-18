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
  patientName: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

  await transporter.sendMail({
    from: `"عيادة النخبة" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'إعادة تعيين كلمة المرور',
    html: `
      <div dir="rtl" style="font-family: Arial; padding: 20px;">
        <h2>مرحباً ${patientName}</h2>
        <p>طلبت إعادة تعيين كلمة المرور.</p>
        <a href="${resetUrl}"
           style="background:#1A6B5A; color:white; padding:12px 24px;
                  border-radius:8px; text-decoration:none; display:inline-block">
          إعادة تعيين كلمة المرور
        </a>
        <p style="color:#666; margin-top:16px">
          الرابط صالح لمدة ساعة واحدة فقط.
        </p>
        <p style="color:#666">
          إذا لم تطلب ذلك، تجاهل هذا الإيميل.
        </p>
      </div>
    `,
  })
}