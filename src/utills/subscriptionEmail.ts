export const subscriptionEmailTemplate = () => `
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
    .highlight {
      font-size: 18px;
      color: #4caf50;
      font-weight: bold;
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
      🎉 Subscription Confirmed
    </div>
    <div class="body">
      <p>Hi there,</p>
      <p>You've successfully subscribed to <strong>Daily Dish</strong> </p>
      <p>We're thrilled to have you with us! You'll now receive:</p>
      <ul>
        <li>🍽 Trending and curated meal ideas</li>
        <li>📬 Recipe recommendations in your inbox</li>
        <li>✨ Early updates on new features</li>
      </ul>
      <p class="highlight">Stay tuned and stay hungry!</p>
      <p>If this wasn't you, please disregard this message or contact our support team.</p>
      <p>Best regards,<br>The Daily Dish Team</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Daily Dish. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
