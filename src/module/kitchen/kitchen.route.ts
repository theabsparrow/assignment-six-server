import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { kitchenValidation } from "./kitchen.validation";
import { kitchenController } from "./kitchen.controller";

const router = Router();
router.post(
  "/create-kitchen",
  auth(USER_ROLE["meal provider"]),
  validateRequest(kitchenValidation.kitchenValidationSchema),
  kitchenController.createKitchen
);
router.get(
  "/all-kitchen",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  kitchenController.getAllKitchen
);
router.get(
  "/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  kitchenController.getASingleKitchen
);
router.patch(
  "/update-kitchen",
  auth(USER_ROLE["meal provider"]),
  validateRequest(kitchenValidation.updateKitchenValidationSchema),
  kitchenController.updateKitchenInfo
);
export const kitchenRoute = router;
