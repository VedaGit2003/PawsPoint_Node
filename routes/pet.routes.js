import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  getAllPets,
  createPets,
  getPet,
  updatePet,
  deletePet,
  searchPets,
  getPetsBySellerId,
  createPetOrder,
  getUserOrders,
  getAllPetOrders,
  getUserMobileOrders,
} from "../controllers/pet.controller.js";

const router = Router();

router.route("/").get(getAllPets);

router.route("/new").post(isLoggedIn, createPets);

router
  .route("/p/:pet_id")
  .get(getPet)
  .put(isLoggedIn, updatePet)
  .delete(isLoggedIn, deletePet);

// search pets by keywords
router.route("/search").get(searchPets);

router.route("/order").post(isLoggedIn,createPetOrder);
router.route("/getUserOrders").get(isLoggedIn,getUserOrders);
router.route("/getAllPetOrders").get(isLoggedIn,getAllPetOrders);
router.route("/getUserOrdersMobile").post(isLoggedIn,getUserMobileOrders);


// search pets by seller id
router.route("/seller/:sellerId").get(getPetsBySellerId);

export default router;
