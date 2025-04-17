import { Router } from "express";
import { userRoute } from "../module/user/user.route";
import { authRoute } from "../module/auth/auth.route";
import { customerRouter } from "../module/customer/customer.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/customer",
    route: customerRouter,
  },
  {
    path: "/auth",
    route: authRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
