import { ZodError, ZodIssueCode } from "zod";
import { HttpResponse } from "../middlewares/response-message.constant";

interface FormattedError {
  [key: string]: string;
}

const formatZodErrors = (error: ZodError): FormattedError => {
  const formattedErrors: FormattedError = {};

  error.errors.forEach((err) => {
    const field = err.path[0];
    const message = err.message;
    if (err.code === ZodIssueCode.unrecognized_keys) {
      err.keys.forEach((key) => {
        formattedErrors[key] = HttpResponse.UNEXPECTED_KEY_FOUND;
      });
    } else {
      formattedErrors[field] = message;
    }
  });

  return formattedErrors;
};

export default formatZodErrors;