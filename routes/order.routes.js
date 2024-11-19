import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

import {
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
    gettingItemsNeedingApproval,
    handleItems
} from "../controllers/order.controllers.js";

const router = Router();

router
.route("/")
.post(isLoggedIn, createOrder);

router
.route("/:orderId/confirm")
.put(isLoggedIn, confirmOrder);

router
.route("/:orderId/complete")
.post(isLoggedIn, completeOrder);

router
.route("/:orderId/cancel")
.put(isLoggedIn, cancelOrder);

// getting orders (rejected, canceled, approved, completed) based on user_id
router
.route("/u/orders/approved")
.get(isLoggedIn, getApprovedOrdersUsers);

router
.route("/u/orders/rejected")
.get(isLoggedIn, getRejectedOrdersUsers);

router
.route("/u/orders/confirmed")
.get(isLoggedIn, getConfirmedOrderUsers);

router
.route("/u/orders/canceled")
get(isLoggedIn, getCanceledOrderUsers);

// getting orders (confirmed, confirmed) based on seller_id
router
.route("/s/orders/confirmed")
.get(isLoggedIn, getConfirmedOrderSeller);

router
.route("/s/orders/canceled")
.get(isLoggedIn, getCanceledOrderSeller);

// getting all the items from the queue for approval based on seller_id
// waiting for the confirmation
router
.route("/s/items-need-approvals")
.get(isLoggedIn, gettingItemsNeedingApproval);

// handle items -> what the fuck it's doing -> providing the overall status of the item with it's maxDelivery time and other stuff
// from where we're getting the itemId -> need to be tested
router
.route("/:orderId/handleItem/:itemId/user")
.put(isLoggedIn, handleItems);

export default router;