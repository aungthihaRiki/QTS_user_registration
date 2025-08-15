export function resetPasswordTemplate({ firstName , resetUrl } : { firstName? : string | null, resetUrl : string }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Hi ${firstName || "there"},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" 
        style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #7c3aed;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">
        Reset Password
      </a>
      <p style="margin-top: 15px; font-size: 12px; color: #666;">
        If you did not request a password reset, please ignore this email.
      </p>
      <p>Thanks,<br/>QTS Support Team</p>
    </div>
  `;
}
