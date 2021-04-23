module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: ['AVAILABLE', 'IN USE', 'UNAVAILABLE'],
      allowNull: false
    },
  },
    {
      underscrored: true,
      timestamps: false
    });
  Room.associate = models => {
    Room.hasOne(models.BookingList, {
      foreignKey: {
        name: 'roomId',
        allowNull: false
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    })
  }
  return Room
}