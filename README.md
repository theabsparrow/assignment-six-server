# **Car Store**

This is an advance backend application with rest apis built with the powerfull technology **Express.js**, **TypeScript**, and **MongoDB**. This is all about a meal box service and create meal document where the details of a meal is included with the price and quantity. An order collection manage the order with the totalprice and also calculate the reveneu form the order.

---

## **Live Demo server site** : mealbox-server-kappa.vercel.app

## **api common inception** : mealbox-server-kappa.vercel.app/api/v1

## **client site live link** : https://lambo-car-frontend.vercel.app/

## **client site github repo** : https://github.com/theabsparrow/assignment-six-client.git

---

## **Features**

### **Meal Box**

- Create, read, update, and delete meals.
- Create, read, update, and delete order.
- Create, read, update, and delete kitchen.
- Create, read, update, and delete meal planer.
- Search Cars by `title`.
- Tracking the order data when creating an order with the total price.

### **Meal Order Management**

- Place orders for Cars with real-time stock updates.
- Automatically calculate total price for each order depending on the quantity of the meal.
- Manage customer details by collection email and order quantities with the detail of meal id and total price.

### **Revenue Tracking**

- Calculate total revenue from all orders using MongoDB aggregation.

### **Error Handling**

- Comprehensive error responses for validation, not found, and insufficient stock.
- Clear and structured error messages for debugging.
- all types of error are managed with the mongooose built in schema.

---

## **Technologies Used**

- **Language:** TypeScript
- **Backend technology:** Node.js,
- **Framework:** Express.js
- **Database:** MongoDB with the library Mongoose
- **Validation:** Zod Validation
- **API Testing:** Postman
- **Deployment:** vercel

### **Installation**

1. **Clone the Repository:**

**go to your terminal , access your demanded directory and command**

```bash
git clone https://github.com/theabsparrow/assignment-six-server.git
```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**  
   Create a `.env` file in the root directory and add the credentials in the .env.examle file

4. **Run the Server:**

   ```bash
   npm run dev
   ```

5. **build the Server after completing:**
   ```bash
   npm run build
   ```
