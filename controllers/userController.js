const { User, Position } = require('../models');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sequelize } = require('../models')
require('dotenv').config();

exports.me = async (req, res, next) => {
  const positionName = await Position.findOne({ where: { id: req.user.positionId } })

  try {
    res.status(200).json({
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        mobile: req.user.mobile,
        profileImg: req.user.profileImg,
        position: positionName.name
      }
    })
  } catch (err) {
    next(err)
  }
}
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email === undefined || email.trim() === '') return res.status(400).json({ message: 'email is required' })
    if (password === undefined) return res.status(400).json({ message: 'password is required' })
    // const hashedPassword = await bcrypt.hash(password, +process.env.BCRYPT_SALT)
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'user or password incorrect' });
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(400).json({ message: 'user or password incorrect' });
    const payload = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    // const token = jwt.sign(payload, 'secretkey', { expiresIn: 1000000000000000 });
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: +process.env.JWT_EXPIRES_IN }); // env file required
    res.status(200).json({ message: 'login success', token })
  } catch (err) {
    next(err)
  }
};
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, mobile, profileImg } = req.body;
    if (firstName === undefined || firstName === "") return res.status(400).json({ message: "firstname is required" });
    if (lastName === undefined || lastName === "") return res.status(400).json({ message: "lastname is required" });
    const updatedUser = await User.update({ firstName, lastName, mobile }, { where: { id: req.user.id } });
    res.status(200).json({ message: "update success", updatedUser })
  } catch (err) {
    next(err)
  }
};
exports.changePassword = async (req, res, next) => {
  const validPass = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
  const transaction = await sequelize.transaction();

  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (oldPassword === undefined) return res.status(400).json({ message: 'old password is required' })
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, req.user.password);
    if (!isOldPasswordCorrect) return res.status(400).json({ message: 'password is incorrect' })
    if (newPassword !== confirmNewPassword) return res.status(400).json({ message: 'password did not match' })
    if (!validPass.test(newPassword)) return res.status(400).json({ message: 'Valid password' })
    const hashPassword = await bcrypt.hash(newPassword, +process.env.JWT_SECRET_KEY)
    // req.user.password = hashPassword;
    // await req.user.save();
    await User.update(
      { password: hashPassword },
      { where: { id: req.user.id } },
      { transaction }
    )
    await transaction.commit();
    res.status(200).json({ message: 'password change success' })
  } catch (err) {
    await transaction.rollback();
    next(err)
  }
}
exports.protect = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    };
    if (!token) return res.status(401).json({ message: 'you are unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ where: { id: payload.id } });
    if (!user) return res.status(400).json({ message: 'user not found' });
    req.user = user;
    req.payload = payload;
    next();
  } catch (err) {
    next(err)
  }
};
exports.adminProtect = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    };
    if (!token) return res.status(401).json({ message: 'you are unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({
      where: { id: payload.id },
      include: [{
        model: Position,
      }]
    });
    if (!user) return res.status(400).json({ message: 'user not found' });
    if (user.Position.name !== 'ADMIN') return res.status(400).json({ message: 'this user is not an admin' })
    req.user = user;
    req.payload = payload;
    next();
  } catch (err) {
    next(err)
  }
};