import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { ratingValidation } from "./rating.validation";
import { ratingController } from "./rating.controller";

const router = Router();
router.post(
  "/add-rating/:id",
  auth(USER_ROLE.customer),
  validateRequest(ratingValidation.ratingValidationSchema),
  ratingController.addRating
);

export const ratingRoute = router;
