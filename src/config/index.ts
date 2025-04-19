import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh1_secret: process.env.JWT_REFRESH1_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  jwt_refresh1_expires_in: process.env.JWT_REFRESH1_EXPIRES_IN,
  email_app_password: process.env.EMAIL_APP_PASSWORD,
  email_sent_from: process.env.EMAIL_SENT_FROM,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
};
