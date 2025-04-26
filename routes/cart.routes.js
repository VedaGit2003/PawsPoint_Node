import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller.js";

const router=Router()


router.route('/add').post(addToCart)
router.route('/getCarts/:userId').get(getCart)
router.route('/update').put(updateCartQuantity)
router.route('/removeCart').delete(removeFromCart)


export default router