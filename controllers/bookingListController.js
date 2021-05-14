const { BookingList, Room, User } = require('../models')
const { sequelize } = require('../models')
const moment = require('moment')
require('dotenv').config();

exports.getAllBookingList = async (req, res, next) => {
  try {
    const result = await BookingList.findAll({
      attributes: ['id', 'title', 'description', 'startDateTime', 'endDateTime', 'participantNumber', 'status', 'userId'],
      include: [{ model: Room, attributes: ['name'] }, { model: User, attributes: ['firstName', 'lastName'] }]
    });
    res.status(200).json({ message: 'request success', result })
  } catch (err) {
    next(err)
  }
}
exports.getBookingListByUserId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await BookingList.findAll({
      where: { userId: id },
      include: { model: Room, attributes: ['name'] },
      attributes: ['id', 'title', 'description', 'startDateTime', 'endDateTime', 'participantNumber', 'status'],
    })
    res.status(200).json({ message: 'request success', result })
  } catch (err) {
    next(err)
  }
}
exports.getBookingListByBookingId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await BookingList.findOne({
      where: { id },
      include: { model: Room, attributes: ['name'] },
      attributes: ['id', 'title', 'description', 'startDateTime', 'endDateTime', 'participantNumber', 'status'],
    })
    res.status(200).json({ message: 'request success', result })
  } catch (err) {
    next(err)
  }
}
exports.addBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, description, participantNumber, room, startDateTime, endDateTime } = req.body;
    if (!title || title === "") return res.status(400).json({ message: "Title is required" })
    if (!room || room === "") return res.status(400).json({ message: 'Room is required' })
    const foundRoom = await Room.findOne({ where: { name: room } });
    const bookingListByRoom = await BookingList.findAll({ where: { roomId: foundRoom.id, status: 'Ready' } });
    // validate overlap time ***
    // get date, start time and end time from new booking in YYYY-MM-DD formart
    const addDate = moment(startDateTime).format("YYYY-MM-DD")
    const startTime = moment(startDateTime).format("HH:mm")
    const endTime = moment(endDateTime).format("HH:mm")
    // map to get datavalues from all booking list
    const filterRoom = await bookingListByRoom.map(item => item.dataValues)
    // filter again to get data by compare with date that you want to book
    const filterRoomByDate = await filterRoom.filter(item => addDate === moment(item.startDateTime).format("YYYY-MM-DD"))
    
    // find overlap time
    // const timeOverlap = filterRoomByDate.filter(item => moment(item.startDateTime).format("HH:mm") < startTime && startTime < moment(item.endDateTime).format("HH:mm"))
    // console.log("startoverlap", timeOverlap)
    // const timeOverlap = filterRoomByDate.filter(item => moment(item.startDateTime).format("HH:mm") < endTime && endTime < moment(item.endDateTime).format("HH:mm"))
    // console.log("endTimeOverlap", timeOverlap)

    // condition
    let timeOverlap = false
    const conflictTime = () => {
      if ((filterRoomByDate.filter(item => moment(item.startDateTime).format("HH:mm") === startTime && endTime === moment(item.endDateTime).format("HH:mm"))).length !== 0) {
        return timeOverlap = true
      }
      else if ((filterRoomByDate.filter(item => moment(item.startDateTime).format("HH:mm") < startTime && startTime < moment(item.endDateTime).format("HH:mm")).length !== 0)) {
        return timeOverlap = true
      }
      else if ((filterRoomByDate.filter(item => moment(item.startDateTime).format("HH:mm") < endTime && endTime < moment(item.endDateTime).format("HH:mm"))).length !== 0) {
        return timeOverlap = true
      }
      else return timeOverlap = false
    }
    conflictTime()
    if (timeOverlap === true) return res.status(400).json({ message: "This range of time is already booked, please select new one" })
    if (!startDateTime || startDateTime === "") return res.status(400).json({ message: "Start time is required" })
    if (!startDateTime || endDateTime === "") return res.status(400).json({ message: "End time is required" })

    const addedBooking = await BookingList.create(
      { title, description, participantNumber, roomId: foundRoom.id, startDateTime, endDateTime, status: 'Ready', userId: req.user.id },
      { transaction }
    );
    await transaction.commit();
    res.status(201).json({ message: 'add succesfully', addedBooking });
  } catch (err) {
    await transaction.rollback();
    next(err)
  }
}
exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    await BookingList.update({ status: 'Deactivate' }, { where: { id } });
    res.status(204).json({ message: 'delete success' });
  } catch (err) {
    next(err)
  }
}
exports.updateBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params
    const { title, description, participantNumber, room, startDateTime, endDateTime } = req.body;
    const foundRoom = await Room.findOne({ where: { name: req.body.room } });
    const updatedBooking = await BookingList.update(
      { title, description, participantNumber, roomId: foundRoom.id, startDateTime, endDateTime },
      { where: { id } },
      { transaction });
    await transaction.commit();
    res.status(200).json({ message: "update success", updatedBooking })
  } catch (err) {
    await transaction.rollback();
    next(err)
  }
}