import { Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;
  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }
  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: "i" },
        })),
      });
    }
    return this;
  }
  filter() {
    const queryObject = { ...this.query };
    const excludeFields = [
      "searchTerm",
      "sort",
      "sortOrder",
      "limit",
      "page",
      "fields",
      "minPrice",
      "maxPrice",
    ];
    excludeFields.forEach((element) => delete queryObject[element]);

    if (this.query.minPrice && this.query.maxPrice) {
      const minPrice = Number(this.query.minPrice);
      const maxPrice = Number(this.query.maxPrice);
      queryObject.price = { $gte: minPrice, $lte: maxPrice };
    }
    this.modelQuery = this.modelQuery.find(queryObject);
    return this;
  }
  sort() {
    const sortOrder = this?.query?.sortOrder === "desc" ? "-" : "";
    const sortingData = this?.query?.sort
      ? (this.query.sort as string).split(",")?.join(" ")
      : "-createdAt";
    let sort;
    sort = sortingData || "createdAt";
    if (sortOrder) {
      sort = `${sortOrder}${sortingData}`;
    }
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }
  paginateQuery() {
    const limit = Number(this?.query?.limit) || 0;
    const page = Number(this?.query?.page) || 1;
    const skip = (page - 1) * limit || 0;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const compulsoryFields = "";
    const fields = this?.query?.fields
      ? (this?.query?.fields as string).split(",").join(" ")
      : compulsoryFields;
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 20;
    const totalPage = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
