import { Router } from "express";
import validateRequest from "../../middlewire/validateRequest";
import { customerValidation } from "../customer/customer.validation";
import { userController } from "./user.controller";
import { mealProviderValidation } from "../mealProvider/mealProvider.validation";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "./user.const";
import { userValidation } from "./user.validation";
import { verifyOtpToken } from "../../middlewire/auth.verifyToken";

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
router.delete(
  "/delete/my-account",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  userController.deleteMyAccount
);
router.delete(
  "/delete/:id",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  userController.deleteAccount
);
router.post(
  "/update-info",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  validateRequest(userValidation.updateEmailPhoneValidationSchema),
  userController.updatePhoneEmail
);
router.post(
  "/verify-email",
  verifyOtpToken(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  validateRequest(userValidation.verifyEmailValidationSchema),
  userController.verifyEmail
);
export const userRoute = router;
