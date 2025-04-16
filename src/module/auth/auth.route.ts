import { Router } from "express";
import validateRequest from "../../middlewire/validateRequest";
import { authValidation } from "./auth.validation";
import { authController } from "./auth.controller";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";

const router = Router();

router.post(
  "/login",
  validateRequest(authValidation.authValidationSchema),
  authController.login
);
router.post(
  "/logout",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  authController.logout
);

export const authRoute = router;
