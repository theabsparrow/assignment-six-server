import mongoose from "mongoose";
import { TErrorSource, TValidationError } from "../interface/error";
import { StatusCodes } from "http-status-codes";

const handleCastError = (err: mongoose.Error.CastError): TValidationError => {
  const errorSource: TErrorSource = [
    {
      path: err?.path,
      message: err?.message,
    },
  ];
  const statusCode = StatusCodes.BAD_REQUEST;
  const message = "Invalid ID";
  return {
    statusCode,
    message,
    errorSource,
  };
};
export default handleCastError;
