type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: TMeta;
  data: T;
};

export type TemailOrder = {
  customerName: string;
  customerEmail: string;
  orderDate: string;
  mealName: string;
  totalAmount: number;
  kitchenName: string;
};

export type TemailOrderStatus = {
  customerName: string;
  mealName: string;
  orderStatus: string;
  orderDate: string;
  totalAmount: number;
  kitchenName: string;
  customerEmail: string;
};
