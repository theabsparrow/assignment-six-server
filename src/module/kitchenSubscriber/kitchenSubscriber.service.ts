/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { Kitchen } from "../kitchen/kitchen.model";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import { KitchenSubscriber } from "./kitchenSubscriber.model";
import {
  TKitchenSubscriber,
  TKitchenSybscriberQuery,
} from "./kitchenSubscriber.interface";
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
    const countSubscriber = await Kitchen.findByIdAndUpdate(
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

const getMyAllSubscription = async (
  id: string,
  query: TKitchenSybscriberQuery
) => {
  const {
    searchTerm = "",
    kitchenType,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const matchConditions: Record<string, any> = {
    user: new mongoose.Types.ObjectId(id),
  };

  const searchConditions =
    searchTerm.trim() !== ""
      ? { "kitchen.kitchenName": { $regex: searchTerm, $options: "i" } }
      : {};

  const sortCondition: Record<string, number> =
    sortBy === "createdAt" ? { createdAt: sortOrder === "asc" ? 1 : -1 } : {};

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  try {
    const results = await KitchenSubscriber.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "kitchens",
          localField: "kitchen",
          foreignField: "_id",
          as: "kitchen",
        },
      },
      { $unwind: "$kitchen" },
      {
        $match: {
          ...(kitchenType && { "kitchen.kitchenType": kitchenType }),
          ...(isActive !== undefined && {
            "kitchen.isActive": isActive === "true",
          }),
          ...searchConditions,
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          kitchen: {
            _id: 1,
            kitchenName: 1,
            kitchenType: 1,
            location: 1,
            hygieneCertified: 1,
            isActive: 1,
          },
        },
      },
      {
        $sort: sortCondition as { [key: string]: 1 | -1 },
      },
      { $skip: skip },
      { $limit: parsedLimit },
    ]);

    if (!results.length) {
      throw new AppError(StatusCodes.NOT_FOUND, "no subscription data found");
    }
    const total = await KitchenSubscriber.countDocuments({
      ...matchConditions,
      ...searchConditions,
    });
    const totalPage = Math.ceil(total / parsedLimit);
    const meta = {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPage,
    };
    return {
      meta,
      results,
    };
  } catch (err: any) {
    throw new AppError(StatusCodes.NOT_FOUND, err);
  }
};

const isSubscribedKitchen = async (kitchenId: string, userId: string) => {
  const isSubscribed = await KitchenSubscriber.findOne({
    kitchen: kitchenId,
    user: userId,
  }).select("user");
  if (!isSubscribed) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "you are not a subscriber of this kitchen"
    );
  }
  return isSubscribed;
};

export const kitchenSubscriberService = {
  addSubscriber,
  removeSubscriber,
  getMyAllSubscription,
  isSubscribedKitchen,
};
