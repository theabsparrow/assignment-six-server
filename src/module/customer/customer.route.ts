import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { customerController } from "./customer.controller";
import validateRequest from "../../middlewire/validateRequest";
import { customerValidation } from "./customer.validation";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();

router.get(
  "/get-allCustomer",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  customerController.getAllCustomer
);
router.get(
  "/:id",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  customerController.getASingleCustomer
);
router.patch(
  "/update-info",
  auth(USER_ROLE.customer, USER_ROLE.admin),
  validateRequest(customerValidation.updateCustomerInfoValidationSchema),
  customerController.updateCustomerInfo
);
export const customerRoute = router;
