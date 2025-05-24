import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { mealPlannerValidation } from "./mealPlanner.validation";
import { mealPlannerController } from "./mealPlanner.controller";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();
router.post(
  "/create-mealPlanner",
  auth(USER_ROLE.customer),
  validateRequest(mealPlannerValidation.mealPlannerValidationSchema),
  mealPlannerController.createMealPlanner
);
router.get(
  "/get-myPlans",
  authRefesh(USER_ROLE.customer),
  mealPlannerController.getMyPlans
);
router.get(
  "/get-myPlan/:id",
  authRefesh(USER_ROLE.customer),
  mealPlannerController.getASingleMyPlan
);
router.patch(
  "/update-plan/:id",
  auth(USER_ROLE.customer),
  validateRequest(mealPlannerValidation.updateMealPlannerValidationSchema),
  mealPlannerController.updateMealPlanner
);
export const mealPlannerRoute = router;
