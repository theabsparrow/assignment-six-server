import { Router } from "express";
import { userRoute } from "../module/user/user.route";
import { authRoute } from "../module/auth/auth.route";
import { customerRoute } from "../module/customer/customer.route";
import { kitchenRoute } from "../module/kitchen/kitchen.route";
import { mealPlannerRoute } from "../module/mealPlanner/mealPlanner.route";
import { mealRoute } from "../module/meal/meal.route";
import { mealProviderRoute } from "../module/mealProvider/mealProvider.route";

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
    path: "/meal-provider",
    route: mealProviderRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/kitchen",
    route: kitchenRoute,
  },
  {
    path: "/mealPlanner",
    route: mealPlannerRoute,
  },
  {
    path: "/meal",
    route: mealRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
