const { User, Position } = require('../models');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models')
require('dotenv').config();

exports.addUser = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  const validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  try {
    const { email, password, firstName, lastName, confirmPassword, position, mobile } = req.body
    console.log(req.body)
    if (email === undefined || email === "" || email.trim() === "") return res.status(400).json({ message: "email is required" })
    if (!(validEmail.test(email))) return res.status(400).json({ message: "Valid email address" })
    if (firstName === undefined || firstName === "") return res.status(400).json({ message: "firstname is required" });
    if (lastName === undefined || lastName === "") return res.status(400).json({ message: "lastname is required" });
    const foundPosition = await Position.findOne({ where: { name: req.body.position } });
    if (position !== 'CEO' && position !== 'OFFICER' && position !== 'ADMIN' && position !== 'MANAGER' && position !== 'SENIOR' && position !== 'CTO') return res.status(400).json({ message: "position not match, please enter new one" })
    if (password !== confirmPassword) return res.status(400).json({ message: 'password did not match' })

    const hashedPassword = await bcrypt.hash(password, +process.env.BCRYPT_SALT)
    const user = await User.create(
      {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        positionId: foundPosition.id,
        mobile,
        isActive: 'ACTIVATE'
      },
      { transaction }
    );
    const payload = { id: user.id, email, firstName, lastName, position, mobile };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: +process.env.JWT_EXPIRES_IN })
    await transaction.commit();
    res.status(201).json({ message: 'resgister succesfully', token });
  } catch (err) {
    await transaction.rollback();
    next(err)
  }
};
exports.userList = async (req, res, next) => {
  try {
    const userList = await User.findAll({
      order: [['firstName', 'ASC']],
      include: { model: Position, attributes: ['name',] },
    });
    // const result = (JSON.parse(JSON.stringify(userList))).map(({firstName, lastName, email, mobile, profileImg, positionId, Position}) => {
    //   console.log((JSON.parse(JSON.stringify(userList))))
    //   return {firstName, lastName, email, mobile, profileImg, positionId, Position}
    // });
    const result = userList.map(user => {
      delete user.dataValues.password
      delete user.dataValues.profileImg
      return user;
    })
    res.status(200).json({ message: 'request success', result })
  } catch (err) {
    next(err)
  }
};
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.update({ isActive: 'DEACTIVATE' }, { where: { id } })
    res.status(204).json({ message: 'delete success' })
  } catch (err) {
    next(err)
  }
};
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, mobile, position } = req.body;
    const foundPosition = await Position.findOne({ where: { name: req.body.position } });
    if (firstName === undefined || firstName === "") return res.status(400).json({ message: "firstname is required" });
    if (lastName === undefined || lastName === "") return res.status(400).json({ message: "lastname is required" });
    const updatedUser = await User.update({ firstName, lastName, mobile, positionId: foundPosition.id }, { where: { id } });
    res.status(200).json({ message: "update success", updatedUser })
  } catch (err) {
    next(err)
  }
};
exports.position = async (req, res, next) => {
  try {
    const position = await Position.findAll()
    res.status(200).json({ position })
  } catch (err) {
    next(err)
  }
}