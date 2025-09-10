import { Router } from "express";
import { authRefesh } from "../../middlewire/authRefresh";
import { USER_ROLE } from "../user/user.const";
import { notificationController } from "./notification.controller";
import { auth } from "../../middlewire/auth";

const router = Router();

router.get(
  "/my-notification",
  authRefesh(USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.mealProvider),
  notificationController.getMyNotifications
);

router.patch(
  "/read-notification/:id",
  auth(USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.mealProvider),
  notificationController.updateNotification
);

router.delete(
  "/delete-notification",
  auth(USER_ROLE.customer, USER_ROLE.admin, USER_ROLE.mealProvider),
  notificationController.deleteNotification
);
export const notificationRouter = router;
