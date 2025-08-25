import { Router } from "express";
import validateRequest from "../../middlewire/validateRequest";
import { blogvalidation } from "./blog.validation";
import { auth } from "../../middlewire/auth";
import { USER_ROLE } from "../user/user.const";
import { blogController } from "./blog.controller";
import { authRefesh } from "../../middlewire/authRefresh";

const router = Router();

router.post(
  "/create-blog",
  validateRequest(blogvalidation.blogValidationSchema),
  auth(USER_ROLE.admin, USER_ROLE.mealProvider, USER_ROLE.customer),
  blogController.createBlog
);
router.get("/blogs", blogController.getAllBlogs);
router.get(
  "/all-blogs",
  authRefesh(USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.getAllBlogsList
);
router.get(
  "/my-blogs",
  authRefesh(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.mealProvider,
    USER_ROLE.customer
  ),
  blogController.getMyBlogs
);
router.get("/blog/:id", blogController.getASingleBlog);
router.get(
  "/blogProfile/:id",
  authRefesh(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.customer,
    USER_ROLE.mealProvider
  ),
  blogController.getBlogProfile
);
router.patch(
  "/blog/:id",
  validateRequest(blogvalidation.updateBlogValidationSchema),
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.mealProvider,
    USER_ROLE.customer
  ),
  blogController.updateBlog
);
router.patch(
  "/blog-status/:id",
  validateRequest(blogvalidation.updateBlogStatusValidationSchema),
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.updateBlogStatus
);
router.delete(
  "/blog/:id",
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.mealProvider,
    USER_ROLE.customer
  ),
  blogController.deleteBlog
);
export const blogRouter = router;
