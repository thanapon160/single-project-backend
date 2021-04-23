module.exports = (sequelize, DataTypes) => {
  const Position = sequelize.define('Position', {
    name: {
      type: DataTypes.ENUM,
      values: ['OFFICER', 'ADMIN', 'MANAGER', 'SENIOR', 'CEO', 'CTO'],
      allowNull: false
    }
  },
    {
      underscored: true,
      timestamps: false,
    });
  Position.associate = models => {
    Position.hasOne(models.User, {
      foreignKey: {
        name: 'positionId',
        allowNull: false
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    })
  }
  return Position
}