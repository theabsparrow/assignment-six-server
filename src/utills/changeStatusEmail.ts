import { TemailOrderStatus } from "../module/order/order.interface";

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
        margin: 20px 0;
        text-align: center;
        padding: 6px 14px;
        border-radius: 20px;
        display: inline-block;
      }
      /* Status colors */
      .status.Pending { background: #e9ecef; color: #495057; }
      .status.Confirmed { background: #cfe2ff; color: #084298; }
      .status.Cooking { background: #ffe5d0; color: #d9480f; }
      .status.ReadyForPickup { background: #d1fae5; color: #065f46; }
      .status.OutForDelivery { background: #cff4fc; color: #055160; }
      .status.Delivered { background: #d1e7dd; color: #0f5132; }
      .status.Cancelled { background: #f8d7da; color: #842029; }

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
        <h2>🍽️ Order Status Update</h2>
      </div>

      <p>Hi <strong>${info?.customerName}</strong>,</p>
      <p>Your order for <strong>"${
        info?.mealName
      }"</strong> has been updated to:</p>

      <!-- Status Badge -->
      <div class="status ${info?.orderStatus}">
        ${info?.orderStatus}
      </div>

      <!-- Order Details -->
      <div class="order-details">
        <p><strong>📅 Order Date:</strong> ${info?.orderDate}</p>
        <p><strong>👨‍🍳 Meal Provider:</strong> ${info?.kitchenName}</p>
        <p><strong>💰 Total Amount:</strong> ${info?.totalAmount}</p>
      </div>

      <!-- Dynamic Messages -->
      ${
        info?.orderStatus === "Confirmed"
          ? `<p>✅ Thank you for choosing DailyDish! Your meal is confirmed and will be prepared on schedule.</p>`
          : ""
      }

      ${
        info?.orderStatus === "Cooking"
          ? `<p>👨‍🍳 Your meal is being cooked with care. It will be ready soon.</p>`
          : ""
      }

      ${
        info?.orderStatus === "ReadyForPickup"
          ? `<p>📦 Your meal is ready for pickup. Please collect it at the scheduled time.</p>`
          : ""
      }

      ${
        info?.orderStatus === "OutForDelivery"
          ? `<p>🚚 Your meal is on its way! Expect delivery shortly.</p>`
          : ""
      }

      ${
        info?.orderStatus === "Delivered"
          ? `<p>🥳 Your meal has been delivered. We hope you enjoy it!</p>`
          : ""
      }

      ${
        info?.orderStatus === "Cancelled"
          ? `<p>❌ Unfortunately, your order was cancelled. You can explore other delicious meals available on our platform.</p>
             <div style="text-align: center;">
               <a href="${link}" class="btn">Browse More Meals</a>
             </div>`
          : ""
      }

      <div class="footer">
        &copy; ${new Date().getFullYear()} Daily Dish — All rights reserved.
      </div>
    </div>
  </body>
</html>`;
