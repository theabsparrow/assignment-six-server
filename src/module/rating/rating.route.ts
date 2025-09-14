import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { ratingValidation } from "./rating.validation";
import { ratingController } from "./rating.controller";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();
router.post(
  "/add-rating/:id",
  auth(USER_ROLE.customer),
  validateRequest(ratingValidation.ratingValidationSchema),
  ratingController.addRating
);
router.delete(
  "/remove-rating/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  ratingController.removeRating
);
router.get(
  "/my-feedbacks",
  authRefesh(USER_ROLE.customer),
  ratingController.getMyFeedbacks
);
router.patch(
  "/update-feedback/:id",
  auth(USER_ROLE.customer),
  validateRequest(ratingValidation.updateRatingValidationSchema),
  ratingController.updateMyFeedback
);
export const ratingRoute = router;
