import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { getKey, paymentController, paymentVerificationController } from "../controllers/payment.controller.js";



const router = Router();

router.route("/process").post(isLoggedIn,paymentController);
router.route("/getkey").get(getKey);
router.route('/payment-verification').post(paymentVerificationController)


export default router