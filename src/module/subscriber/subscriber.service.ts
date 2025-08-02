import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TSubscriber } from "./subscriber.interface";
import { Subscriber } from "./subscriber.model";
import { subscriptionEmailTemplate } from "../../utills/subscriptionEmail";
import { sendEmail } from "../../utills/sendEmail";
import QueryBuilder from "../../builder/QueryBuilder";

const createSubscriber = async (payload: TSubscriber) => {
  const isExists = await Subscriber.findOne({ email: payload.email }).select(
    "email"
  );
  if (!isExists) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this email is already subscribed"
    );
  }
  const result = await Subscriber.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "failed to subscribe");
  }
  const html = subscriptionEmailTemplate();
  await sendEmail({
    to: payload?.email,
    html,
    subject: "🎉 You're Successfully Subscribed to Daily Dish!",
    text: "Thanks for subscribing to Daily Dish. You'll now receive recipe ideas and trending meals!",
  });
  return result;
};

const getAllSubscriber = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  query = { ...query, ...filter };
  const getAllSubscribersQuery = new QueryBuilder(Subscriber.find(), query)
    .search(["email"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await getAllSubscribersQuery.modelQuery;
  const meta = await getAllSubscribersQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
};

const updateStatus = async (id: string, payload: Partial<TSubscriber>) => {
  const isExists = await Subscriber.findById(id).select("email");
  if (!isExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const result = await Subscriber.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "failed to update data");
  }
  return result;
};

const deleteSubscriber = async (id: string) => {
  const isExists = await Subscriber.findById(id).select("email");
  if (!isExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const result = await Subscriber.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "failed to update data");
  }
  return null;
};

export const subscriberService = {
  createSubscriber,
  getAllSubscriber,
  updateStatus,
  deleteSubscriber,
};
