import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { mealProviderController } from "./mealProvider.controller";

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

export const mealProviderRouter = router;
