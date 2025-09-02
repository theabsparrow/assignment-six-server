import { Router } from "express";
import { authRefesh } from "../../middlewire/authRefresh";
import { USER_ROLE } from "../user/user.const";
import { statsController } from "./statistic.controller";

const router = Router();

router.get(
  "/user-stats",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  statsController.getUsersStats
);
router.get(
  "/subscriber-stats",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  statsController.getSubsCribersStats
);
router.get(
  "/kitchen-stats",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  statsController.getKitchensStats
);
router.get(
  "/meal-stats",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  statsController.getMealStats
);
router.get(
  "/blog-stats",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  statsController.getBlogStats
);
router.get(
  "/order-stats",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  statsController.getOrderStatus
);

export const statsRouter = router;
