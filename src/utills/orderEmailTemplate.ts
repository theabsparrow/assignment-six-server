import { TemailOrder } from "../interface/global";

export const orderEmailTemplate = (
  link: string,
  info: TemailOrder
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Meal Order Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #2E8B57;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
    }
    .cta-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #2E8B57;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .footer {
      background-color: #f4f4f4;
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #777777;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>New Meal Order Received</h1>
    </div>
    <div class="content">
      <p>Dear ${info?.kitchenName},</p>
      <p>We are pleased to inform you that a new meal order has been placed and is currently pending confirmation.</p>
      <p><strong>Order Details:</strong></p>
      <ul>
        <li><strong>Customer Name:</strong>${info?.customerName}</li>
        <li><strong>Customer Emal:</strong> ${info?.customerEmail}</li>
        <li><strong>Order Date:</strong>${info?.orderDate} </li>
        <li><strong>Meal Name:</strong> ${info?.mealName}</li>
        <li><strong>Total Amount:</strong> ${info?.totalAmount}</li>
      </ul>
      <p>Please review the order details and confirm the order at your earliest convenience.</p>
      <a href={${link}} class="cta-button">View Order Details</a>
    </div>
    <div class="footer">
      &copy; 2025 Your Company Name. All rights reserved.
    </div>
  </div>
</body>
</html>`;
