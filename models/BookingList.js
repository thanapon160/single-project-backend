module.exports = (sequelize, DataTypes) => {
  const BookingList = sequelize.define('BookingList', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: DataTypes.STRING,
    participantNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
    {
      underscored: true
    });
  BookingList.associate = models => {
    BookingList.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT'
    });
    BookingList.belongsTo(models.Room, {
      foreignKey: {
        name: 'roomId',
        allowNull: false
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT'
    });
  }
  return BookingList
}