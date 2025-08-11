import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { kitchenSubscriberController } from "./kitchenSubscriber.controller";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();
router.post(
  "/addSubscriber/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  kitchenSubscriberController.addSubscriber
);
router.delete(
  "/removeSubscriber/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  kitchenSubscriberController.removeSubscriber
);
router.get(
  "/my-subscription",
  authRefesh(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  kitchenSubscriberController.getMyAllSubscription
);

router.get(
  "/is-kitchenSubscribed/:id",
  authRefesh(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  kitchenSubscriberController.isSubscribedKitchen
);

export const kitchenSubscriberRouter = router;
