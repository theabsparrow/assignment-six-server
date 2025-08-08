/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { Kitchen } from "../kitchen/kitchen.model";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import { KitchenSubscriber } from "./kitchenSubscriber.model";
import { TKitchenSubscriber } from "./kitchenSubscriber.interface";
import mongoose from "mongoose";

const addSubscriber = async (user: JwtPayload, id: string) => {
  const { userId, userRole } = user;
  const isKitchenExists = await Kitchen.findById(id).select(
    "kitchenName isDeleted isActive"
  );
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "This kitchen does not exists");
  }
  if (isKitchenExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "This kitchen does not exists");
  }
  if (!isKitchenExists?.isActive) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "this kitchen subscription is blocked now"
    );
  }
  const isAlreadySubscribed = await KitchenSubscriber.findOne({
    user: userId,
    kitchen: isKitchenExists?._id,
  });
  if (isAlreadySubscribed) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "you have already subscribed this kitchen"
    );
  }
  const payload: TKitchenSubscriber = {
    kitchen: isKitchenExists?._id,
    user: userId,
    subscriberRole: userRole,
  };
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const addSubscriber = await KitchenSubscriber.create([payload], {
      session,
    });
    if (!addSubscriber.length) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to subscribe this kitchen"
      );
    }
    const countSubscriber = Kitchen.findByIdAndUpdate(
      isKitchenExists?._id,
      { $inc: { subscriber: 1 } },
      { new: true, session, runValidators: true }
    );

    if (!countSubscriber) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to subscribe this kitchen"
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return addSubscriber[0];
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const removeSubscriber = async (id: string, userId: string) => {
  const isKitchenExists = await Kitchen.findById(id).select(
    "kitchenName isDeleted isActive"
  );
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "This kitchen does not exists");
  }
  if (isKitchenExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "This kitchen does not exists");
  }
  if (!isKitchenExists?.isActive) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "this kitchen subscription is blocked now"
    );
  }
  const isAlreadySubscribed = await KitchenSubscriber.findOne({
    user: userId,
    kitchen: isKitchenExists?._id,
  });
  if (!isAlreadySubscribed) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "you didn`t subscribe this kitchen yet"
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deleteSubscriber = await KitchenSubscriber.findOneAndDelete(
      {
        kitchen: isKitchenExists?._id,
        user: userId,
      },
      { session, new: true, runValidators: true }
    );
    if (!deleteSubscriber) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to unsubscribe this kitchen"
      );
    }
    const decreaseSubscriber = await Kitchen.findByIdAndUpdate(
      isKitchenExists?._id,
      { $inc: { subscriber: -1 } },
      { new: true, session, runValidators: true }
    );
    if (!decreaseSubscriber) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to unsubscribe this kitchen"
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      err.message || "Transaction failed"
    );
  }
};

const getMyAllSubscription = async (id: string) => {
  const getMySubscription = await KitchenSubscriber.find({ user: id }).populate(
    {
      path: "kitchen",
      select:
        "kitchenName kitchenType location hygieneCertified subscriber isActive",
    }
  );
  if (getMySubscription.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "no subscription data found");
  }
  return getMySubscription;
};

export const kitchenSubscriberService = {
  addSubscriber,
  removeSubscriber,
  getMyAllSubscription,
};
