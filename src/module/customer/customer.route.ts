import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { customerController } from "./customer.controller";
import validateRequest from "../../middlewire/validateRequest";
import { customerValidation } from "./customer.validation";

const router = Router();

router.get(
  "/get-allCustomer",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  customerController.getAllCustomer
);
router.get(
  "/:id",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  customerController.getASingleCustomer
);
router.patch(
  "/update-info",
  auth(USER_ROLE.customer),
  validateRequest(customerValidation.updateCustomerInfoValidationSchema),
  customerController.updateCustomerInfo
);
export const customerRoute = router;
