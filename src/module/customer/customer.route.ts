import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { customerController } from "./customer.controller";

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
export const customerRouter = router;
