import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY || 're_SV2oXLBY_3VneQCveVET1mZ9ckApZ8Kjh',
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: 'SenStudio Host <noreply@host.senstudio.space>',
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent via SMTP:", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("SMTP Email Error:", error);
    return { success: false, error };
  }
}

export function getVerificationEmailContent(username: string, link: string) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
            <h2 style="color: #4F46E5; text-align: center;">SenStudio Host</h2>
            
            <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                <h3 style="margin-top: 0;">Vérifiez votre compte</h3>
                <p>Bonjour <strong>${username}</strong>,</p>
                <p>Merci de rejoindre SenStudio Host. Pour activer votre compte et accéder à votre tableau de bord, veuillez cliquer sur le bouton ci-dessous :</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Vérifier mon Email</a>
                </div>
            </div>

            <div style="color: #666;">
                <h3 style="margin-top: 0; font-size: 16px;">Verify your account</h3>
                <p>Hello <strong>${username}</strong>,</p>
                <p>Thanks for joining SenStudio Host. To activate your account and access your dashboard, please click the button above.</p>
            </div>
            
            <p style="font-size: 11px; color: #999; margin-top: 20px; text-align: center;">
                If the button doesn't work, copy this link: <br/>
                <a href="${link}" style="color: #4F46E5;">${link}</a>
            </p>
        </div>
      </div>
    `;
}
