import { TemailOrderStatus } from "../interface/global";

export const changeStatusEmailTemplate = (
  link: string,
  info: TemailOrderStatus
) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Order Status Update</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        padding: 0;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
      }
      .header {
        text-align: center;
        margin-bottom: 25px;
      }
      .header h2 {
        color: #2d3748;
        font-size: 24px;
        margin: 0;
      }
      .status {
        font-size: 18px;
        font-weight: bold;
        color: {{statusColor}};
        margin: 20px 0;
        text-align: center;
      }
      .order-details {
        background-color: #f7fafc;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .order-details p {
        margin: 6px 0;
        color: #4a5568;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #a0aec0;
        margin-top: 30px;
      }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        margin-top: 15px;
        text-decoration: none;
        color: white;
        border-radius: 6px;
        font-weight: bold;
        background-color: #3182ce;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>🍽️ Your Order Status Has Been Updated</h2>
      </div>

      <p>Hi <strong>${info?.customerName}</strong>,</p>
      <p>
        Your order for <strong>"${info?.mealName}"</strong> has been 
        <span class="status">${info?.orderStatus}</span>.
      </p>

      <div class="order-details">
        <p><strong>Order Date:</strong> ${info?.orderDate}</p>
        <p><strong>Meal Provider:</strong> ${info.kitchenName}</p>
        <li><strong>Total Amount:</strong> ${info?.totalAmount}</li>
      </div>

      ${
        info?.orderDate === "Confirmed"
          ? `<p>Thank you for choosing DailyDish! Your meal is being prepared and will be delivered as scheduled.</p>`
          : ""
      }

        ${
          info?.orderDate === "Cancelled"
            ? `<p>We're sorry to inform you that your order was cancelled by the provider. You can explore other meals available on our platform.</p>
            <a href="${link}" class="btn">Browse More Meals</a>`
            : ""
        }

      <div class="footer">
          &copy; ${new Date().getFullYear()} Daily Dish — All rights reserved.
        </div>
    </div>
  </body>
</html>
`;
