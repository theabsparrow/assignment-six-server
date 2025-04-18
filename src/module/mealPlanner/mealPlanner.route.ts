import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { mealPlannerValidation } from "./mealPlanner.validation";
import { mealPlannerController } from "./mealPlanner.controller";

const router = Router();
router.post(
  "/create-mealPlanner",
  auth(USER_ROLE.customer),
  validateRequest(mealPlannerValidation.mealPlannerValidationSchema),
  mealPlannerController.createMealPlanner
);
router.get(
  "/get-myPlans",
  auth(USER_ROLE.customer),
  mealPlannerController.getMyPlans
);
router.get(
  "/get-myPlan/:id",
  auth(USER_ROLE.customer),
  mealPlannerController.getASingleMyPlan
);
router.patch(
  "/update-plan",
  auth(USER_ROLE.customer),
  validateRequest(mealPlannerValidation.updateMealPlannerValidationSchema),
  mealPlannerController.updateMealPlanner
);
export const mealPlannerRoute = router;
