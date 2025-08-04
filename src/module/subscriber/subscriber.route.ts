import { Router } from "express";
import validateRequest from "../../middlewire/validateRequest";
import { subscriberValidation } from "./subscriber.validation";
import { subscriberController } from "./subscriber.controller";
import { authRefesh } from "../../middlewire/authRefresh";
import { USER_ROLE } from "../user/user.const";
import { auth } from "../../middlewire/auth";

const router = Router();
router.post(
  "/create",
  validateRequest(subscriberValidation.subscriberValidationSchema),
  subscriberController.createSubscriber
);
router.get(
  "/",
  authRefesh(USER_ROLE.superAdmin, USER_ROLE.admin),
  subscriberController.getAllSubscriber
);
router.patch(
  "/change-status/:id",
  validateRequest(subscriberValidation.updateSubscriberValidationschema),
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  subscriberController.updateStatus
);
router.delete(
  "/delete-subscriber/:id",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  subscriberController.deleteSubscriber
);
export const subscriberRouter = router;
