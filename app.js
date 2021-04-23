require('dotenv').config();
const express = require('express')
const cors = require('cors')
const userController = require('./controllers/userController')
const roomController = require('./controllers/roomController')
const adminController = require('./controllers/adminController')
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const bookingListRoute = require('./routes/bookingListRoute')
const errorMiddleware = require('./middlewares/error') 
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/login', userController.login);
app.use('/users', userRoute);
app.use('/admin', adminRoute);
app.use('/booking-lists', bookingListRoute);
app.use('/rooms', roomController.allRooms);
app.use('/positions', adminController.position)

app.use((req, res, next) => {
  res.status(400).json({ message: "path not found on this server" })
})
app.use(errorMiddleware)

// sequelize.sync({ force: false }).then(() => console.log('DB sync'))

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on port ${port}`));