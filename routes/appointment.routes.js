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
  requestConsultation,
  withdrawRequest,
  getOnlineAppoinmentByUser,
  getOnlineAppointmentByVet,
  updateOnlineAppointmentByVet,
  createOfflineAppointment,
  getMyOfflineAppointments,
  updateOfflineAppointment,
  getAllAppointments,
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





//online consultancy
router.post('/request/:vetId',isLoggedIn, requestConsultation);
router.delete('/request/:vetId',isLoggedIn, withdrawRequest);
router.get('/accepted-appointments',isLoggedIn, getOnlineAppoinmentByUser);

//by vet
router.get('/get-all-appointment-vet',isLoggedIn,getOnlineAppointmentByVet)
router.put('/update-appointment/:appointmentId',isLoggedIn,updateOnlineAppointmentByVet)


// ==============offline=================
router.post('/offline/create-appointment',isLoggedIn,createOfflineAppointment)
router.post('/offline/myAppointments',isLoggedIn,getMyOfflineAppointments)
router.put('/offline/updateAppointment/:appointmentId',isLoggedIn,updateOfflineAppointment)
router.get('/offline/getAllAppointment',isLoggedIn,getAllAppointments)

export default router;
