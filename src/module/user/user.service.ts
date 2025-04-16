/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TCustomer } from "../customer/customer.interface";
import { TUSer } from "./user.interface";
import { User } from "./user.model";
import { calculateAge, capitalizeFirstWord } from "./user.utills";
import mongoose from "mongoose";
import { Customer } from "../customer/customer.model";
import { createToken } from "../auth/auth.utills";
import config from "../../config";
import { USER_ROLE } from "./user.const";
import { TMealProvider } from "../mealProvider/mealProvider.interface";

const createCustomer = async (userData: TUSer, customer: TCustomer) => {
  const isEmailExists = await User.findOne({
    email: userData?.email,
    isDeleted: false,
  });
  if (isEmailExists) {
    throw new AppError(StatusCodes.CONFLICT, "this email is already in used");
  }

  const isPhoneExists = await User.findOne({
    phoneNumber: userData?.phone,
    isDeleted: false,
  });
  if (isPhoneExists) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this phone number is already in used"
    );
  }
  const age = calculateAge(customer.dateOfBirth);
  if (age < 18) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "You must be at least 18 years old."
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    userData.role = USER_ROLE.customer;
    const userInfo = await User.create([userData], { session });
    if (!userInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const user = userInfo[0];
    const jwtPayload = {
      userId: user?._id.toString(),
      userRole: user?.role,
    };
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );
    customer.user = user?._id;
    customer.email = user?.email;
    customer.name = capitalizeFirstWord(customer?.name);
    const customerInfo = await Customer.create([customer], { session });
    if (!customerInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    await session.commitTransaction();
    await session.endSession();
    const customerData = customerInfo[0];
    return { accessToken, refreshToken, customerData };
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const createMealProvider = async (
  userData: TUSer,
  mealProvider: TMealProvider
) => {
  const isEmailExists = await User.findOne({
    email: userData?.email,
    isDeleted: false,
  });
  if (isEmailExists) {
    throw new AppError(StatusCodes.CONFLICT, "this email is already in used");
  }

  const isPhoneExists = await User.findOne({
    phoneNumber: userData?.phone,
    isDeleted: false,
  });
  if (isPhoneExists) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this phone number is already in used"
    );
  }
  const age = calculateAge(mealProvider?.dateOfBirth);
  if (age < 18) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "You must be at least 18 years old."
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    userData.role = USER_ROLE.customer;
    const userInfo = await User.create([userData], { session });
    if (!userInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const user = userInfo[0];
    const jwtPayload = {
      userId: user?._id.toString(),
      userRole: user?.role,
    };
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );
    mealProvider.user = user?._id;
    mealProvider.email = user?.email;
    mealProvider.name = capitalizeFirstWord(mealProvider?.name);
    const mealProviderInfo = await Customer.create([mealProvider], { session });
    if (!mealProviderInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    await session.commitTransaction();
    await session.endSession();
    const customerData = mealProviderInfo[0];
    return { accessToken, refreshToken, customerData };
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};
export const userService = {
  createCustomer,
  createMealProvider,
};
