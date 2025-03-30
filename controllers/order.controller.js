import orderModel from "../models/order.models.js";
import userModel from "../models/user.models.js";
import productModel from "../models/product.models.js";
import petModel from "../models/pet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//createSingleOrder
const createSingleOrder = asyncHandler(async (req, res, next) => {
  const {
    user,
    seller,
    productId,

    itemType,
    quantity = 1,
    shipping_Address,
    billing_Address,
    price,
    delivery_Cost = 0,
    payment_Method,

  } = req.body;

  // 1️⃣ Validate required fields
  if (
    !user ||
    // !seller ||
    !productId ||
    !itemType ||
    !shipping_Address ||
    !billing_Address ||
    price === undefined ||
    !payment_Method
  ) {
    return next(new ApiError("Missing required fields", 400));
  }

  // Check if user and seller exist
  const buyer = await userModel.findById(user);
  // const sellerExists = await userModel.findById(seller);

  if (!buyer) return next(new ApiError("User not found", 404));
  // if (!sellerExists) return next(new ApiError("Seller not found", 404));

  // 3️ Validate product or pet based on itemType
  let itemData;

  if (itemType === "Product") {
    itemData = await productModel.findById(productId);
  } else if (itemType === "Pet") {
    itemData = await petModel.findById(productId);
  } else {
    return next(new ApiError("Invalid item type", 400));
  }

  if (!itemData) {
    return next(new ApiError(`${itemType} not found`, 404));
  }

  // 4️ Calculate total order value (product price * quantity + delivery cost)
  const totalPrice = price * quantity;
  const total_Order_Value = totalPrice + delivery_Cost;

  // 5️ Create a new order with cart structure
  const newOrder = await orderModel.create({
    user,
    // seller,

    cart: [
      {
        itemType,
        item: productId,
        seller:seller,
        quantity,
      },
    ],
    shipping_Address,
    billing_Address,
    price: totalPrice,
    delivery_Cost,
    total_Order_Value,
    payment_Method,

    order_Time: new Date(),
  });

  // 6️ Return the response
  res.status(201).json(new ApiResponse(201, "Single order created successfully", newOrder));
});

const createSingleOrderOnline = asyncHandler(async (req, res, next) => {
  const {
    user,
    seller,
    productId,
    itemType,
    quantity = 1,
    status = "Confirmed",
    shipping_Address,
    billing_Address,
    price,
    delivery_Cost = 0,
    payment_Method,
    payment_Id
  } = req.body;

  // 1️⃣ Validate required fields
  if (
    !user ||
    // !seller ||
    !productId ||
    !itemType ||
    !shipping_Address ||
    !billing_Address ||
    price === undefined || !payment_Id ||
    !payment_Method
  ) {
    return next(new ApiError("Missing required fields", 400));
  }

  // Check if user and seller exist
  const buyer = await userModel.findById(user);
  // const sellerExists = await userModel.findById(seller);

  if (!buyer) return next(new ApiError("User not found", 404));
  // if (!sellerExists) return next(new ApiError("Seller not found", 404));

  // 3️ Validate product or pet based on itemType
  let itemData;

  if (itemType === "Product") {
    itemData = await productModel.findById(productId);
  } else if (itemType === "Pet") {
    itemData = await petModel.findById(productId);
  } else {
    return next(new ApiError("Invalid item type", 400));
  }

  if (!itemData) {
    return next(new ApiError(`${itemType} not found`, 404));
  }

  // 4️ Calculate total order value (product price * quantity + delivery cost)
  const totalPrice = price * quantity;
  const total_Order_Value = totalPrice + delivery_Cost;

  // 5️ Create a new order with cart structure
  try {
    const newOrder = await orderModel.create({
      user,
      // seller,
      status,
      cart: [
        {
          itemType,
          item: productId,
          quantity,
          seller:seller
        },
      ],
      shipping_Address,
      billing_Address,
      price: totalPrice,
      delivery_Cost,
      total_Order_Value,
      payment_Method,
      payment_Id,
      order_Time: new Date(),
    });

    // 6️ Return the response
    res.status(201).json(new ApiResponse(201, "Single order created successfully", newOrder));
  } catch (error) {
    console.error("Order creation failed:", error);
    return next(new ApiError("Order creation failed", 500));
  }

});

const createOrder = asyncHandler(async (req, res, next) => {
  const {
    user,
    seller,
    cart,
    shipping_Address,
    billing_Address,
    price,
    delivery_Cost,
  } = req.body;

  // 1. Validate required fields
  if (
    !user ||
    !seller ||
    !cart ||
    !shipping_Address ||
    !billing_Address ||
    price === undefined
  ) {
    return res.status(400).json(new ApiError("Missing required fields", 400));
  }

  // 2. Validate cart
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json(new ApiError("Cart cannot be empty", 400));
  }

  for (const item of cart) {
    if (!item.itemType || !["Product", "Pet"].includes(item.itemType)) {
      return res.status(400).json(new ApiError("Invalid cart item type", 400));
    }
    if (!item.item || !item.quantity || item.quantity <= 0) {
      return res
        .status(400)
        .json(new ApiError("Invalid cart item or quantity", 400));
    }

    // Check if referenced item exists
    const referencedItem = await productModel.findById(item.item);
    if (!referencedItem) {
      return res
        .status(400)
        .json(new ApiError(`Item with ID ${item.item} not found`, 404));
    }

    // Check stock availability
    if (referencedItem.stock < item.quantity) {
      return next(
        new res.status(400).json(
          `Insufficient stock for item with ID ${item.item}`,
          400
        )
      );
    }
  }

  // 3. Verify user and seller exist
  const buyer = await userModel.findById(user);
  const sellerExists = await userModel.findById(seller);

  if (!buyer) {
    return next(new ApiError("User not found", 404));
  }
  if (!sellerExists) {
    return next(new ApiError("Seller not found", 404));
  }

  // 4. Calculate total order value
  const total_Order_Value = price + (delivery_Cost || 0);

  // 5. Create the order
  const newOrder = await orderModel.create({
    user,
    seller,
    cart,
    shipping_Address,
    billing_Address,
    price,
    delivery_Cost,
    total_Order_Value,
    order_Time: new Date(),
  });

  // 6. Respond with the created order
  res
    .status(201)
    .json(new ApiResponse(201, "Order created successfully", newOrder));
});

const confirmOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findById(orderId);
  if (!order) {
    return res.status(404).json(new ApiError("Order not found", 404));
  }

  if (order.status !== "Pending") {
    return res
      .status(400)
      .json(new ApiError("Only pending orders can be confirmed", 400));
  }

  order.status = "Confirmed";
  order.orders_Confirmed = true;
  order.shipment_Time = new Date();

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Order confirmed successfully", order));
});

const cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { userId } = req.body;

  const order = await orderModel.findById(orderId);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  if (order.isOrderCanceled) {
    return next(new ApiError("Order has already been canceled", 400));
  }

  // Check authorization
  if (
    !order.user.equals(userId) &&
    (!order.seller || !order.seller.equals(userId))
  ) {
    return next(
      new ApiError("You are not authorized to cancel this order", 403)
    );
  }

  // Apply cancellation fee if order is confirmed and shipment has started
  if (order.status === "Confirmed" && order.shipment_Time) {
    order.cancellation_Fees = order.total_Order_Value * 0.3;
  }

  order.status = "Cancelled";
  order.orders_Cancelled = true;
  order.cancellation_Time = new Date();

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Order canceled successfully", order));
});

const completeOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findById(orderId);
  if (!order) {
    return res.status(404).json(new ApiError("Order not found", 404));
  }

  if (order.status !== "Confirmed") {
    return res
      .status(400)
      .json(new ApiError("Only confirmed orders can be completed", 400));
  }

  order.status = "Delivered";
  order.orders_Completed = true;
  order.delivery_Time = new Date();

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Order completed successfully", order));
});

const getApprovedOrdersUsers = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const orders = await orderModel.find({ user: userId, status: "Delivered" });
  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json(new ApiError("No approved orders found for this user", 404));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Approved orders retrieved successfully", orders)
    );
});

const getRejectedOrdersUsers = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const orders = await orderModel.find({ user: userId, status: "Rejected" });
  if (!orders || orders.length === 0) {
    return next(new ApiError("No rejected orders found for this user", 404));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Rejected orders retrieved successfully", orders)
    );
});

const getCanceledOrderUsers = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const orders = await orderModel.find({ user: userId, status: "Cancelled" });
  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json(new ApiError("No canceled orders found for this user", 404));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Canceled orders retrieved successfully", orders)
    );
});

const getConfirmedOrderUsers = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const orders = await orderModel.find({ user: userId, status: "Confirmed" });
  if (!orders || orders.length === 0) {
    return next(new ApiError("No confirmed orders found for this user", 404));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Confirmed orders retrieved successfully", orders)
    );
});

const getConfirmedOrderSeller = asyncHandler();
const getCanceledOrderSeller = asyncHandler();
const gettingItemsNeedingApproval = asyncHandler();
const handleItems = asyncHandler();

const getOrdersByUser = async (req, res) => {
  const { userId } = req.body

  try {
    // Check if user exists
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist"
      })
    }

    // Fetch orders and populate cart.item with full item details
    const orderData = await orderModel
      .find({ user: userId })
      .populate('cart.item')
      .sort({created_At:-1})

    if (!orderData || orderData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found"
      })
    }

    // Return orders with populated item details
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      order: orderData
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    })
  }
}

const getOrderBySeller = async (req, res) => {
  const { sellerId } = req.body; // Get sellerId from request body

  try {
    // Check if the seller exists
    // const user = await userModel.findById(sellerId);
    // if (!user) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Seller does not exist",
    //   });
    // }

    // Fetch orders where the seller exists in the cart
    const orderData = await orderModel
      .find({ "cart.seller": sellerId })
      .populate("user", "name email") // Populate user details (only name and email)
      .populate("cart.item") // Populate item details
      .lean(); // Convert to plain JSON for better manipulation

    // Filter only the relevant cart items for the seller
    const filteredOrders = orderData.map((order) => ({
      ...order,
      cart: order.cart.filter((cartItem) => cartItem.seller.toString() === sellerId),
    }));

    if (!filteredOrders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: filteredOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

 const getAllOrders = async (req, res) => {
  const user_Id = req.user._id;

  try {
   
    const user = await userModel.findById(user_Id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if the user is an admin
    if (user.user_Role !== "admin") {
      return res.status(403).json({ success: false, message: "User is not Admin" });
    }

    // Fetch all orders
    const response = await orderModel.find().sort({ created_At: -1 });

    // Return response based on whether orders exist
    if (response.length > 0) {
      return res.status(200).json({ success: true, message: "Orders Fetched", orders: response });
    } else {
      return res.status(200).json({ success: true, message: "No orders yet", orders: [] });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


export {
  createSingleOrder,
  createSingleOrderOnline,
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderBySeller,
  confirmOrder,
  completeOrder,
  cancelOrder,
  getApprovedOrdersUsers,
  getRejectedOrdersUsers,
  getConfirmedOrderUsers,
  getCanceledOrderUsers,
  getConfirmedOrderSeller,
  getCanceledOrderSeller,
  gettingItemsNeedingApproval,
  handleItems,

};
