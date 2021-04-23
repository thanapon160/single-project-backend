const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const BookingListController = require('../controllers/bookingListController')

router.get('/',  userController.protect,BookingListController.getAllBookingList)
router.get('/:id', userController.protect, BookingListController.getBookingListByUserId)
router.get('/booking/:id', BookingListController.getBookingListByBookingId)
router.post('/',  userController.protect,BookingListController.addBooking)
router.put('/:id', userController.protect, BookingListController.deleteBooking)
router.put('/edit/:id', userController.protect,BookingListController.updateBooking)
module.exports = router;