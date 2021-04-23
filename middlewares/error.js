module.exports = (err, req, res, next) => {
  console.log(err);
  console.log(err.name);
  if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ message: 'Duplicate email, please enter the new one'})
  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'You are unauthorized' })
  res.status(500).json({ message: err.message });
};