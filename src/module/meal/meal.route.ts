import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { mealValidation } from "./meal.validation";
import { mealController } from "./meal.controller";

const router = Router();

router.post(
  "/create-meal",
  auth(USER_ROLE.mealProvider),
  validateRequest(mealValidation.mealValidationSchema),
  mealController.createMeal
);
router.get("/get-allMeals", mealController.getAllMeals);
router.get(
  "/get-myMeals",
  auth(USER_ROLE.mealProvider),
  mealController.getMyMeals
);
router.get("/get-meal/:id", mealController.getASingleMeal);
router.patch(
  "/update-meal/:id",
  auth(USER_ROLE.mealProvider),
  validateRequest(mealValidation.updateMealValidationSchema),
  mealController.updateMealInfo
);
export const mealRoute = router;
