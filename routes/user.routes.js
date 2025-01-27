import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  signUpUser,
  signUpVet,
  signUpSeller,
  loginUser,
  logoutUser,
  // getUser,
  // getUserId,
  updateUserId,
  // refreshAccessToken,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/auth/sign-up/").post(signUpUser);
router.route("/auth/vet/sign-up/").post(signUpVet);
router.route("/auth/seller/sign-up/").post(signUpSeller);

router.route("/login").post(loginUser);
router.route("/logout").post(isLoggedIn, logoutUser);

/**
 will be considering it at a later point of time

 router.route("/u/:user_Name").get(getUser);
 router.route("/u/:user_id").get(getUserId);
 router.route("/token/refresh").post(refreshAccessToken);

 **/

// updating the user by id
router.route("/update/:user_id").put(isLoggedIn, updateUserId);

export default router;
