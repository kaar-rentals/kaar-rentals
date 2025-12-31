const express = require("express");
const auth = require("../middleware/authMiddleware");
const { asHandler } = require("./_routeHelpers");
const { createBooking, getBookings } = require("../controllers/bookingController");

const router = express.Router();

router.post("/", auth(), asHandler(createBooking));
router.get("/", auth(), asHandler(getBookings));

module.exports = router;
