import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { mealValidation } from "./meal.validation";
import { mealController } from "./meal.controller";

const router = Router();

router.post(
  "/create-meal",
  auth(USER_ROLE["meal provider"]),
  validateRequest(mealValidation.mealValidationSchema),
  mealController.createMeal
);
router.get("/get-allMeals", mealController.getAllMeals);
router.get(
  "/get-meal/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE["meal provider"],
    USER_ROLE.superAdmin
  ),
  mealController.getASingleMeal
);
export const mealRoute = router;
