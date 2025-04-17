import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Customer } from "./customer.model";
import { USER_ROLE } from "../user/user.const";
import QueryBuilder from "../../builder/QueryBuilder";
import { searchableFields } from "./customer.const";

const getAllCustomer = async (role: string, query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  if (role === USER_ROLE.admin) {
    filter.isDeleted = false;
    filter.role = USER_ROLE.customer;
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

  return { meta, result };
};

const getASingleCustomer = async (id: string) => {
  const result = await Customer.findById(id).populate("user");
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "faild to retrive info");
  }
  return result;
};

export const customerService = {
  getAllCustomer,
  getASingleCustomer,
};
