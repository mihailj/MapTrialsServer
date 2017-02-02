/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_users', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('normal','admin'),
      allowNull: false,
      defaultValue: "normal"
    },
    score: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'mt_users'
  });
};
