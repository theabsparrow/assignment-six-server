/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import { TErrorSource, TValidationError } from "../interface/error";

const handleDuplicateError = (err: any): TValidationError => {
  const match = err.message.match(/"([^*]*)"/);
  const extractedMessage = match && match[1];
  const errorSource: TErrorSource = [
    {
      path: "",
      message: `${extractedMessage} is already exist`,
    },
  ];
  const statusCode = StatusCodes.CONFLICT;
  const message = "duplicate key error";
  return {
    statusCode,
    message,
    errorSource,
  };
};
export default handleDuplicateError;
