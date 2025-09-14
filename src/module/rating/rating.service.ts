/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Customer } from "../customer/customer.model";
import { TRating, TUpdateRating } from "./rating.interface";
import { Meal } from "../meal/meal.model";
import { Rating } from "./rating.model";
import mongoose from "mongoose";
import { User } from "../user/user.model";
import { Order } from "../order/order.model";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLE } from "../user/user.const";
import { MealProvider } from "../mealProvider/mealProvider.model";
import QueryBuilder from "../../builder/QueryBuilder";

const addRating = async ({
  payload,
  userId,
  id,
}: {
  payload: TRating;
  userId: string;
  id: string;
}) => {
  // user verification
  const isUSerExists = await User.findById(userId).select("verifiedWithEmail");
  if (!isUSerExists || !isUSerExists?.verifiedWithEmail) {
    throw new AppError(StatusCodes.BAD_REQUEST, "verify your email at first");
  }
  const isCustomerExist = await Customer.findOne({
    user: isUSerExists?._id,
  }).select("name");
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not matched");
  }
  // order verification
  const isOrderExists = await Order.findById(id).select(
    "mealId isDeleted status orderType isActive deliveredCount"
  );
  if (!isOrderExists || isOrderExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "order data not found");
  }
  // meal verification
  const isMealExists = await Meal.findById(isOrderExists?.mealId).select(
    "title isDeleted "
  );
  if (!isMealExists || isMealExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not matched");
  }

  if (isOrderExists?.orderType === "once") {
    const alreadyrated = await Rating.findOne({
      userId: isCustomerExist?._id,
      orderId: isOrderExists?._id,
    });
    if (alreadyrated) {
      throw new AppError(StatusCodes.BAD_REQUEST, "you can`t rate again");
    }
    if (isOrderExists?.status !== "Delivered") {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "you can rate the meal after the delivery"
      );
    }
  } else if (isOrderExists.orderType === "regular") {
    if (isOrderExists.status !== "Delivered") {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "the order is not deliveried yet"
      );
    }
    if (!payload?.deliveryNumber) {
      payload.deliveryNumber = isOrderExists?.deliveredCount as number;
    }
    const alreadyRated = await Rating.findOne({
      userId: isCustomerExist._id,
      orderId: isOrderExists._id,
      deliveryNumber: payload.deliveryNumber,
    });
    if (alreadyRated) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "You already rated this delivery"
      );
    }
  }

  payload.mealId = isMealExists?._id;
  payload.orderId = isOrderExists?._id;
  payload.userId = isCustomerExist?._id;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const ratingResult = await Rating.create([payload], { session });
    if (!ratingResult.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
    }
    const allRatings = await Rating.find({
      mealId: isMealExists?._id,
      isDeleted: false,
    }).session(session);
    if (!allRatings.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
    }
    const totalRatings = allRatings.reduce(
      (acc, item) => acc + item?.rating,
      0
    );
    const avarageRating = Number(
      (totalRatings / allRatings?.length).toFixed(1)
    );

    const result = await Meal.findByIdAndUpdate(
      isMealExists?._id,
      { avarageRating: avarageRating, $inc: { ratingCount: 1 } },
      { session, new: true, runValidators: true }
    );
    if (!result) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const removeRating = async (id: string, user: JwtPayload) => {
  const { userId, userRole } = user;
  // rating verification
  const isRatingExists = await Rating.findById(id).select(
    "userId mealId isDeleted"
  );
  if (!isRatingExists || isRatingExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "rating data not found");
  }
  // meal verification
  const isMealExists = await Meal.findById(isRatingExists?.mealId).select(
    "title isDeleted owner"
  );
  if (!isMealExists || isMealExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not found");
  }

  let userInfo = null;
  // customer verification
  if (userRole === USER_ROLE.customer) {
    userInfo = await Customer.findOne({
      user: userId,
    }).select("name");
    if (!userInfo) {
      throw new AppError(StatusCodes.NOT_FOUND, "user data not matched");
    }
    if (userInfo._id.toString() !== isRatingExists.userId.toString()) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are unauthorized");
    }
  }
  // meal provider verification
  if (userRole === USER_ROLE.mealProvider) {
    userInfo = await MealProvider.findOne({
      user: userId,
    }).select("name");
    if (!userInfo) {
      throw new AppError(StatusCodes.NOT_FOUND, "user data not matched");
    }
    if (userInfo._id.toString() !== isMealExists.owner.toString()) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are unauthorized");
    }
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deleteRating = await Rating.findByIdAndUpdate(
      isRatingExists?._id,
      { isDeleted: true },
      {
        session,
        new: true,
        runValidators: true,
      }
    );
    if (!deleteRating) {
      throw new AppError(StatusCodes.BAD_REQUEST, "failed to delete rating");
    }

    const allRatings = await Rating.find({
      mealId: isMealExists?._id,
      isDeleted: false,
    }).session(session);
    if (!allRatings.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to remove rating");
    }
    const totalRatings = allRatings.reduce(
      (acc, item) => acc + item?.rating,
      0
    );
    const avarageRating = Number(
      (totalRatings / allRatings?.length).toFixed(1)
    );
    const result = await Meal.findByIdAndUpdate(
      isMealExists?._id,
      { rating: avarageRating, $inc: { ratingCount: -1 } },
      { session, new: true, runValidators: true }
    );
    if (!result) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to remove rating");
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const getMyFeedbacks = async (id: string, query: Record<string, unknown>) => {
  const isCustomerExist = await Customer.findOne({ user: id }).select("name");
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not found");
  }
  const filter: Record<string, unknown> = {};
  filter.userId = isCustomerExist?._id;
  filter.isDeleted = false;
  query = {
    ...query,
    fields: "-deliveryNumber, -isDeleted, -updatedAt -userId",
    ...filter,
  };
  const ratingQuery = new QueryBuilder(Rating.find(), query)
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await ratingQuery.modelQuery.populate({
    path: "mealId",
    select: "title imageUrl",
  });
  const meta = await ratingQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const totalFeedback = await Rating.countDocuments({
    userId: isCustomerExist?._id,
    isDeleted: false,
  });
  return { meta, result, totalFeedback };
};

const updateMyFeedback = async ({
  userId,
  id,
  payload,
}: {
  userId: string;
  id: string;
  payload: Partial<TUpdateRating>;
}) => {
  const isFeedbackExists = await Rating.findById(id).select(
    "isDeleted userId mealId"
  );
  if (!isFeedbackExists || isFeedbackExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "feedback does not exists");
  }
  const isCustomerExists = await Customer.findOne({ user: userId }).select(
    "name"
  );
  if (!isCustomerExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not found");
  }
  if (isCustomerExists._id.toString() !== isFeedbackExists.userId.toString()) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "you can`t update this");
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    let result;
    if (payload?.rating) {
      result = await Rating.findByIdAndUpdate(id, payload, {
        session,
        new: true,
        runValidators: true,
      });
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "failed to update the feedback info"
        );
      }
      const allRatings = await Rating.find({
        mealId: isFeedbackExists?.mealId,
        isDeleted: false,
      }).session(session);
      if (!allRatings.length) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
      }
      const totalRatings = allRatings.reduce(
        (acc, item) => acc + item?.rating,
        0
      );
      const avarageRating = Number(
        (totalRatings / allRatings?.length).toFixed(1)
      );
      const RatingResult = await Meal.findByIdAndUpdate(
        isFeedbackExists?.mealId,
        { avarageRating: avarageRating },
        { session, new: true, runValidators: true }
      );
      if (!RatingResult) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
      }
    } else {
      result = await Rating.findByIdAndUpdate(id, payload, {
        session,
        new: true,
        runValidators: true,
      });
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "failed to update the feedback info"
        );
      }
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

export const ratingService = {
  addRating,
  removeRating,
  getMyFeedbacks,
  updateMyFeedback,
};
