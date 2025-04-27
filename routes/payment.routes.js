import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { getKey, paymentController, paymentVerificationController, paymentVerificationControllerCart } from "../controllers/payment.controller.js";



const router = Router();

router.route("/process").post(isLoggedIn,paymentController);
router.route("/create-order").post(isLoggedIn,paymentController);
router.route("/getkey").get(getKey);
router.route('/payment-verification').post(paymentVerificationController)
router.route('/payment-verification-cart').post(paymentVerificationControllerCart)


export default router