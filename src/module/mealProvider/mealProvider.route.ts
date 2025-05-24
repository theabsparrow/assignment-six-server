import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { mealProviderController } from "./mealProvider.controller";
import validateRequest from "../../middlewire/validateRequest";
import { mealProviderValidation } from "./mealProvider.validation";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();
router.get(
  "/get-allMealProvider",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  mealProviderController.getAllMealProviders
);
router.get(
  "/:id",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  mealProviderController.getASingleMealProvider
);
router.patch(
  "/updateInfo",
  auth(USER_ROLE.mealProvider),
  validateRequest(mealProviderValidation.updateMealProviderValidationSchema),
  mealProviderController.updateData
);
export const mealProviderRoute = router;
