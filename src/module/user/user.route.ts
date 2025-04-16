import { Router } from "express";
import validateRequest from "../../middlewire/validateRequest";
import { customerValidation } from "../customer/customer.validation";
import { userController } from "./user.controller";
import { mealProviderValidation } from "../mealProvider/mealProvider.validation";

const router = Router();

router.post(
  "/register-customer",
  validateRequest(customerValidation.customerValidationSchema),
  userController.createCustomer
);
router.post(
  "/register-mealProvider",
  validateRequest(mealProviderValidation.mealProviderValidationSchema),
  userController.createMealProvider
);

export const userRoute = router;
