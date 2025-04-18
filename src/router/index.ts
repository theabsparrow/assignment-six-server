import { Router } from "express";
import { userRoute } from "../module/user/user.route";
import { authRoute } from "../module/auth/auth.route";
import { customerRoute } from "../module/customer/customer.route";
import { kitchenRoute } from "../module/kitchen/kitchen.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/customer",
    route: customerRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/kitchen",
    route: kitchenRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
