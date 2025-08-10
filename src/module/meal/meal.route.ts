import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { mealValidation } from "./meal.validation";
import { mealController } from "./meal.controller";
import { authRefesh } from "../../middlewire/authRefresh";
import { searchLogController } from "../searchLog/searchLog.controller";

const router = Router();

router.post(
  "/create-meal",
  auth(USER_ROLE.mealProvider),
  validateRequest(mealValidation.mealValidationSchema),
  mealController.createMeal
);
router.get("/get-allMeals", mealController.getAllMeals);
router.get(
  "/all-mealList",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  mealController.getAllMealList
);
router.get(
  "/get-myMeals",
  authRefesh(USER_ROLE.mealProvider),
  mealController.getMyMeals
);
router.get("/get-meal/:id", mealController.getASingleMeal);
router.get(
  "/get-mealProfile/:id",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  mealController.getAMealsProfile
);
router.get("/recent-meals", mealController.getSixMeals);
router.get("/meal-category", mealController.getFoodCategory);
router.get("/meal-preference", mealController.getFoodPreference);
router.get("/cuisine-type", mealController.getCuisineType);
router.get("/most-SearchedMeals", searchLogController.getSearchMeals);
router.patch(
  "/update-meal/:id",
  auth(USER_ROLE.mealProvider),
  validateRequest(mealValidation.updateMealValidationSchema),
  mealController.updateMealInfo
);
router.delete(
  "/delete-meal/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.mealProvider),
  mealController.deleteMeal
);
export const mealRoute = router;
