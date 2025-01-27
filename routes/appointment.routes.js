import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createAppointment,
  searchVets,
  getAppointmentsByVet,
  getAppointmentsByClient,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
  getAllVets,
} from "../controllers/appointment.controller.js";

const router = Router();

//getting all vets
router.route("/getallvets").get(isLoggedIn,getAllVets);

router.route("/").post(isLoggedIn, createAppointment);



router.route("/search/vets").get(searchVets);

router.route("/vet").get(isLoggedIn, getAppointmentsByVet);

router.route("/client").get(isLoggedIn, getAppointmentsByClient);

router.route("/:appointmentId/approve").put(isLoggedIn, approveAppointment);

router.route("/:appointmentId/reject").put(isLoggedIn, rejectAppointment);

router.route("/:appointmentId/complete").put(isLoggedIn, completeAppointment);

export default router;
