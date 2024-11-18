import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { 
    getAllPets,
    createPets,
    getPet,
    updatePet,
    deletePet,
    searchPets,
    getPetsBySellerId
 } from "../controllers/pet.controllers.js";

const router = Router();

router
.route("/")
.get(getAllPets)
.post(isLoggedIn, createPets);

router
.route("/u/:user_id")
.get(getPet)
.put(isLoggedIn, updatePet)
.delete(isLoggedIn, deletePet);

// search pets by keywords
router
.route("/search")
.get(searchPets);

// search pets by seller id
router
.route("/seller/:sellerId")
.get(getPetsBySellerId);


export default router;
