import { Router } from "express";
import validateRequest from "../../middlewire/validateRequest";
import { authValidation } from "./auth.validation";
import { authController } from "./auth.controller";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
// import validaterefreshToken from "../../middlewire/validateRefreshToken";
import { authRefesh } from "../../middlewire/authRefresh";
import { verifyOtpToken } from "../../middlewire/auth.verifyToken";

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
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  authController.logout
);
router.post(
  "/change-password",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  validateRequest(authValidation.passwordChangedValidationSchema),
  authController.changePassword
);
router.post(
  "/get-token",
  authRefesh(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  // validaterefreshToken(authValidation.refreshTokenValidationSchema),
  authController.generateAccessToken
);
router.post(
  "/search-email",
  validateRequest(authValidation.forgetPasswordValidationSchema),
  authController.searchWithEmail
);
router.post(
  "/send-otp",
  validateRequest(authValidation.forgetPasswordValidationSchema),
  authController.sendOTP
);
router.post(
  "/reset-password",
  verifyOtpToken(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  validateRequest(authValidation.resetPasswordValidationSchema),
  authController.resetPassword
);
router.patch(
  "/set-password",
  verifyOtpToken(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  validateRequest(authValidation.setNewPasswordValidationSchema),
  authController.setNewPassword
);
router.get(
  "/resend-otp",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  authController.resendOtp
);
export const authRoute = router;
