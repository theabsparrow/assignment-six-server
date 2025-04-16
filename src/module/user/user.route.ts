import { Router } from "express";
import validateRequest from "../../middlewire/validateRequest";
import { customerValidation } from "../customer/customer.validation";
import { userController } from "./user.controller";
import { mealProviderValidation } from "../mealProvider/mealProvider.validation";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "./user.const";

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
router.get(
  "/my-profile",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  userController.getMeRoute
);

export const userRoute = router;
