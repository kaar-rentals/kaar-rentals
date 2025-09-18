const express = require("express");
const auth = require("../middleware/authMiddleware");
const { createBooking, getBookings } = require("../controllers/bookingController");

const router = express.Router();

router.post("/", auth(), createBooking);
router.get("/", auth(), getBookings);

module.exports = router;
