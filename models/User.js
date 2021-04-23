module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: DataTypes.STRING,
    profileImg: DataTypes.STRING,
    isActive: {
      type: DataTypes.ENUM,
      values: ['ACTIVATE', 'DEACTIVATE'],
      allowNull: false
    }
  },
    {
      underscored: true,
      timestamps: false,
    }
  );
  User.associate = models => {
    User.hasMany(models.BookingList, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
    User.belongsTo(models.Position, {
      foreignKey: {
        name: 'positionId',
        allowNull: false
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    })
  }
  return User
}