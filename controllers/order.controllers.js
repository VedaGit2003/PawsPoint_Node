import orderModel from "../models/order.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createOrder = asyncHandler();
const confirmOrder = asyncHandler();
const completeOrder = asyncHandler();
const cancelOrder = asyncHandler();
const getApprovedOrdersUsers = asyncHandler();
const getRejectedOrdersUsers = asyncHandler();
const getConfirmedOrderUsers = asyncHandler();
const getCanceledOrderUsers = asyncHandler();
const getConfirmedOrderSeller = asyncHandler();
const getCanceledOrderSeller = asyncHandler();
const handleItems = asyncHandler();

export {
  createOrder,
  confirmOrder,
  completeOrder,
  cancelOrder,
  getApprovedOrdersUsers,
  getRejectedOrdersUsers,
  getConfirmedOrderUsers,
  getCanceledOrderUsers,
  getConfirmedOrderSeller,
  getCanceledOrderSeller,
  handleItems,
};
