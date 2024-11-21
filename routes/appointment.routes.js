import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createAppointment,
  searchVets,
  getAppointmentByVet,
  getAppointmentByClient,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
} from "../controllers/appointment.controllers.js";

const router = Router();

router.route("/").post(isLoggedIn, createAppointment);

router.route("/search/vets").get(searchVets);

router.route("/vet").get(isLoggedIn, getAppointmentByVet);

router.route("/client").get(isLoggedIn, getAppointmentByClient);

router.route("/:appointmentId/approve").put(isLoggedIn, approveAppointment);

router.route("/:appointmentId/reject").put(isLoggedIn, rejectAppointment);

router.route("/:appointmentId/complete").put(isLoggedIn, completeAppointment);

export default router;
