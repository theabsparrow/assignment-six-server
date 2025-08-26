import { Router } from "express";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import validateRequest from "../../middlewire/validateRequest";
import { orderValidation } from "./order.validation";
import { orderController } from "./order.controller";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();
router.post(
  "/place-order/:id",
  auth(USER_ROLE.customer),
  validateRequest(orderValidation.orderValidationSchema),
  orderController.createOrder
);
router.get(
  "/myOrders",
  authRefesh(
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.admin,
    USER_ROLE.superAdmin
  ),
  orderController.getMyOrder
);
router.get(
  "/single-order/:id",
  authRefesh(
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.admin,
    USER_ROLE.superAdmin
  ),
  orderController.getASingleOrder
);
router.patch(
  "/change-status/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  validateRequest(orderValidation.changeOrderStatusValidationSchema),
  orderController.changeOrderStatus
);
router.patch(
  "/update-deliveryCount/:id",
  auth(USER_ROLE.admin, USER_ROLE.mealProvider, USER_ROLE.superAdmin),
  orderController.updateDeliveryCount
);
router.delete(
  "/delete-order/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider,
    USER_ROLE.superAdmin
  ),
  orderController.deleteOrder
);
export const orderRoute = router;
