/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Customer } from "./customer.model";
import { USER_ROLE } from "../user/user.const";
import QueryBuilder from "../../builder/QueryBuilder";
import { searchableFields } from "./customer.const";
import { TExtendedCustomer } from "./customer.interface";
import mongoose from "mongoose";
import { calculateAge, capitalizeFirstWord } from "../user/user.utills";

const getAllCustomer = async (role: string, query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  if (role === USER_ROLE.admin) {
    filter.isDeleted = false;
  }
  query = { ...query, ...filter };

  const usersQuery = new QueryBuilder(Customer.find().populate("user"), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginateQuery()
    .fields();

  const result = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
};

const getASingleCustomer = async (id: string) => {
  const result = await Customer.findById(id).populate("user");
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "faild to retrive info");
  }
  return result;
};

const updateCustomerInfo = async (
  id: string,
  payload: Partial<TExtendedCustomer>
) => {
  const isExist = await Customer.findOne({ user: id });
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found to update");
  }
  if (payload?.dateOfBirth) {
    const age = calculateAge(payload.dateOfBirth);
    if (age < 18) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "You must be at least 18 years old."
      );
    }
  }
  if (payload?.name) {
    payload.name = capitalizeFirstWord(payload.name);
  }
  const { addAllergies, removeAllergies, ...remainingData } = payload;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updateBasicData = await Customer.findOneAndUpdate(
      { user: id },
      remainingData,
      { session, new: true, runValidators: true }
    );
    if (!updateBasicData) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
    }

    if (removeAllergies && removeAllergies.length > 0) {
      const updated = await Customer.findOneAndUpdate(
        { user: id },
        { $pull: { allergies: { $in: removeAllergies } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }

    if (addAllergies && addAllergies.length > 0) {
      const updated = await Customer.findOneAndUpdate(
        { user: id },
        { $addToSet: { allergies: { $each: addAllergies } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    await session.commitTransaction();
    await session.endSession();
    const updateData = await Customer.findOne({ user: id }).populate("user");
    return updateData;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

export const customerService = {
  getAllCustomer,
  getASingleCustomer,
  updateCustomerInfo,
};
