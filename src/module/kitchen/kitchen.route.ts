import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { kitchenValidation } from "./kitchen.validation";
import { kitchenController } from "./kitchen.controller";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();
router.post(
  "/create-kitchen",
  auth(USER_ROLE.mealProvider),
  validateRequest(kitchenValidation.kitchenValidationSchema),
  kitchenController.createKitchen
);
router.get(
  "/all-kitchen",
  authRefesh(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  kitchenController.getAllKitchen
);
router.get(
  "/myKitchen",
  authRefesh(USER_ROLE.mealProvider),
  kitchenController.getMyKitchen
);
router.get(
  "/:id",
  authRefesh(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  kitchenController.getASingleKitchen
);

router.patch(
  "/update-kitchen",
  auth(USER_ROLE.mealProvider),
  validateRequest(kitchenValidation.updateKitchenValidationSchema),
  kitchenController.updateKitchenInfo
);
export const kitchenRoute = router;
