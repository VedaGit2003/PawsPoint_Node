import validator from "validator";
import { ApiError } from "./ApiError.js";

const validateFields = (fields, req, res) => {
  // Check if fields is an array
  const fieldArray = Array.isArray(fields) ? fields : [fields];

  // Check if any field is an empty string
  if (fieldArray.some((field) => field === "")) {
    return res.json(
      new ApiError(
        400,
        "All fields are required",
        "InputError: All fields are required",
      ),
    );
  }
};

const validateEmails = (email, req, res) => {
  if (!validator.isEmail(email)) {
    return res.json(
      new ApiError(
        400,
        "Email is not valid",
        "ValidationError: Email validation failed",
      ),
    );
  }
};

const validateRoles = (userRole, req, res) => {
  const validRoles = ["consumer", "seller", "vet"];
  if (!validRoles.includes(userRole)) {
    return res.json(
      new ApiError(
        400,
        "Invalid user role",
        "ValidationError: Invalid user role",
      ),
    );
  }
};

const validateSellers = (sellers, req, res) => {
  if (sellers.user_Role !== "seller") {
    return res.json(
      new ApiError(
        400,
        "Seller does not exist",
        "NotFoundError: Seller does not exist",
      ),
    );
  }
};

export { validateFields, validateEmails, validateRoles, validateSellers };
