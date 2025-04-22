import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { mealProviderController } from "./mealProvider.controller";
import validateRequest from "../../middlewire/validateRequest";
import { mealProviderValidation } from "./mealProvider.validation";

const router = Router();
router.get(
  "/get-allMealProvider",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  mealProviderController.getAllMealProviders
);
router.get(
  "/:id",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  mealProviderController.getASingleMealProvider
);
router.patch(
  "/updateInfo",
  auth(USER_ROLE.mealProvider),
  validateRequest(mealProviderValidation.updateMealProviderValidationSchema),
  mealProviderController.updateData
);
export const mealProviderRoute = router;
