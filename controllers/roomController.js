const { Room } = require('../models');
const { sequelize } = require('../models')
require('dotenv').config();

exports.allRooms = async (req, res, next) => {
  try {
    const roomList = await Room.findAll();
    res.status(200).json({
      roomList
    })
  } catch (err) {
    next(err)
  }
}