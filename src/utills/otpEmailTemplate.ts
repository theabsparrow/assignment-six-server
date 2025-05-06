export const otpEmailTemplate = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #4caf50;
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .body {
      padding: 20px;
      color: #333;
    }
    .otp {
      font-size: 32px;
      font-weight: bold;
      color: #4caf50;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      background-color: #f4f4f4;
      text-align: center;
      padding: 10px;
      font-size: 14px;
      color: #888;
    }
    a {
      color: #4caf50;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      Daily Dish - OTP Verification
    </div>
    <div class="body">
      <p>Dear User,</p>
      <p>Thank you for signing up with <strong>Daily Dish</strong>. Please use the following one-time password (OTP) to complete your verification process. This OTP is valid for <strong>2 minutes</strong> only.</p>
      <div class="otp">${otp}</div>
      <p>If you did not request this, please ignore this email or contact support if you have any concerns.</p>
      <p>Thank you,<br>Daily Dish Team</p>
    </div>
    <div class="footer">
      © 2025 Daily Dish. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
