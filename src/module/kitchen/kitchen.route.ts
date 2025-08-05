import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { kitchenValidation } from "./kitchen.validation";
import { kitchenController } from "./kitchen.controller";
import { authRefesh } from "../../middlewire/authRefresh";
import { userValidation } from "../user/user.validation";

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
router.patch(
  "/update-status/:id",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(kitchenValidation.updateStatusValidationSchema),
  kitchenController.updateStatus
);
router.delete(
  "/delete-myKitchen",
  auth(USER_ROLE.mealProvider),
  validateRequest(userValidation.deleteValidationSchema),
  kitchenController.deleteMyKitchen
);

router.delete(
  "/delete-kitchen/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  kitchenController.deleteKitche
);
export const kitchenRoute = router;
