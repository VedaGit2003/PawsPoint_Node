import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  signUpUser,
  loginUser,
  logoutUser,
  getUserId,
  updateUserId,
  refreshAccessToken,
} from "../controllers/user.controllers.js";

const router = Router();

router.route("/sign-up").post(signUpUser);
router.route("/login").post(loginUser);
router.route("/logout").post(isLoggedIn, logoutUser);

// getting user by id
router.route("/u/:user_id").get(getUserId);
// updating the user by id
router.route("/update/:user_id").put(isLoggedIn, updateUserId);
// refresh access token
router.route("/token/refresh").post(refreshAccessToken);

export default router;
