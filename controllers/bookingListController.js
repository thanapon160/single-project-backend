const { BookingList, Room } = require('../models')
const { sequelize } = require('../models')
const moment = require('moment')
require('dotenv').config();

exports.getAllBookingList = async (req, res, next) => {
  try {
    const result = await BookingList.findAll({
      attributes: ['id', 'title', 'description', 'startDateTime', 'endDateTime', 'participantNumber', 'status'],
      include: { model: Room, attributes: ['name'] },
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
    if (!startDateTime || startDateTime === "") return res.status(400).json({ message: "Start date time is required" })
    if (!endDateTime || endDateTime === "") return res.status(400).json({ message: "End date time is required" })
    const foundRoom = await Room.findOne({ where: { name: room } });
    const bookingListByRoom = await BookingList.findAll({ where: {roomId: foundRoom.id}})
    
    console.log('start', moment(startDateTime).valueOf())
    console.log('end', moment(endDateTime).valueOf())
    
    for (key of bookingListByRoom) {
      console.log('startkey',moment(key.startDateTime).valueOf())
    console.log('endkey', moment(key.endDateTime).valueOf())
      if (moment(key.startDateTime).valueOf() < moment(startDateTime).valueOf() || moment(key.endDateTime).valueOf() > moment(endDateTime).valueOf()) return res.status(400).json({message: 'Cannot book , Please enter available time'})
    }
    const addedBooking = await BookingList.create(
      { title, description, participantNumber, roomId: foundRoom.id, startDateTime, endDateTime, status: 'Ready', userId: 1 },
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
      { title, description, participantNumber, roomId: foundRoom.id , startDateTime, endDateTime },
      { where: { id } },
      { transaction });
    await transaction.commit();
    res.status(200).json({ message: "update success", updatedBooking })
  } catch (err) {
    await transaction.rollback();
    next(err)
  }
}