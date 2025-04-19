import config from "../config";
import { USER_ROLE } from "../module/user/user.const";
import { User } from "../module/user/user.model";

type TSUperadmin = {
  email: string;
  phone: string;
  password: string;
  role: string;
};
const superAdmin: TSUperadmin = {
  email: config.super_admin_email as string,
  phone: config.super_admin_phone as string,
  password: config.super_admin_password as string,
  role: USER_ROLE.superAdmin,
};

const seedSuperAdmin = async () => {
  const isSuperAdminExists = await User.findOne({ role: USER_ROLE.superAdmin });
  if (!isSuperAdminExists) {
    await User.create(superAdmin);
  }
};

export default seedSuperAdmin;
