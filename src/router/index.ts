import { Router } from "express";
import { userRoute } from "../module/user/user.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
